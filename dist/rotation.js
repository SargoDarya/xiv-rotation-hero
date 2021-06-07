class Rotation {
    constructor(actions) {
        this.actions = actions;
        this.currentActionIndex = 0;
    }
    execute(id) {
        if (this.actions[this.currentActionIndex].id !== id) {
            return;
        }
        this.currentActionIndex++;
    }
}
