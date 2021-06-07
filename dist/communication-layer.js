export class CommunicationLayer {
    constructor() {
        this.queue = [];
        this.subscribers = {};
        this.eventsStarted = false;
        window.dispatchOverlayEvent = this.processEvent;
    }
    processEvent(msg) {
        if (this.subscribers[msg.type]) {
            for (let subscriber of this.subscribers[msg.type]) {
                subscriber(msg);
            }
        }
    }
    addOverlayListener(event, cb) {
        if (this.eventsStarted && this.subscribers[event]) {
            console.warn(`A new listener for ${event} has been registered after event transmission has already begun.
Some events might have been missed and no cached values will be transmitted.
Please register your listeners before calling startOverlayEvents().`);
        }
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        this.subscribers[event].push(cb);
    }
    removeOverlayListener(event, cb) {
        if (this.subscribers[event]) {
            let list = this.subscribers[event];
            let pos = list.indexOf(cb);
            if (pos > -1)
                list.splice(pos, 1);
        }
    }
}
