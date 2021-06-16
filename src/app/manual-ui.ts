import { ActionService } from "./services/action.service.js";
import { HotbarLayoutDialog } from "./dialogs/hotbar-layout.dialog.js";
import { HotbarService } from "./services/hotbar.service.js";
import { KeyBindingService } from "./services/key-binding.service.js";
import { RotationHeroDialog } from "./dialogs/rotation-hero.dialog.js";
import { RotationBuilderDialog } from "./dialogs/rotation-builder.dialog.js";
import { GameDataService } from "./services/game-data.service.js";
import { GamepadService } from "./services/gamepad.service.js";
import { ActionsTraitsDialog } from "./dialogs/actions-traits.dialog.js";
import { Services } from "./interfaces.js";
import { ServiceBase } from "./services/service-base.js";
import { AppStateService } from "./services/app-state.service.js";
import { DialogBase } from './dialogs/dialog-base.js';
import { WidgetBase } from './widgets/widget-base.js';
import { ContainerWidget } from './widgets/container-widget.js';
import { ButtonWidget } from './widgets/button-widget.js';
import { SigninSignupDialog } from './dialogs/signin-signup.dialog.js';

export class ManualUI extends WidgetBase {
  private readonly services: Partial<Services> = {};

  // Services
  private readonly actionService: ActionService;
  private readonly appStateService: AppStateService;
  private readonly gameDataService: GameDataService;
  private readonly gamepadService: GamepadService;
  private readonly hotbarService: HotbarService;
  private readonly keyBindingService: KeyBindingService;

  private readonly DIALOGS: ((new (services: Services) => DialogBase) & Omit<typeof DialogBase, never>)[] = [
    HotbarLayoutDialog,
    ActionsTraitsDialog,
    RotationHeroDialog,
    RotationBuilderDialog,
    SigninSignupDialog
  ]

  constructor(gameDataService: GameDataService) {
    super('manual-ui', 'div');

    // Create all the services
    this.services.actionService = new ActionService(<Services>this.services);
    this.services.appStateService = new AppStateService();
    this.services.gameDataService = gameDataService;
    this.services.gamepadService = new GamepadService(<Services>this.services);
    this.services.hotbarService = new HotbarService(<Services>this.services);
    this.services.keyBindingService = new KeyBindingService(<Services>this.services);

    // Local accessors
    this.actionService = this.services.actionService;
    this.appStateService = this.services.appStateService;
    this.gameDataService = this.services.gameDataService;
    this.gamepadService = this.services.gamepadService;
    this.hotbarService = this.services.hotbarService;
    this.keyBindingService = this.services.keyBindingService;

    // Initialise services
    (<ServiceBase[]>[
      this.actionService,
      this.appStateService,
      this.gamepadService,
      this.hotbarService,
      this.keyBindingService
    ]).forEach((service) => service.init());

    // Create dialogs
    // this.rotationHeroDialog = new RotationHeroDialog(<Services>this.services);
    // this.commandsDialog = new ActionsTraitsDialog(<Services>this.services);
    // this.hotbarLayoutDialog = new HotbarLayoutDialog(<Services>this.services);
    // this.rotationBuilderDialog = new RotationBuilderDialog(<Services>this.services);

    // Running in non-embedded mode, show more UI
    this.createView();
  }

  public startTicking() {
    this.tick();
  }

  private createView() {
    const toolbarWidget = new ContainerWidget('toolbar');
    this.append(toolbarWidget);

    // Create nicer class selection here
    this.createJobSelectionView();

    // Create toolbar
    // const toolbar = createView('div', 'toolbar');
    // document.body.appendChild(toolbar);

    // Create job selection
    // const select = document.createElement('select');
    // const emptyOption = document.createElement('option');
    // emptyOption.label = 'Select class';
    // emptyOption.value = '-1';
    // select.appendChild(emptyOption);

    // const jobOptions = this.gameDataService.getClassJobs()
    //   .filter((job) => job.BattleClassIndex !== '-1' && job.Abbreviation !== '')
    //   .map((job) => {
    //     const option = document.createElement(`option`)
    //     option.value = job.ID.toString();
    //     option.text = job.Abbreviation;
    //     option.selected = job.ID === this.appStateService.selectedClassJobID;
    //     return option;
    //   });
    // jobOptions.forEach((option) => select.appendChild(option));
    // select.addEventListener('change', () => this.selectClassJob(parseInt(select.value, 10)));
    // toolbar.appendChild(select);

    // Instantiate dialogs
    this.DIALOGS.forEach((dialogClass) => {
      const dialogInstance = new dialogClass(<Services>this.services);

      const toolbarButtonWidget = new ButtonWidget(dialogInstance.uiTitle, 'toolbar__button', { click: dialogInstance.toggle.bind(dialogInstance) });
      toolbarWidget.append(toolbarButtonWidget);
      document.body.appendChild(dialogInstance.viewContainer);
    });
  }

  private createJobSelectionView() {

  }

  private selectClassJob(classJobId: number) {
    this.appStateService.selectedClassJobID = classJobId;
    localStorage.setItem('last-class-job-id', classJobId.toString());
  }

  private tick() {
    const time = performance.now();
    this.actionService.handleTick(time);
    this.gamepadService.poll();
    this.hotbarService.crossHotbar.handleTick();
    requestAnimationFrame(this.tick.bind(this));
  }
}
