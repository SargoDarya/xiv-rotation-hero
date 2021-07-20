import { HotbarSlot } from "./hotbar-slot.js";
import {
  Action,
  Services
} from "../interfaces.js";
import { WidgetBase } from '../widgets/widget-base.js';
import { ContainerWidget } from '../widgets/container-widget.js';
import { TextWidget } from '../widgets/text-widget.js';

export enum HotbarStyle {
  Horizontal = '12x1',
  SplitHorizontal = '6x2',
  DoubleSplitHorizontal = '4x3',
  DoubleSplitVertical = '3x4',
  SplitVertical = '2x6',
  Vertical = '1x12'
}

export interface HotbarOptions {
  visible: boolean;
  hotbarStyle: HotbarStyle;
  position: [ number, number ];
  scale: number;
}

export class Hotbar extends WidgetBase {
  private hotbarNumberContainer = new TextWidget('', 'hotbar__number');
  private slotContainer = new ContainerWidget('hotbar__slots');
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
    this.toggleModifier('visible', visible);
    this.options.visible = visible;
  }

  get hotbarStyle(): HotbarStyle {
    return this.options.hotbarStyle;
  }
  set hotbarStyle(style: HotbarStyle) {
    // Remove old class before adding new class
    this.removeModifier(this.hotbarStyle);
    this.addModifier(style);
    this.options.hotbarStyle = style;
  }

  get scale(): number {
    return this.options.scale;
  }
  set scale(scale: number) {
    this.viewContainer.style.transform = `scale(${scale})`;
    this.options.scale = scale;
  }

  constructor(
    public readonly services: Services,
    private readonly id: number,
    // Options are passed in as reference only for automatic changes on hotbars
    private readonly options: HotbarOptions
  ) {
    super('hotbar');

    // Bind event listener so it keeps the context
    this.onMouseDragStop = this.onMouseDragStop.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    this.hotbarNumberContainer.text = (this.id + 1).toString();
    this.hotbarNumberContainer.viewContainer.addEventListener('mousedown', this.onMouseDragStart.bind(this));
    this.append(
      this.hotbarNumberContainer,
      this.slotContainer
    );

    // Generate slots
    for (let slotId = 0; slotId < 12; slotId++) {
      const hotbarSlot = new HotbarSlot(this, this.id, slotId);
      this.hotbarSlots.push(hotbarSlot);
      this.slotContainer.append(hotbarSlot);
    }

    // Apply options
    this.position = this.options.position;
    this.visible = this.options.visible;
    this.hotbarStyle = this.options.hotbarStyle;
    this.scale = this.options.scale;
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

  /**
   * Returns an array of action id or null for persistance
   */
  getSlotActionIds() {
    return this.hotbarSlots.map((slot) => slot.action ? slot.action.ID : null);
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
    this.position = [ Math.max((realX - diffX) / width, 0), Math.max((realY - diffY) / height, 0) ];
  }

  onMouseDragStop(evt: MouseEvent): void {
    document.removeEventListener('mouseup', this.onMouseDragStop);
    document.removeEventListener('mousemove', this.onMouseMove);

    this.services.hotbarService.persistSettings();
  }

}
