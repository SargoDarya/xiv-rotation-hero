import { CommunicationLayer } from "./communication-layer.js";
export class OverlayPluginLayer extends CommunicationLayer {
    constructor() {
        super();
        this.waitForApi();
    }
    waitForApi() {
        if (!window.OverlayPluginApi || !window.OverlayPluginApi.ready) {
            setTimeout(this.waitForApi.bind(this), 300);
            return;
        }
        const q = this.queue;
        this.queue = null;
        window.__OverlayCallback = this.processEvent;
        if (q) {
            for (let [msg, resolve] of q) {
                this.sendMessage(msg, resolve);
            }
        }
    }
    callOverlayHandler(msg) {
        return new Promise((resolve) => {
            this.sendMessage(msg, (data) => {
                resolve(data === null ? null : JSON.parse(data));
            });
        });
    }
    ;
    startOverlayEvents() {
        this.eventsStarted = false;
        this.sendMessage({
            call: 'subscribe',
            events: Object.keys(this.subscribers),
        });
    }
    ;
    sendMessage(obj, cb = () => { }) {
        if (this.queue) {
            this.queue.push([obj, cb]);
        }
        else {
            window.OverlayPluginApi.callHandler(JSON.stringify(obj), cb);
        }
    }
}
