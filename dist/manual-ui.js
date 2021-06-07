import { ActionManager } from "./action-manager.js";
import { HotbarLayoutDialog } from "./hotbar-layout-dialog.js";
import { HotbarManager } from "./hotbar-manager.js";
import { KeyBindingManager } from "./key-binding-manager.js";
import { createView } from "./utils.js";
import { XIVApi } from "./xiv-api.js";
export class ManualUI {
    constructor() {
        this.keyBindingManager = new KeyBindingManager();
        this.actionManager = new ActionManager();
        this.hotbarManager = new HotbarManager(this.keyBindingManager, this.actionManager);
        this.hotbarLayoutDialog = new HotbarLayoutDialog(this.hotbarManager);
        this.language = 'en';
        this.createManualUI();
    }
    startTicking() {
        this.tick();
    }
    async createManualUI() {
        const toolbar = createView('div', 'toolbar');
        document.body.appendChild(toolbar);
        const jobs = (await XIVApi.jobs()).Results;
        const select = document.createElement('select');
        const jobOptions = jobs
            .filter((job) => job.BattleClassIndex !== '-1' && job.Abbreviation !== '')
            .map((job) => {
            const option = document.createElement(`option`);
            option.value = job.ID.toString();
            option.text = job.Abbreviation;
            return option;
        });
        jobOptions.forEach((option) => select.appendChild(option));
        select.addEventListener('change', () => this.selectClassJob(parseInt(select.value, 10)));
        toolbar.appendChild(select);
        const keyBindingButton = createView('button', 'toolbar__button--keybinding');
        keyBindingButton.innerText = 'Key Bindings';
        const hotbarLayoutButton = createView('button', 'toolbar__button--hotbar-layout');
        hotbarLayoutButton.innerText = 'Hotbar Layout';
        hotbarLayoutButton.addEventListener('click', () => {
            this.hotbarLayoutDialog.toggle();
        });
        toolbar.appendChild(keyBindingButton);
        toolbar.appendChild(hotbarLayoutButton);
        document.body.appendChild(this.hotbarLayoutDialog.viewContainer);
    }
    async selectClassJob(id) {
        const job = await XIVApi.job(id);
        const actions = (await XIVApi.actionsForJob(job)).Results;
        this.hotbarManager.autoSetActions(actions);
    }
    tick() {
        this.actionManager.handleTick(performance.now());
        requestAnimationFrame(this.tick.bind(this));
    }
}
