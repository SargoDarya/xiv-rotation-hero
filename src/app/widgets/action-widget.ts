import { ContainerWidget } from './container-widget.js';
import {
  Action,
  Services
} from '../interfaces.js';
import { ImageWidget } from './image-widget.js';
import { TextWidget } from './text-widget.js';
import { HTMLWidget } from './html-widget.js';

export interface ActionWidgetConfiguration {
  withCooldown: boolean,
  isHotbarAssigned: boolean,
  hotbarId: number,
  slotId: number
}

export class ActionWidget extends ContainerWidget {

  private readonly actionImageWidget: ImageWidget = new ImageWidget('', 'action-widget__icon');
  private readonly actionCooldownView: ContainerWidget = new ContainerWidget('action-widget__cooldown-view');
  private readonly actionKeybindingView: TextWidget = new TextWidget('', 'action-widget__keybinding');

  private readonly isHotbarAssignable: boolean;

  constructor(
    private readonly action: Action,
    private readonly services: Services,
    private readonly configuration: Partial<ActionWidgetConfiguration> = {})
  {
    super('action-widget');

    this.actionImageWidget.src = `https://xivapi.com${action.IconHD}`;

    this.isHotbarAssignable = !/※This action cannot be assigned to a hotbar/.test(action.Description);

    this.append(
      this.actionImageWidget,
      this.actionCooldownView,
      this.actionKeybindingView
    );

    this.actionImageWidget.viewContainer.draggable = false;

    this.viewContainer.draggable = true;
    this.viewContainer.addEventListener('dragstart', (evt: DragEvent) => {
      this.services.tooltipService.hideTooltip();

      if (this.configuration.isHotbarAssigned && this.configuration.hotbarId !== undefined && this.configuration.slotId !== undefined) {
        (<DataTransfer>evt.dataTransfer).setData('drag-type', 'slot-to-slot');
        (<DataTransfer>evt.dataTransfer).setData('hotbar-id', this.configuration.hotbarId.toString(10));
        (<DataTransfer>evt.dataTransfer).setData('slot-id', this.configuration.slotId.toString(10));
      } else {
        (<DataTransfer>evt.dataTransfer).setData('drag-type', 'action');
      }
      (<DataTransfer>evt.dataTransfer).setData('action-id', `${this.action.ID}`);
      if (this.isHotbarAssignable) {
        (<DataTransfer>evt.dataTransfer).setData('is-hotbar-assignable', `${this.action.ID}`);
      }

      const el = <HTMLImageElement>this.actionImageWidget.viewContainer.cloneNode();
      el.style.width = '32px';
      el.style.height = '32px';
      (<DataTransfer>evt.dataTransfer).setDragImage(el, 0, 0);
    });

    this.viewContainer.addEventListener('mouseenter', (evt) => {
      const castTime = this.action.Cast100ms ? (this.action.Cast100ms/10).toFixed(2)+'s' : 'Instant';

      this.services.tooltipService.showTooltip(new ContainerWidget('action-tooltip', {}, [
        new ContainerWidget('action-tooltip__top', {}, [
          new ImageWidget(this.actionImageWidget.src, 'action-tooltip__image'),
          new TextWidget(this.action.Name, 'action-tooltip__name'),
          new TextWidget(this.action.ActionCategory.Name, 'action-tooltip__type'),
          new TextWidget(this.action.Range.toString(10) + 'y', 'action-tooltip__range'),
          new TextWidget(this.action.EffectRange.toString(10) + 'y', 'action-tooltip__effect-range'),
        ]),
        new ContainerWidget('action-tooltip__costs', {}, [
          new TextWidget(castTime, 'action-tooltip__cast-time'),
          new TextWidget((this.action.Recast100ms/10).toFixed(2)+'s', 'action-tooltip__recast-time'),
        ]),
        new HTMLWidget(this.action.Description, 'action-tooltip__description'),
      ]));

      this.services.tooltipService.updatePosition(evt.clientX, evt.clientY);
    });

    this.viewContainer.addEventListener('mousemove', (evt) => {
      this.services.tooltipService.updatePosition(evt.clientX, evt.clientY);
    });

    this.viewContainer.addEventListener('mouseleave', () => {
      this.services.tooltipService.hideTooltip();
    });
  }

}
