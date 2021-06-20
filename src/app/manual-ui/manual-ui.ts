import { ActionService } from "../services/action.service.js";
import { HotbarLayoutDialog } from "../dialogs/hotbar-layout.dialog.js";
import { HotbarService } from "../services/hotbar.service.js";
import { KeyBindingService } from "../services/key-binding.service.js";
import { RotationHeroDialog } from "../dialogs/rotation-hero.dialog.js";
import { RotationBuilderDialog } from "../dialogs/rotation-builder.dialog.js";
import { GameDataService } from "../services/game-data.service.js";
import { GamepadService } from "../services/gamepad.service.js";
import { ActionsTraitsDialog } from "../dialogs/actions-traits.dialog.js";
import { Services } from "../interfaces.js";
import { ServiceBase } from "../services/service-base.js";
import {
  AppStateEvent,
  AppStateService
} from "../services/app-state.service.js";
import { DialogBase } from '../dialogs/dialog-base.js';
import { WidgetBase } from '../widgets/widget-base.js';
import { ContainerWidget } from '../widgets/container-widget.js';
import { ButtonWidget } from '../widgets/button-widget.js';
import {
  UserDialog
} from '../dialogs/user.dialog.js';
import { ToggleWidget } from '../widgets/toggle-widget.js';
import { ImageWidget } from '../widgets/image-widget.js';
import { TextWidget } from '../widgets/text-widget.js';
import { API } from '../api.js';
import { ModalWidget } from '../widgets/modal-widget.js';
import { User } from '../rotation-hero/interfaces.js';
import { TooltipService } from '../services/tooltip.service.js';

export class ManualUI extends WidgetBase {
  private readonly services: Partial<Services> = {};

  // Services
  private readonly actionService: ActionService;
  private readonly appStateService: AppStateService;
  private readonly gameDataService: GameDataService;
  private readonly gamepadService: GamepadService;
  private readonly hotbarService: HotbarService;
  private readonly keyBindingService: KeyBindingService;
  private readonly tooltipService: TooltipService;

  private readonly DIALOGS: ((new (services: Services) => DialogBase) & Omit<typeof DialogBase, never>)[] = [
    HotbarLayoutDialog,
    ActionsTraitsDialog,
    RotationHeroDialog,
    RotationBuilderDialog
  ];
  private readonly dialogInstances: Map<any, DialogBase> = new Map();

  private readonly toolbarWidget = new ContainerWidget('toolbar');
  private toolbarUserButton: ButtonWidget;

  private readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  // Job selection widgets
  private activeJobImageWidget: ImageWidget;
  private activeJobAbbreviationTextWidget: TextWidget;
  private jobToggleWidget: ToggleWidget;

  constructor(gameDataService: GameDataService) {
    super('manual-ui', 'div');

    // Create all the services
    this.services.actionService = new ActionService(<Services>this.services);
    this.services.appStateService = new AppStateService();
    this.services.gameDataService = gameDataService;
    this.services.gamepadService = new GamepadService(<Services>this.services);
    this.services.hotbarService = new HotbarService(<Services>this.services);
    this.services.keyBindingService = new KeyBindingService(<Services>this.services);
    this.services.tooltipService = new TooltipService();

    // Local accessors
    this.actionService = this.services.actionService;
    this.appStateService = this.services.appStateService;
    this.gameDataService = this.services.gameDataService;
    this.gamepadService = this.services.gamepadService;
    this.hotbarService = this.services.hotbarService;
    this.keyBindingService = this.services.keyBindingService;
    this.tooltipService = this.services.tooltipService;

    // Initialise services
    (<ServiceBase[]>[
      this.actionService,
      this.appStateService,
      this.gamepadService,
      this.hotbarService,
      this.keyBindingService,
      this.tooltipService
    ]).forEach((service) => service.init());

    this.createView();

    // check for activation
    this.checkForUserActivation();

    // check if user is logged in
    this.checkForLoggedInUser();

    this.appStateService.addEventListener(AppStateEvent.UserLogin, (evt: CustomEvent<User>) => {
      this.toolbarUserButton.text = evt.detail.username
    });
    this.appStateService.addEventListener(AppStateEvent.UserLogout, () => {
      this.toolbarUserButton.text = (<UserDialog>this.dialogInstances.get(UserDialog)).uiTitle;
    });
  }

  public startTicking() {
    this.tick();
  }

