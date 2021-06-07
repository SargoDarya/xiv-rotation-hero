import { ActionManager } from "./action-manager.js";
import { HotbarLayoutDialog } from "./hotbar-layout-dialog.js";
import { HotbarManager } from "./hotbar-manager.js";
import { KeyBindingManager } from "./key-binding-manager.js";
import { createView } from "./utils.js";
import { XIVApi } from "./xiv-api.js";

export class ManualUI {

  private readonly keyBindingManager = new KeyBindingManager();
  private readonly actionManager = new ActionManager();
  private readonly hotbarManager = new HotbarManager(this.keyBindingManager, this.actionManager);
  private readonly hotbarLayoutDialog = new HotbarLayoutDialog(this.hotbarManager);
  private language: 'en' | 'de' | 'fr' | 'ja' = 'en';

  constructor() {
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
    const jobs = (await XIVApi.jobs()).Results;
    const select = document.createElement('select');
    const jobOptions = jobs
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

    toolbar.appendChild(keyBindingButton);
    toolbar.appendChild(hotbarLayoutButton);

    // Attach dialogs
    document.body.appendChild(this.hotbarLayoutDialog.viewContainer);
  }

  private async selectClassJob(id: number) {
    const job = await XIVApi.job(id);
    const actions = (await XIVApi.actionsForJob(job)).Results;

    // if (this.isManualUI) {
      // Load hotbars for class
    this.hotbarManager.autoSetActions(actions);
    //}
  }

  private tick() {
    this.actionManager.handleTick(performance.now());

    requestAnimationFrame(this.tick.bind(this));
  }
}
