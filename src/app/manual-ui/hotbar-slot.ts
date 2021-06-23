import { Hotbar } from "./hotbar.js";
import { Action } from "../interfaces.js";
import { WidgetBase } from '../widgets/widget-base.js';
import { ContainerWidget } from '../widgets/container-widget.js';
import { ActionWidget } from '../widgets/action-widget.js';
import { TextWidget } from '../widgets/text-widget.js';
import { KeyBindingEvent } from '../services/key-binding.service.js';
import { CooldownWidget } from '../widgets/cooldown-widget.js';

export class HotbarSlot extends WidgetBase {
  private readonly actionContainerView = new ContainerWidget('hotbar-slot__action-container');
  private readonly actionCooldownView = new CooldownWidget();
  private readonly slotKeyBindingView = new TextWidget('', 'hotbar-slot__keybinding');
  private activeActionWidget: ActionWidget | undefined;
  private lastCooldownValue: number;

  private _action?: Action;
  get action(): Action | undefined {
    return this._action;
  }
  set action(action: Action | undefined) {
    if (this.activeActionWidget) {
      this.activeActionWidget.removeSelf();
      this.activeActionWidget = undefined;
    }
    this._action = action;

    action ? this.viewContainer.classList.remove('hotbar-slot--empty') : this.viewContainer.classList.add('hotbar-slot--empty');
    if (action) {
      this.activeActionWidget = this.hotbar.services.actionService.getActionWidget(action.ID, { isHotbarAssigned: true, hotbarId: this.hotbarId, slotId: this.slotId });
      this.actionContainerView.append(this.activeActionWidget);
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
    super('hotbar-slot');

    this.createView();
    this.action = undefined;
    this.viewContainer.addEventListener('click', this.trigger.bind(this));
    this.hotbar.services.actionService.registerSlot(this);
    this.hotbar.services.actionService.addEventListener('trigger', this.updateActionState.bind(this));

    this.hotbar.services.keyBindingService.addEventListener(KeyBindingEvent.BindingRegistered, this.updateKeybindingView.bind(this));
    this.hotbar.services.keyBindingService.addEventListener(KeyBindingEvent.BindingChanged, this.updateKeybindingView.bind(this));
  }

  trigger() {
    if (this._action) {
      this.hotbar.services.actionService.triggerAction(this._action);
    }

    this.addModifier('triggered');
    setTimeout(() => {
      this.removeModifier('triggered');
    }, 100);
  }

  updateActionState(evt: CustomEvent<Action>) {
    if (!this.action) {
      return;
    }

    // Cooldown handling
    if (this.action.CooldownGroup === evt.detail.CooldownGroup) {
      this.actionCooldownView.setCooldown(evt.detail.Recast100ms * 100);
    }

    // Combo handling
    if (this.action.ActionComboTargetID) {
      if (this.action.ActionComboTargetID === evt.detail.ID) {
        // Combo started
        this.actionContainerView.addModifier('combo');
      } else if (evt.detail.PreservesCombo === 0) {
        // Combo cancelled
        this.actionContainerView.removeModifier('combo');
      }
    }
  }

  updateView() {
    // Check if action is on cooldown
    if (!this._action) {
      return;
    }

    const currentCooldown = this.hotbar.services.actionService.isActionOnCooldown(this._action);

    if (currentCooldown !== this.lastCooldownValue) {
      this.lastCooldownValue = currentCooldown;
    }
  }

  private updateKeybindingView() {
    const binding = this.hotbar.services.keyBindingService.getBinding(`Hotbar ${this.hotbarId + 1} - Slot ${this.slotId + 1}`);

    // Reset modifiers
    this.slotKeyBindingView.removeModifier('ctrl', 'shift', 'alt');

    if (binding) {
      const [ mainKey, ...modifiers ] = binding.split('+').reverse();
      this.slotKeyBindingView.addModifier(...modifiers.map(modifier => modifier.toLowerCase()));
      this.slotKeyBindingView.text = mainKey.replace('Key', '');
    } else {
      this.slotKeyBindingView.text = '';
    }
  }

  private createView() {
    this.append(
      this.actionContainerView,
      this.actionCooldownView,
      this.slotKeyBindingView
    );

    this.viewContainer.addEventListener('drop', this.onDrop.bind(this));
    this.viewContainer.addEventListener('dragover', this.onDragOver.bind(this));

    this.updateKeybindingView();
  }

  private onDragOver(evt: DragEvent) {
    const dt = (<DataTransfer>evt.dataTransfer);
    if (dt.types.includes('is-hotbar-assignable')) {
      evt.preventDefault();
      return false;
    }
  }

  private onDrop(evt: DragEvent) {
    evt.preventDefault();

    if (evt.dataTransfer) {
      const dragType = evt.dataTransfer.getData('drag-type');
      const actionId = evt.dataTransfer.getData('action-id');

      switch (dragType) {
        case 'slot-to-slot':
          const sourceHotbarId = parseInt(evt.dataTransfer.getData('hotbar-id'), 10);
          const sourceSlotId = parseInt(evt.dataTransfer.getData('slot-id'), 10);
          this.hotbar.services.hotbarService.swapHotbarActions(sourceHotbarId, sourceSlotId, this.hotbarId, this.slotId);
          break;

        case 'action':
          this.action = this.hotbar.services.gameDataService.getActionById(parseInt(actionId, 10));
          break;

        default:
          break;
      }
    }
  }
}
