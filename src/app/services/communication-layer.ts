export interface MessageEvent {
  type: string;
  data: any;
}

export interface LogLineEvent {
  type: 'LogLine',
  line: string[],
  rawLine: string
}

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

  // [00] Chat log message
  // irrelevant

  // [12] Role changed
  // 0: 12
  // 1: Timestamp
  // 2: ClassJobId
  // 3: StrengthValue
  // 4: DexterityValue
  // 5: VitalityValue
  // 6: IntelligenceValue
  // 7: MindValue
  // 8: PietyValue
  // 9: AttackPowerValue
  // 10: DirectHitRateValue
  // 11: CriticalHitValue
  // 12: ?
  // 13: HealingMagicPotencyValue
  // 14: DeterminationValue
  // 15: SkillSpeedValue
  // 16: SpellSpeedValue
  // 17: ?
  // 18: TenacityValue
  // 19: ?
  // 20: Checksum

  // [20] Cast message - Done
  // 0: 21
  // 1: Timestamp
  // 2: PlayerId
  // 3: PlayerName
  // 4: AttackId
  // 5: AttackName
  // 6: AttackTarget
  // 7: AttackTargetName
  // 8: CastDuration

  // [21] Attack message
  // 0: 21
  // 1: Timestamp
  // 2: PlayerId
  // 3: PlayerName
  // 4: AttackId
  // 5: AttackName
  // 6: AttackTarget
  // 7: AttackTargetName

  // [30]: Enemy status effect removed
  // 0: 30
  // 1: Timestamp
  // 2: StatusEffectId
  // 3: StatusEffectName
  // 4: RemainingTime
  // 5: EffectSourceId
  // 6: EffectSource
  // 7: EffectTarget
  // 8: EffectTargetName
  // 9: ?
  // 10: ?
  // 11: ?
  // 12: ?
  // 13: Checksum

  // [39] Tick update
  // 0: 39
  // 1: Timestamp
  // 2: PlayerId
  // 3: PlayerName
  // 4: PlayerHP
  // 5: PlayerMaxHP
  // 6: PlayerMP
  // 7: PlayerMaxMP
  // 

  // [251] Connection Status Update
  // 0: 251
  // 1: Timestamp
  // 2: Message
  // 3: Checksum
  public parseLogLine(line: LogLineEvent) {
  }

  abstract callOverlayHandler(msg: MessageEvent): Promise<any>;
  abstract startOverlayEvents(): void

}
