import { CommunicationLayer } from "./communication-layer.js";
export class WebsocketLayer extends CommunicationLayer {
    constructor(wsUrl) {
        super();
        this.wsUrl = wsUrl;
        this.ws = new WebSocket(this.wsUrl);
        this.responsePromises = {};
        this.rseqCounter = 0;
        this.connectWs();
    }
    callOverlayHandler(msg) {
        msg.rseq = this.rseqCounter++;
        return new Promise((resolve, reject) => {
            this.sendMessage(msg);
            this.responsePromises[msg.rseq] = resolve;
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
    sendMessage(obj) {
        if (this.queue) {
            this.queue.push(obj);
        }
        else {
            this.ws.send(JSON.stringify(obj));
        }
    }
    ;
    connectWs() {
        this.ws.addEventListener('error', (e) => {
            console.error(e);
        });
        this.ws.addEventListener('open', () => {
            console.log('Connected!');
            let q = this.queue;
            this.queue = null;
            if (q) {
                for (let msg of q) {
                    this.sendMessage(msg);
                }
            }
        });
        this.ws.addEventListener('message', (ev) => {
            let msg;
            try {
                msg = JSON.parse(ev.data);
            }
            catch (e) {
                console.error('Invalid message received: ', ev);
                return;
            }
            if (msg.rseq !== undefined && this.responsePromises[msg.rseq]) {
                this.responsePromises[msg.rseq](msg);
                delete this.responsePromises[msg.rseq];
            }
            else {
                this.processEvent(msg);
            }
        });
        this.ws.addEventListener('close', () => {
            this.queue = [];
            console.log('Trying to reconnect...');
            setTimeout(() => {
                this.connectWs();
            }, 300);
        });
    }
}
WebsocketLayer.WEBSOCKET_REGEX = /[\?&]OVERLAY_WS=([^&]+)/;
