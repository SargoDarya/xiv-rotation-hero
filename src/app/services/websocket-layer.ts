import { CommunicationLayer, MessageEvent } from "./communication-layer.js";

export interface SocketMessageEvent extends MessageEvent {
  rseq: number;
}

export class WebsocketLayer extends CommunicationLayer {

  public static readonly WEBSOCKET_REGEX = /[\?&]OVERLAY_WS=([^&]+)/;

  private ws: WebSocket;
  private responsePromises: { [key: number]: (value: any) => void } = {};
  private rseqCounter = 0;

  public constructor(private readonly wsUrl: string) {
    super();
    this.ws = new WebSocket(this.wsUrl);
    this.connectWs();
  }

  public callOverlayHandler(msg: SocketMessageEvent): Promise<any> {
    msg.rseq = this.rseqCounter++;

    return new Promise((resolve, reject) => {
      this.sendMessage(msg);
      this.responsePromises[ <number>msg.rseq ] = resolve;
    });
  };

  public startOverlayEvents(): void {
    this.eventsStarted = false;

    this.sendMessage({
      call: 'subscribe',
      events: Object.keys(this.subscribers),
    });
  };

  private sendMessage(obj: any): void {
    if (this.queue) {
      this.queue.push(obj);
    } else {
      this.ws.send(JSON.stringify(obj));
    }
  };

  private connectWs() {
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
      let msg: SocketMessageEvent;

      try {
        msg = JSON.parse(ev.data);
      } catch (e) {
        console.error('Invalid message received: ', ev);
        return;
      }

      if (msg.rseq !== undefined && this.responsePromises[msg.rseq]) {
        this.responsePromises[msg.rseq](msg);
        delete this.responsePromises[msg.rseq];
      } else {
        this.processEvent(msg);
      }
    });

    this.ws.addEventListener('close', () => {
      this.queue = [];

      console.log('Trying to reconnect...');
      // Don't spam the server with retries.
      setTimeout(() => {
        this.connectWs();
      }, 300);
    });
  }
}