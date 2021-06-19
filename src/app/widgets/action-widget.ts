import { ContainerWidget } from './container-widget.js';
import { Action } from '../interfaces.js';
import { ImageWidget } from './image-widget.js';
import { TextWidget } from './text-widget.js';

interface ActionWidgetConfiguration {
  withCooldown: boolean
}

export class ActionWidget extends ContainerWidget {

  private readonly actionImageWidget: ImageWidget = new ImageWidget('', 'action-widget__icon');
  private readonly actionCooldownView: ContainerWidget = new ContainerWidget('action-widget__cooldown-view');
  private readonly actionKeybindingView: TextWidget = new TextWidget('', 'action-widget__keybinding');

  constructor(private readonly action: Action, configuration: Partial<ActionWidgetConfiguration> = {}) {
    super('action-widget');

    this.actionImageWidget.src = `https://xivapi.com${action.IconHD}`;

    this.append(
      this.actionImageWidget,
      this.actionCooldownView,
      this.actionKeybindingView
    );

    this.actionImageWidget.viewContainer.draggable = false;

    this.viewContainer.draggable = true;
    this.viewContainer.addEventListener('dragstart', (evt: DragEvent) => {
      (<DataTransfer>evt.dataTransfer).setData('dragType', `action`);
      (<DataTransfer>evt.dataTransfer).setData('actionId', `${this.action.ID}`);

      const el = <HTMLImageElement>this.actionImageWidget.viewContainer.cloneNode();
      el.style.width = '32px';
      el.style.height = '32px';
      (<DataTransfer>evt.dataTransfer).setDragImage(el, 0, 0);
    });
  }

}
