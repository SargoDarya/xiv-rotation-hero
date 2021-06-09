import { ActionService } from "./services/action.service.js";
import { HotbarLayoutDialog } from "./dialogs/hotbar-layout.dialog.js";
import { HotbarService } from "./services/hotbar.service.js";
import { KeyBindingService } from "./services/key-binding.service.js";
import { RotationHeroDialog } from "./dialogs/rotation-hero.dialog.js";
import { createView } from "./utils.js";
import { Action, Job } from "./interfaces.js";
import { ActionHistoryDialog } from "./dialogs/action-history.dialog.js";
import { GameDataService } from "./services/game-data.service.js";

export class ManualUI extends EventTarget {

  private readonly keyBindingService = new KeyBindingService();
  private readonly actionService = new ActionService();
  private readonly hotbarService = new HotbarService(this.keyBindingService, this.actionService);
  private readonly hotbarLayoutDialog = new HotbarLayoutDialog(this.hotbarService);
  private readonly rotationHeroDialog: RotationHeroDialog;
  private readonly actionHistoryDialog = new ActionHistoryDialog(this.actionService);
  private language: 'en' | 'de' | 'fr' | 'ja' = 'en';
  private actions: { [ jobId: number ]: Action[] } = {};

  constructor(private readonly gameDataService: GameDataService) {
    super();

    this.rotationHeroDialog = new RotationHeroDialog(this.gameDataService, this.actionService);

    // Running in non-embedded mode, show more UI
    this.createManualUI();
  }

  public startTicking() {
    this.tick();
  }

  private async createManualUI() {
    // Create toolbar
    const toolbar = createView('div', 'toolbar');
    document.body.appendChild(toolbar);

    // Create job selection
    const select = document.createElement('select');
    const jobOptions = this.gameDataService.getClassJobs()
      .filter((job) => job.BattleClassIndex !== '-1' && job.Abbreviation !== '')
      .map((job) => {
        const option = document.createElement(`option`)
        option.value = job.ID.toString();
        option.text = job.Abbreviation;
        return option;
      });
    jobOptions.forEach((option) => select.appendChild(option));
    select.addEventListener('change', () => this.selectClassJob(parseInt(select.value, 10)));
    toolbar.appendChild(select);

    // Create Buttons for overlays
    const keyBindingButton = <HTMLButtonElement>createView('button', 'toolbar__button--keybinding');
    keyBindingButton.innerText = 'Key Bindings';

    const hotbarLayoutButton = <HTMLButtonElement>createView('button', 'toolbar__button--hotbar-layout');
    hotbarLayoutButton.innerText = 'Hotbar Layout';
    hotbarLayoutButton.addEventListener('click', () => {
      this.hotbarLayoutDialog.toggle();
    });

    const actionHistoryButton = <HTMLButtonElement>createView('button', 'toolbar__button--action-history');
    actionHistoryButton.innerText = 'Action History';
    actionHistoryButton.addEventListener('click', () => {
      this.actionHistoryDialog.toggle();
    });

    toolbar.appendChild(keyBindingButton);
    toolbar.appendChild(hotbarLayoutButton);
    toolbar.appendChild(actionHistoryButton);

    // Attach dialogs
    document.body.appendChild(this.hotbarLayoutDialog.viewContainer);
    document.body.appendChild(this.rotationHeroDialog.viewContainer);
    document.body.appendChild(this.actionHistoryDialog.viewContainer);

    this.selectClassJob(34);
  }

  private selectClassJob(classJobId: number) {
    const actions = this.gameDataService.getActionsByClass(classJobId);
    this.hotbarService.autoSetActions(actions);
  }

  private tick() {
    this.actionService.handleTick(performance.now());
    requestAnimationFrame(this.tick.bind(this));
  }
}
