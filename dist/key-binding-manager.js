export class KeyBindingManager {
    constructor() {
        this.availableBindings = {};
        this.keyBindings = {};
        this.reverseMapping = {};
        this.loadKeyBindings();
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
    handleKeyDown(evt) {
        const { code, ctrlKey, shiftKey, altKey, repeat } = evt;
        if (repeat) {
            return;
        }
        const keys = [];
        if (ctrlKey)
            keys.push('Ctrl');
        if (shiftKey)
            keys.push('Shift');
        if (altKey)
            keys.push('Alt');
        keys.push(code);
        const keyString = keys.join('+');
        if (this.keyBindings[keyString]) {
            this.availableBindings[this.keyBindings[keyString]]();
        }
    }
    registerAvailableBindings(action, keyDefault, cb) {
        this.availableBindings[action] = cb;
        if (keyDefault && !Object.values(this.keyBindings).includes(action)) {
            this.keyBindings[keyDefault] = action;
            this.reverseMapping[action] = keyDefault;
        }
    }
    loadKeyBindings() {
        let savedKeyBindings = localStorage.getItem('key-bindings');
        if (!savedKeyBindings) {
        }
        else {
            const keyBindings = JSON.parse(savedKeyBindings);
            this.keyBindings = {};
        }
    }
    saveKeyBindings() {
    }
}
