import { Hotbar } from "./hotbar.js";
import { Action } from "../interfaces.js";
import { createView } from "../utils.js";

const RECAST_ANIMATION: any[] = [
  { backgroundPositionX: '0%' },
  { backgroundPositionX: '100%' }
];
export class HotbarSlot {
  private readonly viewContainer = createView('div', 'hotbar-slot');
  private readonly actionImageView = createView('div', 'hotbar-slot__action');
  private readonly actionCooldownView = createView('div', 'hotbar-slot__cooldown');
  private readonly slotKeyBindingView = createView('div', 'hotbar-slot__keybinding');
  private lastCooldownValue: number;

  private _action?: Action;
  get action(): Action | undefined {
    return this._action;
  }
  set action(action: Action | undefined) {
    this._action = action;

    action ? this.viewContainer.classList.remove('hotbar-slot--empty') : this.viewContainer.classList.add('hotbar-slot--empty');
    if (action) {
      this.actionImageView.style.backgroundImage = `url('https://xivapi.com${action.IconHD}')`;
    }
  }

  get view() {
    return this.viewContainer;
  }

  constructor(
    private readonly hotbar: Hotbar,
    private readonly hotbarId: number,
    private readonly slotId: number
  ) {
    this.createView();
    this.action = undefined;
    this.viewContainer.addEventListener('click', this.trigger.bind(this));
    this.hotbar.actionService.registerSlot(this);
    this.hotbar.actionService.addEventListener('trigger', this.updateActionState.bind(this));
  }

  trigger() {
    if (this._action) {
      this.hotbar.actionService.triggerAction(this._action);
      this.actionCooldownView.style.backgroundImage = `url('./assets/icona_recast_hr1.png')`;
      this.actionCooldownView.animate(RECAST_ANIMATION, { duration: this._action.Recast100ms * 10, easing: 'steps(80)' }).finished.then(() => {
        this.actionCooldownView.style.backgroundImage = 'none';
      });
    }

    this.viewContainer.classList.add('hotbar-slot--triggered');
    setTimeout(() => {
      this.viewContainer.classList.remove('hotbar-slot--triggered');
    }, 100);
  }

  updateActionState(evt: CustomEvent<Action>) {
    if (this.action && this.action.ActionComboTargetID) {
      if (this.action.ActionComboTargetID === evt.detail.ID) {
        // Combo started
        this.actionImageView.classList.add('hotbar-slot__action--combo');
      } else if (evt.detail.PreservesCombo === 0) {
        // Combo cancelled
        this.actionImageView.classList.remove('hotbar-slot__action--combo');
      }
    }
  }

  updateView() {
    // Check if action is on cooldown
    if (!this._action) {
      return;
    }

    const currentCooldown = this.hotbar.actionService.isActionOnCooldown(this._action);

    if (currentCooldown !== this.lastCooldownValue) {
      this.lastCooldownValue = currentCooldown;
    }
  }

  private createView() {
    this.viewContainer.appendChild(this.actionImageView);
    this.viewContainer.appendChild(this.actionCooldownView);
    this.viewContainer.appendChild(this.slotKeyBindingView);

    this.actionImageView.draggable = true;

    this.slotKeyBindingView.innerText = (this.slotId + 1).toString();

    this.actionImageView.addEventListener('dragstart', this.onStartDrag.bind(this));
    this.viewContainer.addEventListener('drop', this.onDrop.bind(this));
    this.viewContainer.addEventListener('dragover', this.onDragOver.bind(this));
  }

  private onStartDrag(evt: DragEvent) {
    if (evt.dataTransfer && this.action) {
      evt.dataTransfer.setData('dragType', 'slot-to-slot');
      evt.dataTransfer.setData('hotbarId', this.hotbarId.toString());
      evt.dataTransfer.setData('slotId', this.slotId.toString());
    }
  }

  private onDragOver(evt: DragEvent) {
    evt.preventDefault();
  }

  private onDrop(evt: DragEvent) {
    evt.preventDefault();

    if (evt.dataTransfer) {
      const dragType = evt.dataTransfer.getData('dragType');

      switch (dragType) {
        case 'slot-to-slot':
          const sourceHotbarId = parseInt(evt.dataTransfer.getData('hotbarId'), 10);
          const sourceSlotId = parseInt(evt.dataTransfer.getData('slotId'), 10);
          this.hotbar.hotbarService.swapHotbarActions(sourceHotbarId, sourceSlotId, this.hotbarId, this.slotId);
          break;

        case 'action':
          break;

        default:
          break;
      }
    }
  }
}
