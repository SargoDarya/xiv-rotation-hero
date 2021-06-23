import { Hotbar, HotbarOptions, HotbarStyle } from "../manual-ui/hotbar.js";
import { Action, Services } from "../interfaces.js";
import { CrossHotbar } from "../manual-ui/cross-hotbar.js";
import { ServiceBase } from "./service-base.js";
import { AppStateEvent } from "./app-state.service.js";
import { ContainerWidget } from '../widgets/container-widget.js';

interface HotbarAllocation {
  hotbars: [number[],number[],number[],number[],number[],number[],number[],number[],number[],number[]];
  crossHotbars: [number[],number[],number[],number[],number[],number[],number[],number[]];
}

export class HotbarService implements ServiceBase {
  public hotbars: Hotbar[];
  public crossHotbar: CrossHotbar;

  private readonly HOTBAR_PERSISTANCE_KEY = 'hotbar-allocation-';
  private readonly hotbarContainerWidget = new ContainerWidget('hotbars');
  private hotbarSettings: HotbarOptions[];
  private HOTBAR_KEYS = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '0',
    'KeyA',
    'KeyB'
  ];
  private currentClassJobId: number;

  constructor(private readonly services: Services) {}

  public init() {
    this.hotbarSettings = this.loadSettings();
    document.body.appendChild(this.hotbarContainerWidget.viewContainer);
    this.constructHotbars();

    this.crossHotbar = new CrossHotbar(this.services);

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
      let sequence: string[] = [];

      switch (i) {
        case 1: sequence.push('Ctrl'); break;
        case 2: sequence.push('Shift'); break;
        case 3: sequence.push('Alt'); break;
      }

      const hotbar = new Hotbar(this.services, i, this.hotbarSettings[ i ]);
      hotbars.push(hotbar);

      this.hotbarContainerWidget.append(hotbar);

      for (let k=0; k<12; k++) {
        this.services.keyBindingService.registerAvailableBindings(
          `Hotbar ${i+1} - Slot ${k+1}`,
          i < 4 ? [...sequence, this.HOTBAR_KEYS[k]].join('+') : undefined,
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
    const existingHotbarData = localStorage.getItem(`${this.HOTBAR_PERSISTANCE_KEY}${classJobId}`);

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

      this.autoSetActions(actions.filter((action) => {
        return !action.Description.match('※This action cannot be assigned to a hotbar');
      }));
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
    localStorage.setItem(`${this.HOTBAR_PERSISTANCE_KEY}${this.currentClassJobId}`, JSON.stringify({
      hotbars: this.hotbars.map((hotbar) => hotbar.getSlotActionIds()),
      crossHotbars: []
    }));
  }
}
