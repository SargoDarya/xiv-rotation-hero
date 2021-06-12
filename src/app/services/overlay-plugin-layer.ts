import { CommunicationLayer, MessageEvent } from "./communication-layer.js";

declare global {
  interface Window {
    OverlayPluginApi: {
      ready: boolean,
      callHandler: (msg: string, cb: (msgData: any) => any) => {}
    },
    __OverlayCallback: (msg: MessageEvent) => void
  }
}

export class OverlayPluginLayer extends CommunicationLayer {
  public constructor() {
    super();

    this.waitForApi();
  }

  private waitForApi() {
    if (!window.OverlayPluginApi || !window.OverlayPluginApi.ready) {
      setTimeout(this.waitForApi.bind(this), 300);
      return;
    }

    const q = this.queue;
    this.queue = null;

    window.__OverlayCallback = this.processEvent.bind(this);

    if (q) {
      for (let [ msg, resolve ] of q) {
        this.sendMessage(msg, resolve);
      }
    }
  }

  public callOverlayHandler(msg: MessageEvent): Promise<null | MessageEvent> {
    return new Promise((resolve) => {
      this.sendMessage(msg, (data) => {
        resolve(data === null ? null : JSON.parse(data));
      });
    });
  };

  public startOverlayEvents(): void {
    this.eventsStarted = false;

    this.sendMessage({
      call: 'subscribe',
      events: Object.keys(this.subscribers),
    });
  };

  private sendMessage(obj: any, cb: (responseData: string) => any = () => {}) {
    if (this.queue) {
      this.queue.push([obj, cb]);
    } else {
      window.OverlayPluginApi.callHandler(JSON.stringify(obj), cb);
    }
  }
}
