import { WidgetBase } from './widget-base.js';
import { ContainerWidget } from './container-widget.js';
import { ButtonWidget } from './button-widget.js';

export class ModalWidget extends WidgetBase {
  constructor(content: WidgetBase, showDismissButton = true) {
    super('modal-widget');

    const widgets = [ content ];

    if (showDismissButton) {
      widgets.push(
        new ButtonWidget('OK', 'modal-widget__dismiss-button', { click: this.dismiss.bind(this) })
      )
    }

    this.append(
      new ContainerWidget('modal-widget__content', {}, widgets)
    );
  }

  dismiss() {
    this.removeSelf();
  }
}
