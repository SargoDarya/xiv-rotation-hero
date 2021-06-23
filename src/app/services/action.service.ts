import { HotbarSlot } from "../manual-ui/hotbar-slot.js";
import { Action, Services } from "../interfaces.js";
import { ServiceBase } from "./service-base.js";
import {
  ActionWidget,
  ActionWidgetConfiguration
} from '../widgets/action-widget.js';

interface CooldownGroup {
  start: number;
  duration: number;
  remaining: number;
}

export class ActionService extends EventTarget implements ServiceBase {
  private cooldownGroups: { [ groupId: number ]: CooldownGroup } = {};
  private currentTime: number = performance.now();
  private actionBuffer: Action | null = null;
  private lastAction: Action | null = null;
  private comboActive: boolean;
  private hotbarSlots: HotbarSlot[] = [];

  constructor(private readonly services: Services) {
    super();
  }

  init() {}

  getActionWidget(actionId: number, configuration: Partial<ActionWidgetConfiguration> = {}) {
    const action = this.services.gameDataService.getActionById(actionId);
    return new ActionWidget(action, this.services, configuration);
  }

  registerSlot(slot: HotbarSlot): void {
    this.hotbarSlots.push(slot);
  }

  isActionOnCooldown(action: Action): number {
    return this.cooldownGroups[action.CooldownGroup] ? this.cooldownGroups[action.CooldownGroup].remaining : 0;
  }

  triggerAction(action: Action): boolean {
    if (this.cooldownGroups[ action.CooldownGroup ] &&
        this.cooldownGroups[ action.CooldownGroup ].remaining !== 0) {
      // Action not yet ready
      console.warn('Action on cooldown');
      return false;
    }

    console.log(`Triggering ${action.Name}`)
    this.cooldownGroups[ action.CooldownGroup ] = {
      start: this.currentTime,
      duration: action.Recast100ms*10,
      remaining: action.Recast100ms*10
    }

    this.lastAction = action;

    this.dispatchEvent(new CustomEvent('trigger', { detail: action, bubbles: true }));

    return true;
  }

  handleTick(time: number) {
    this.currentTime = time;

    Object.keys(this.cooldownGroups).forEach((key: any) => {
      const cg = this.cooldownGroups[ key ];
      const remaining = Math.max(cg.duration - (this.currentTime - cg.start), 0);

      if (remaining === 0) {
        delete this.cooldownGroups[key];
      } else {
        this.cooldownGroups[ key ].remaining = remaining;
      }
    });

    // Update slots
    this.hotbarSlots.forEach((slot) => slot.updateView());

    if (this.actionBuffer) {
      this.triggerAction(this.actionBuffer);
    }
  }
}
