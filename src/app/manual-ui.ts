import { ActionService } from "./services/action.service.js";
import { HotbarLayoutDialog } from "./dialogs/hotbar-layout.dialog.js";
import { HotbarService } from "./services/hotbar.service.js";
import { KeyBindingService } from "./services/key-binding.service.js";
import { RotationHeroDialog } from "./dialogs/rotation-hero.dialog.js";
import { createView } from "./utils.js";
import { RotationBuilderDialog } from "./dialogs/rotation-builder.dialog.js";
import { GameDataService } from "./services/game-data.service.js";
import { GamepadService } from "./services/gamepad.service.js";
import { ActionsTraitsDialog } from "./dialogs/actions-traits.dialog.js";
import { Services } from "./interfaces.js";
import { ServiceBase } from "./services/service-base.js";
import { AppStateService } from "./services/app-state.service.js";
import { DialogBase } from './dialogs/dialog-base';
export class ManualUI extends EventTarget {

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
    RotationBuilderDialog
  ]
  private readonly hotbarLayoutDialog: HotbarLayoutDialog;
  private readonly commandsDialog: ActionsTraitsDialog;
  private readonly rotationHeroDialog: RotationHeroDialog;
  private readonly rotationBuilderDialog: RotationBuilderDialog;

  constructor(gameDataService: GameDataService) {
    super();

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
    this.rotationHeroDialog = new RotationHeroDialog(<Services>this.services);
    this.commandsDialog = new ActionsTraitsDialog(<Services>this.services);
    this.hotbarLayoutDialog = new HotbarLayoutDialog(<Services>this.services);
    this.rotationBuilderDialog = new RotationBuilderDialog(<Services>this.services);

    // Running in non-embedded mode, show more UI
    this.createManualUI();
  }

  public startTicking() {
    this.tick();
  }

  private createManualUI() {
    // Create toolbar
    const toolbar = createView('div', 'toolbar');
    document.body.appendChild(toolbar);

    // Create job selection
    const select = document.createElement('select');
    const emptyOption = document.createElement('option');
    emptyOption.label = 'Select class';
    emptyOption.value = '-1';
    select.appendChild(emptyOption);

    const jobOptions = this.gameDataService.getClassJobs()
      .filter((job) => job.BattleClassIndex !== '-1' && job.Abbreviation !== '')
      .map((job) => {
        const option = document.createElement(`option`)
        option.value = job.ID.toString();
        option.text = job.Abbreviation;
        option.selected = job.ID === this.appStateService.selectedClassJobID;
        return option;
      });
    jobOptions.forEach((option) => select.appendChild(option));
    select.addEventListener('change', () => this.selectClassJob(parseInt(select.value, 10)));
    toolbar.appendChild(select);

    // Instantiate dialogs
    this.DIALOGS.forEach((dialogClass) => {
      const dialogInstance = new dialogClass(<Services>this.services);

      const toolbarButton = <HTMLButtonElement>createView('button', 'toolbar__button');
      toolbarButton.innerText = dialogInstance.uiTitle;
      toolbarButton.addEventListener('click', () => {
        dialogInstance.toggle();
      });

      toolbar.appendChild(toolbarButton);
      document.body.appendChild(dialogInstance.viewContainer);
    });
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
