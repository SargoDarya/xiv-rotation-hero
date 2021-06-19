import { ActionService } from "./action.service.js";
import { Hotbar, HotbarOptions, HotbarStyle } from "../manual-ui/hotbar.js";
import { Action, Services } from "../interfaces.js";
import { KeyBindingService } from "./key-binding.service.js";
import { CrossHotbar } from "../manual-ui/cross-hotbar.js";
import { GamepadService } from "./gamepad.service.js";
import { GameDataService } from "./game-data.service.js";
import { ServiceBase } from "./service-base.js";
import { AppStateEvent } from "./app-state.service.js";

interface HotbarAllocation {
  hotbars: [number[],number[],number[],number[],number[],number[],number[],number[],number[],number[]];
  crossHotbars: [number[],number[],number[],number[],number[],number[],number[],number[]];
}

export class HotbarService implements ServiceBase {
  public hotbars: Hotbar[];
  public crossHotbar: CrossHotbar;

  private hotbarSettings: HotbarOptions[];
  private HOTBAR_KEYS = [
    'Digit1',
    'Digit2',
    'Digit3',
    'Digit4',
    'Digit5',
    'Digit6',
    'Digit7',
    'Digit8',
    'Digit9',
    'Digit0',
    'KeyA',
    'KeyB'
  ];
  private currentClassJobId: number;

  constructor(private readonly services: Services) {}

  public init() {
    this.hotbarSettings = this.loadSettings();
    this.constructHotbars();

    this.crossHotbar = new CrossHotbar(this.services);
    // document.body.appendChild(this.crossHotbar.viewContainer);

    // Listen to class changes
    this.services.appStateService.addEventListener(AppStateEvent.ClassJobChanged, (evt: CustomEvent<number>) => {
      this.setCurrentClassJobId(evt.detail);
    });

    // Check if class already was set
    if (this.services.appStateService.selectedClassJobID !== -1) {
      this.setCurrentClassJobId(this.services.appStateService.selectedClassJobID)
    }
  }

  private constructHotbars() {
    const hotbars: Hotbar[] = [];

    for (let i=0; i<10; i++) {
      let keyModifier = '';

      switch (i) {
        case 1: keyModifier = 'Ctrl+'; break;
        case 2: keyModifier = 'Shift+'; break;
        case 3: keyModifier = 'Alt+'; break;
      }

      const hotbar = new Hotbar(i, this, this.services.actionService, this.hotbarSettings[ i ]);
      hotbars.push(hotbar);

      for (let k=0; k<12; k++) {
        this.services.keyBindingService.registerAvailableBindings(
          `Hotbar${i+1} Action${k+1}`,
          i < 4 ? `${keyModifier}${this.HOTBAR_KEYS[k]}` : undefined,
          () => {
            hotbar.trigger.call(hotbar, k);
          }
        );
      }
    }

    this.hotbars = hotbars;
  }


  public setCurrentClassJobId(classJobId: number) {
    this.currentClassJobId = classJobId;

    // Check if there's a stored state for this job in local storage
    const existingHotbarData = localStorage.getItem(`hotbar-placement-${classJobId}`);

    this.clearAllHotbars();

    if (existingHotbarData !== null) {
      const hotbarAllocations = <HotbarAllocation>JSON.parse(existingHotbarData);
      hotbarAllocations.hotbars.forEach((hotbarAllocation, hotbarIndex) => {
        hotbarAllocation.forEach((slot, slotIndex) => {
          if (slot) {
            this.hotbars[ hotbarIndex ].setSlotAction(slotIndex, this.services.gameDataService.getActionById(slot));
          }
        });
      });
    } else {
      const actions = this.services.gameDataService.getActionsByClassJobId(classJobId);
      this.autoSetActions(actions);
    }
  }

  private clearAllHotbars() {
    this.hotbars.forEach(this.clearHotbar);
  }

  private clearHotbar(hotbar: Hotbar) {
    for (let i = 0; i < 12; i++) {
      hotbar.setSlotAction(i, undefined);
    }
  }

  private autoSetActions(actions: Action[]) {
    if (actions) {
      actions.forEach((action, index) => {
        const hotbar = this.hotbars[ Math.floor(index / 12) ];
        const slotId = index % 12;

        hotbar.setSlotAction(slotId, action);
      });
    }
  }

  /**
   * Swaps hotbar actions between to hotbar slots
   */
  public swapHotbarActions(sourceHotbarId: number, sourceSlotId: number, targetHotbarId: number, targetSlotId: number) {
    const targetSlotAction = this.hotbars[ targetHotbarId ].getSlotAction(targetSlotId);
    const sourceSlotAction = this.hotbars[ sourceHotbarId ].getSlotAction(sourceSlotId);

    this.hotbars[ targetHotbarId ].setSlotAction(targetSlotId, sourceSlotAction);
    this.hotbars[ sourceHotbarId ].setSlotAction(sourceSlotId, targetSlotAction);

    this.persistHotbarAllocation();
  }

  private loadSettings(): HotbarOptions[] {
    const savedSettings = localStorage.getItem('hotbar-settings');

    if (savedSettings) {
      return JSON.parse(savedSettings);
    }

    /**
     * Return some sane defaults for the hotbars
     */
    return [
      { visible: true,  hotbarStyle: HotbarStyle.Horizontal, position: [ 0, 0.1 ], scale: .8 },
      { visible: true,  hotbarStyle: HotbarStyle.SplitHorizontal, position: [ 0, 0.15 ], scale: .8 },
      { visible: true,  hotbarStyle: HotbarStyle.DoubleSplitHorizontal, position: [ 0, 0.2 ], scale: .8 },
      { visible: true,  hotbarStyle: HotbarStyle.DoubleSplitVertical, position: [ 0, 0.25 ], scale: .8 },
      { visible: true,  hotbarStyle: HotbarStyle.SplitVertical, position: [ 0, 0 ], scale: .8 },
      { visible: true,  hotbarStyle: HotbarStyle.Vertical, position: [ 0, 0 ], scale: .8 },
      { visible: false, hotbarStyle: HotbarStyle.Horizontal, position: [ 0, 0 ], scale: .8 },
      { visible: false, hotbarStyle: HotbarStyle.Horizontal, position: [ 0, 0 ], scale: .8 },
      { visible: false, hotbarStyle: HotbarStyle.Horizontal, position: [ 0, 0 ], scale: .8 },
      { visible: false, hotbarStyle: HotbarStyle.Horizontal, position: [ 0, 0 ], scale: .8 }
    ]
  }

  public persistSettings() {
    localStorage.setItem('hotbar-settings', JSON.stringify(this.hotbarSettings));
  }

  public persistHotbarAllocation() {
    localStorage.setItem(`hotbar-placement-${this.currentClassJobId}`, JSON.stringify({
      hotbars: this.hotbars.map((hotbar) => hotbar.getSlotActionIds()),
      crossHotbars: []
    }));
  }
}
