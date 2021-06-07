import { ActionManager } from "./action-manager.js";
import { HotbarManager } from "./hotbar-manager.js";
import { HotbarSlot } from "./hotbar-slot.js";
import { createView } from "./utils.js";
import { Action } from "./xiv-api.js";

export enum HotbarStyle {
  Horizontal,
  SplitHorizontal,
  DoubleSplitHorizontal,
  DoubleSplitVertical,
  SplitVertical,
  Vertical
}

export interface HotbarOptions {
  visible: boolean;
  hotbarStyle: HotbarStyle;
  position: [ number, number ];
  scale: number;
}

export class Hotbar {
  private viewContainer: HTMLElement = createView('div', 'hotbar');
  private hotbarNumberContainer: HTMLElement = createView('div', 'hotbar__number');
  private slotContainer: HTMLElement = createView('div', 'hotbar__slots');
  private hotbarSlots: HotbarSlot[] = [];

  private lastMousePosition: [ number, number ];

  get position(): [ number, number ] {
    return this.options.position;
  }
  set position(position: [ number, number ]) {
    this.viewContainer.style.left = position[ 0 ] * 100 + '%';
    this.viewContainer.style.top = position[ 1 ] * 100 + '%';
    this.options.position = position;
  }

  get visible(): boolean {
    return this.options.visible;
  }
  set visible(visible: boolean) {
    if (visible) {
      this.viewContainer.classList.add('hotbar--visible');
    } else {
      this.viewContainer.classList.remove('hotbar--visible');
    }

    this.options.visible = visible;
  }

  get hotbarStyle(): HotbarStyle {
    return this.options.hotbarStyle;
  }
  set hotbarStyle(style: HotbarStyle) {
    // Remove old class before adding new class
    this.viewContainer.classList.remove(this.getHotbarStyleClass(this.hotbarStyle));
    this.viewContainer.classList.add(this.getHotbarStyleClass(style));
  }

  get scale(): number {
    return this.options.scale;
  }
  set scale(scale: number) {
    this.viewContainer.style.transform = `scale(${scale})`;
    this.options.scale = scale;
    console.log(scale);
  }

  constructor(
      private readonly id: number,
      public readonly hotbarManager: HotbarManager,
      public readonly actionManager: ActionManager,
      // Options are passed in as reference only for automatic changes on hotbars
      private readonly options: HotbarOptions) {

    // Bind event listener so it keeps the context
    this.onMouseDragStop = this.onMouseDragStop.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    this.hotbarNumberContainer.innerText = (this.id + 1).toString();
    this.hotbarNumberContainer.addEventListener('mousedown', this.onMouseDragStart.bind(this));
    this.viewContainer.appendChild(this.hotbarNumberContainer);
    this.viewContainer.appendChild(this.slotContainer);

    // Apply options
    this.position = this.options.position;
    this.visible = this.options.visible;
    this.hotbarStyle = this.options.hotbarStyle;
    this.scale = this.options.scale;

    document.body.appendChild(this.viewContainer);

    for (let slotId = 0; slotId < 12; slotId++) {
      const hotbarSlot = new HotbarSlot(this, this.id, slotId);
      this.hotbarSlots.push(hotbarSlot);
      this.slotContainer.appendChild(hotbarSlot.view);
    }
  }

  trigger(slotId: number): void {
    if (!this.options.visible) {
      return;
    }

    this.hotbarSlots[slotId].trigger();
  }

  setSlotAction(slotId: number, action: Action | undefined) {
    this.hotbarSlots[ slotId ].action = action;
  }

  getSlotAction(slotId: number): Action | undefined {
    return this.hotbarSlots[ slotId ].action;
  }

  getHotbarStyleClass(hotbarStyle: HotbarStyle) {
    switch (hotbarStyle) {
      default:
      case HotbarStyle.Horizontal:
        return 'hotbar--12x1';

      case HotbarStyle.SplitHorizontal:
        return 'hotbar--6x2';

      case HotbarStyle.DoubleSplitHorizontal:
        return 'hotbar--4x3';

      case HotbarStyle.DoubleSplitVertical:
        return 'hotbar--3x4';

      case HotbarStyle.SplitVertical:
        return 'hotbar--2x6';

      case HotbarStyle.Vertical:
        return 'hotbar--1x12';
    }
  }

  onMouseDragStart(evt: MouseEvent): void {
    if (evt.button !== 0) {
      return;
    }

    evt.preventDefault();

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseDragStop);

    this.lastMousePosition = [ evt.clientX, evt.clientY ];
  }

  onMouseMove(evt: MouseEvent): void {
    evt.preventDefault();
    const width = evt.view ? evt.view.innerWidth : 0;
    const height = evt.view ? evt.view.innerHeight : 0;

    const [ currentX, currentY ] = this.position;
    const [ realX, realY ] = [ currentX * width, currentY * height ];

    // Get difference between last and new position in pixels
    const [ oldX, oldY ] = this.lastMousePosition;
    const { clientX, clientY } = evt;
    const [ diffX, diffY ] = [ oldX - clientX, oldY - clientY ];
    this.lastMousePosition = [ clientX, clientY ];

    // convert to percentage
    this.position = [ (realX - diffX) / width, (realY - diffY) / height ];
  }

  onMouseDragStop(evt: MouseEvent): void {
    document.removeEventListener('mouseup', this.onMouseDragStop);
    document.removeEventListener('mousemove', this.onMouseMove);

    this.hotbarManager.persistSettings();
  }

}
