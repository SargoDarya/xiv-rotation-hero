import { createView } from "./utils.js";
const RECAST_ANIMATION = [
    { backgroundPositionX: '0%' },
    { backgroundPositionX: '100%' }
];
export class HotbarSlot {
    constructor(hotbar, hotbarId, slotId) {
        this.hotbar = hotbar;
        this.hotbarId = hotbarId;
        this.slotId = slotId;
        this.viewContainer = createView('div', 'hotbar-slot');
        this.actionImageView = createView('div', 'hotbar-slot__action');
        this.actionCooldownView = createView('div', 'hotbar-slot__cooldown');
        this.slotKeyBindingView = createView('div', 'hotbar-slot__keybinding');
        this.createView();
        this.action = undefined;
        this.viewContainer.addEventListener('click', this.trigger.bind(this));
        this.hotbar.actionManager.registerSlot(this);
    }
    get action() {
        return this._action;
    }
    set action(action) {
        this._action = action;
        action ? this.viewContainer.classList.remove('hotbar-slot--empty') : this.viewContainer.classList.add('hotbar-slot--empty');
        if (action) {
            this.actionImageView.style.backgroundImage = `url(https://xivapi.com${action.IconHD})`;
        }
    }
    get view() {
        return this.viewContainer;
    }
    trigger() {
        if (this._action) {
            this.hotbar.actionManager.triggerAction(this._action);
            this.actionCooldownView.style.backgroundImage = `url('./assets/icona_recast_hr1.png')`;
            this.actionCooldownView.animate(RECAST_ANIMATION, { duration: this._action.Recast100ms * 10, easing: 'steps(80)' });
        }
        this.viewContainer.classList.add('hotbar-slot--triggered');
        setTimeout(() => {
            this.viewContainer.classList.remove('hotbar-slot--triggered');
        }, 100);
    }
    updateView() {
        if (!this._action) {
            return;
        }
        const currentCooldown = this.hotbar.actionManager.isActionOnCooldown(this._action);
        if (currentCooldown !== this.lastCooldownValue) {
            this.lastCooldownValue = currentCooldown;
        }
    }
    createView() {
        this.viewContainer.appendChild(this.actionImageView);
        this.viewContainer.appendChild(this.actionCooldownView);
        this.viewContainer.appendChild(this.slotKeyBindingView);
        this.actionImageView.draggable = true;
        this.slotKeyBindingView.innerText = (this.slotId + 1).toString();
        this.actionImageView.addEventListener('dragstart', this.onStartDrag.bind(this));
        this.viewContainer.addEventListener('drop', this.onDrop.bind(this));
        this.viewContainer.addEventListener('dragover', this.onDragOver.bind(this));
    }
    onStartDrag(evt) {
        if (evt.dataTransfer && this.action) {
            evt.dataTransfer.setData('dragType', 'slot-to-slot');
            evt.dataTransfer.setData('hotbarId', this.hotbarId.toString());
            evt.dataTransfer.setData('slotId', this.slotId.toString());
        }
    }
    onDragOver(evt) {
        evt.preventDefault();
    }
    onDrop(evt) {
        evt.preventDefault();
        if (evt.dataTransfer) {
            const dragType = evt.dataTransfer.getData('dragType');
            switch (dragType) {
                case 'slot-to-slot':
                    const sourceHotbarId = parseInt(evt.dataTransfer.getData('hotbarId'), 10);
                    const sourceSlotId = parseInt(evt.dataTransfer.getData('slotId'), 10);
                    this.hotbar.hotbarManager.swapHotbarActions(sourceHotbarId, sourceSlotId, this.hotbarId, this.slotId);
                default:
                    break;
            }
        }
    }
}
