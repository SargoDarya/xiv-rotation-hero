import { Hotbar, HotbarStyle } from "./hotbar.js";
export class HotbarManager {
    constructor(keyBindingManager, actionManager) {
        this.keyBindingManager = keyBindingManager;
        this.actionManager = actionManager;
        this.HOTBAR_KEYS = [
            'Digit1',
            'Digit2',
            'Digit3',
            'Digit4',
            'Digit5',
            'Digit6',
            'Digit7',
            'Digit8',
            'Digit9',
            'Digit0',
            'KeyA',
            'KeyB'
        ];
        this.hotbarSettings = this.loadSettings();
        this.constructHotbars();
    }
    constructHotbars() {
        const hotbars = [];
        for (let i = 0; i < 10; i++) {
            let keyModifier = '';
            switch (i) {
                case 1:
                    keyModifier = 'Ctrl+';
                    break;
                case 2:
                    keyModifier = 'Shift+';
                    break;
                case 3:
                    keyModifier = 'Alt+';
                    break;
            }
            const hotbar = new Hotbar(i, this, this.actionManager, this.hotbarSettings[i]);
            hotbars.push(hotbar);
            for (let k = 0; k < 12; k++) {
                this.keyBindingManager.registerAvailableBindings(`Hotbar${i + 1} Action${k + 1}`, i < 4 ? `${keyModifier}${this.HOTBAR_KEYS[k]}` : undefined, () => {
                    hotbar.trigger.call(hotbar, k);
                });
            }
        }
        this.hotbars = hotbars;
    }
    autoSetActions(actions) {
        actions.forEach((action, index) => {
            const hotbar = this.hotbars[Math.floor(index / 12)];
            const slotId = index % 12;
            hotbar.setSlotAction(slotId, action);
        });
    }
    swapHotbarActions(sourceHotbarId, sourceSlotId, targetHotbarId, targetSlotId) {
        const targetSlotAction = this.hotbars[targetHotbarId].getSlotAction(targetSlotId);
        const sourceSlotAction = this.hotbars[sourceHotbarId].getSlotAction(sourceSlotId);
        this.hotbars[targetHotbarId].setSlotAction(targetSlotId, sourceSlotAction);
        this.hotbars[sourceHotbarId].setSlotAction(sourceSlotId, targetSlotAction);
    }
    loadSettings() {
        const savedSettings = localStorage.getItem('hotbar-settings');
        if (savedSettings) {
            return JSON.parse(savedSettings);
        }
        return [
            { visible: true, hotbarStyle: HotbarStyle.Horizontal, position: [0, 0.1], scale: .8 },
            { visible: true, hotbarStyle: HotbarStyle.SplitHorizontal, position: [0, 0.15], scale: .8 },
            { visible: true, hotbarStyle: HotbarStyle.DoubleSplitHorizontal, position: [0, 0.2], scale: .8 },
            { visible: true, hotbarStyle: HotbarStyle.DoubleSplitVertical, position: [0, 0.25], scale: .8 },
            { visible: true, hotbarStyle: HotbarStyle.SplitVertical, position: [0, 0], scale: .8 },
            { visible: true, hotbarStyle: HotbarStyle.Vertical, position: [0, 0], scale: .8 },
            { visible: false, hotbarStyle: HotbarStyle.Horizontal, position: [0, 0], scale: .8 },
            { visible: false, hotbarStyle: HotbarStyle.Horizontal, position: [0, 0], scale: .8 },
            { visible: false, hotbarStyle: HotbarStyle.Horizontal, position: [0, 0], scale: .8 },
            { visible: false, hotbarStyle: HotbarStyle.Horizontal, position: [0, 0], scale: .8 }
        ];
    }
    persistSettings() {
        localStorage.setItem('hotbar-settings', JSON.stringify(this.hotbarSettings));
    }
}
