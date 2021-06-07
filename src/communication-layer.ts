export interface MessageEvent {
  type: string;
  data: any;
}

export abstract class CommunicationLayer {

  protected queue: any[] | null = [];
  protected subscribers: { [ key: string ]: Array<(msg: any) => {}> } = {};
  protected eventsStarted = false;

  public constructor() {
    (<any>window).dispatchOverlayEvent = this.processEvent;
  }

  protected processEvent(msg: MessageEvent) {
    if (this.subscribers[msg.type]) {
      for (let subscriber of this.subscribers[msg.type]) {
        subscriber(msg);
      }
    }
  }

  public addOverlayListener(event: string, cb: (data: any) => any) {
    if (this.eventsStarted && this.subscribers[ event ]) {
      console.warn(`A new listener for ${event} has been registered after event transmission has already begun.
Some events might have been missed and no cached values will be transmitted.
Please register your listeners before calling startOverlayEvents().`);
    }

    if (!this.subscribers[ event ]) {
      this.subscribers[ event ] = [];
    }

    this.subscribers[event].push(cb);
  }

  public removeOverlayListener(event: string, cb: (msg: any) => {}) {
    if (this.subscribers[event]) {
      let list = this.subscribers[ event ];
      let pos = list.indexOf(cb);

      if (pos > -1) list.splice(pos, 1);
    }
  }

  abstract callOverlayHandler(msg: MessageEvent): Promise<any>;
  abstract startOverlayEvents(): void

}
