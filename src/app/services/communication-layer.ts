export interface MessageEvent {
  type: string;
  data: any;
}

export interface LogLineEvent {
  type: 'LogLine',
  line: string[],
  rawLine: string
}

interface LogLineBaseEvent {
  type: string;
  timestamp: string;
  checksum: string;
}

// RoleChangeEvent
interface RoleChangeEvent extends LogLineBaseEvent {
  type: '12';
  // timestamp
  classJobId: number;
  strengthValue: number;
  dexterityValue: number;
  vitalityValue: number;
  intelligenceValue: number;
  mindValue: number;
  pietyValue: number
  attackPowerValue: number;
  directHitRateValue: number;
  criticalHitValue: number;
  _unknownValue1: any;
  healingMagicPotencyValue: number;
  determinationValue: number;
  skillSpeedValue: number;
  spellSpeedValue: number;
  _unknownValue2: any;
  tenacityValue: number;
  _unknownValue3: any;
}

// ActionCastEvent
interface ActionCastEvent extends LogLineBaseEvent {
  type: '20'
  // timestamp
  playerId: string;
  playerName: string;
  attackId: number;
  attackName: string;
  attackTarget: string;
  attackTargetName: string;
  castDuration: number;
}

// ActionEvent
interface ActionEvent extends LogLineBaseEvent {
  type: '21';
  // timestamp
  playerId: string;
  playerName: string;
  attackId: number;
  attackName: string;
  attackTarget: string;
  attackTargetName: string;
  castDuration: number;
}

interface ActorStatusEffectRemovedEvent extends LogLineBaseEvent {
  type: '30';
  // timestamp
  statusEffectId: number;
  statusEffectName: string;
  remainingTime: number;
  effectSourceId: string;
  effectSource: string;
  effectTargetId: string;
  effectTargetName: string;
  _unknownValue1: any;
  _unknownValue2: any;
  _unknownValue3: any;
  _unknownValue4: any;
}

interface ActorTickEvent extends LogLineBaseEvent {
  type: '39';
  // timestamp
  playerId: string;
  playerName: string;
  playerHP: number;
  playerMaxHP: number;
  playerMP: number;
  playerMaxMP: number;
}

//

export abstract class CommunicationLayer {

  protected queue: any[] | null = [];
  protected subscribers: { [ key: string ]: Array<(msg: any) => {}> } = {};
  protected eventsStarted = false;

  public constructor() {
    (<any>window).dispatchOverlayEvent = this.processEvent.bind(this);
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

  public parseLogLine(line: LogLineEvent) {
  }

  abstract callOverlayHandler(msg: MessageEvent): Promise<any>;
  abstract startOverlayEvents(): void

}
