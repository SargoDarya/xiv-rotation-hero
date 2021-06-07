export class ActionManager {
    constructor() {
        this.cooldownGroups = {};
        this.currentTime = performance.now();
        this.actionBuffer = null;
        this.lastAction = null;
        this.actions = {};
        this.hotbarSlots = [];
    }
    registerActions(actions) {
        actions.forEach((action) => {
            this.actions[action.ID] = action;
        });
    }
    registerSlot(slot) {
        this.hotbarSlots.push(slot);
    }
    isActionOnCooldown(action) {
        return this.cooldownGroups[action.CooldownGroup] ? this.cooldownGroups[action.CooldownGroup].remaining : 0;
    }
    triggerAction(action) {
        if (this.cooldownGroups[action.CooldownGroup] &&
            this.cooldownGroups[action.CooldownGroup].remaining !== 0) {
            console.warn('Action on cooldown');
            return false;
        }
        console.log(`Triggering ${action.Name}`);
        this.cooldownGroups[action.CooldownGroup] = {
            start: this.currentTime,
            duration: action.Recast100ms * 10,
            remaining: action.Recast100ms * 10
        };
        this.lastAction = action;
        return true;
    }
    handleTick(time) {
        this.currentTime = time;
        Object.keys(this.cooldownGroups).forEach((key) => {
            const cg = this.cooldownGroups[key];
            const remaining = Math.max(cg.duration - (this.currentTime - cg.start), 0);
            if (remaining === 0) {
                delete this.cooldownGroups[key];
            }
            else {
                this.cooldownGroups[key].remaining = remaining;
            }
        });
        this.hotbarSlots.forEach((slot) => slot.updateView());
        if (this.actionBuffer) {
            this.triggerAction(this.actionBuffer);
        }
    }
}