  private async checkForUserActivation() {
    const verificationTokenMatch = window.location.search.match(/[\?&]verify=([^&]+)/);
    history.replaceState(null, '', location.pathname + location.search.replace(/[\?&]verify=[^&]+/, '').replace(/^&/, '?'));

    if (verificationTokenMatch) {
      if (!this.UUID_REGEX.test(verificationTokenMatch[ 1 ])) {
        return this.append(new ModalWidget(new TextWidget('The verification token is not in a valid format. Did you forget to copy a character?')));
      }

      const verificationResponse = await API.verify(verificationTokenMatch[ 1 ]);

      if (verificationResponse.ok) {
        this.append(new ModalWidget(new TextWidget('Your email has been verified and you can now login.')));
      } else {
        this.append(new ModalWidget(new TextWidget(await verificationResponse.text())));
      }
    }
  }

  private async checkForLoggedInUser() {
    const user = await API.me();

    if (user && user.id) {
      this.appStateService.dispatchEvent(new CustomEvent(AppStateEvent.UserLogin, { detail: user }));
    }
  }

  private createView() {
    this.append(this.toolbarWidget);

    // Create nicer class selection here
    this.createJobSelectionView();

    // Instantiate dialogs
    this.createDialogs();
  }

  private createDialogs() {
    this.DIALOGS.forEach((dialogClass) => {
      const dialogInstance = new dialogClass(<Services>this.services);

      const toolbarButtonWidget = new ButtonWidget(
        dialogInstance.uiTitle,
        'toolbar__button',
        {
          click: () => {
            dialogInstance.toggle();
            if (dialogInstance.isVisible) {
              dialogInstance.focus();
            }
          }
        }
      );
      this.toolbarWidget.append(toolbarButtonWidget);
      this.append(dialogInstance);
      this.dialogInstances.set(dialogClass, dialogInstance);
    });

    this.createUserDialog();
  }

  private createUserDialog() {
    const userDialog = new UserDialog(<Services>this.services);
    this.append(userDialog);
    this.dialogInstances.set(UserDialog, userDialog);
    this.toolbarUserButton = new ButtonWidget(
      userDialog.uiTitle,
      'toolbar__button',
      {
        click: () => {
          userDialog.toggle();
          if (userDialog.isVisible) {
            userDialog.focus();
          }
        }
      }
    );
    this.toolbarWidget.append(this.toolbarUserButton);
  }

  private createJobSelectionView() {
    const selectedClassJob = this.gameDataService.getClassJob(this.appStateService.selectedClassJobID);
    this.activeJobImageWidget = new ImageWidget(selectedClassJob ? `https://xivapi.com${selectedClassJob.Icon}` : '', 'job-selection__active-job-image');
    this.activeJobAbbreviationTextWidget = new TextWidget(selectedClassJob ? selectedClassJob.Abbreviation : 'Select Job', 'job-selection__active-job-abbreviation', 'span');
    const activeJobContainerWidget = new ContainerWidget('job-selection__active-job', {}, [ this.activeJobImageWidget, this.activeJobAbbreviationTextWidget ]);
    const jobsContainerWidget = new ContainerWidget('job-selection__list', {});
    this.jobToggleWidget = new ToggleWidget(jobsContainerWidget, activeJobContainerWidget);

    if (!selectedClassJob) {
      this.activeJobImageWidget.hide();
    }

    jobsContainerWidget.append(
      ...this.gameDataService.getClassJobs()
        .filter(classJob => classJob.BattleClassIndex !== '-1' && classJob.Abbreviation)
        .sort((a, b) => a.Abbreviation.localeCompare(b.Abbreviation))
        .map((classJob) =>
          new ContainerWidget(
            'job-selection__list-item',
            {
              click: this.selectClassJob.bind(this, classJob.ID)
            }, [
              new ImageWidget(`https://xivapi.com${classJob.Icon}`, 'job-selection__list-item-image'),
              new TextWidget(classJob.Abbreviation, 'job-selection__list-item-abbreviation')
            ]
          )
        )
    );

    // Hide jobs container by default
    this.jobToggleWidget.hideTarget();

    this.toolbarWidget.append(this.jobToggleWidget);
    this.append(jobsContainerWidget);
  }

  private selectClassJob(classJobId: number) {
    this.appStateService.selectedClassJobID = classJobId;

    const selectedClassJob = this.gameDataService.getClassJob(this.appStateService.selectedClassJobID);
    this.activeJobImageWidget.src = selectedClassJob ? `https://xivapi.com${selectedClassJob.Icon}` : '';
    this.activeJobImageWidget.show();
    this.activeJobAbbreviationTextWidget.text = selectedClassJob ? selectedClassJob.Abbreviation : '';
    this.jobToggleWidget.hideTarget();
  }

  private tick() {
    const time = performance.now();
    this.actionService.handleTick(time);
    this.gamepadService.poll();
    this.hotbarService.crossHotbar.handleTick();
    requestAnimationFrame(this.tick.bind(this));
  }
}
