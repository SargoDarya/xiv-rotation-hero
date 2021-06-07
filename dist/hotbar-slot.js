import { createView } from "./utils.js";
const ANIM_STEPS = [
    { background: `conic-gradient(from 0deg at 50% 50%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 1) 0%, rgba(0, 0, 0, 0.53) 0%, rgba(0, 0, 0, 0.43) 99%, rgba(255, 255, 255, 1) 100%)` },
    { background: `conic-gradient(from 0deg at 50% 50%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 10%, rgba(255, 255, 255, 1) 10%, rgba(0, 0, 0, 0.53) 10%, rgba(0, 0, 0, 0.43) 99%, rgba(255, 255, 255, 1) 100%)` },
    { background: `conic-gradient(from 0deg at 50% 50%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 20%, rgba(255, 255, 255, 1) 20%, rgba(0, 0, 0, 0.53) 20%, rgba(0, 0, 0, 0.43) 99%, rgba(255, 255, 255, 1) 100%)` },
    { background: `conic-gradient(from 0deg at 50% 50%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 30%, rgba(255, 255, 255, 1) 30%, rgba(0, 0, 0, 0.53) 30%, rgba(0, 0, 0, 0.43) 99%, rgba(255, 255, 255, 1) 100%)` },
    { background: `conic-gradient(from 0deg at 50% 50%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 40%, rgba(255, 255, 255, 1) 40%, rgba(0, 0, 0, 0.53) 40%, rgba(0, 0, 0, 0.43) 99%, rgba(255, 255, 255, 1) 100%)` },
    { background: `conic-gradient(from 0deg at 50% 50%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 50%, rgba(255, 255, 255, 1) 50%, rgba(0, 0, 0, 0.53) 50%, rgba(0, 0, 0, 0.43) 99%, rgba(255, 255, 255, 1) 100%)` },
    { background: `conic-gradient(from 0deg at 50% 50%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 60%, rgba(255, 255, 255, 1) 60%, rgba(0, 0, 0, 0.53) 60%, rgba(0, 0, 0, 0.43) 99%, rgba(255, 255, 255, 1) 100%)` },
    { background: `conic-gradient(from 0deg at 50% 50%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 70%, rgba(255, 255, 255, 1) 70%, rgba(0, 0, 0, 0.53) 70%, rgba(0, 0, 0, 0.43) 99%, rgba(255, 255, 255, 1) 100%)` },
    { background: `conic-gradient(from 0deg at 50% 50%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 80%, rgba(255, 255, 255, 1) 80%, rgba(0, 0, 0, 0.53) 80%, rgba(0, 0, 0, 0.43) 99%, rgba(255, 255, 255, 1) 100%)` },
    { background: `conic-gradient(from 0deg at 50% 50%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 90%, rgba(255, 255, 255, 1) 90%, rgba(0, 0, 0, 0.53) 90%, rgba(0, 0, 0, 0.43) 99%, rgba(255, 255, 255, 1) 100%)` },
    { background: `conic-gradient(from 0deg at 50% 50%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 99%, rgba(255, 255, 255, 1) 99%, rgba(0, 0, 0, 0.53) 99%, rgba(0, 0, 0, 0.43) 99%, rgba(255, 255, 255, 1) 100%)` },
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
            this.actionCooldownView.animate(ANIM_STEPS, { duration: this._action.Recast100ms * 10 });
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
