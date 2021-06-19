import { WidgetBase } from './widget-base.js';
import { ContainerWidget } from './container-widget.js';
import { ButtonWidget } from './button-widget.js';

export class ModalWidget extends WidgetBase {
  constructor(content: WidgetBase) {
    super('modal-widget');

    this.append(
      new ContainerWidget('modal-widget__content', {}, [
        content,
        new ButtonWidget('OK', 'modal-widget__dismiss-button', { click: this.dismiss.bind(this) })
      ])
    );
  }

  dismiss() {
    this.viewContainer.remove();
  }
}
