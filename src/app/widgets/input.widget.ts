import { WidgetBase } from './widget-base.js';
import { FormInputType } from './form-widget';

export class InputWidget extends WidgetBase {
  declare public viewContainer: HTMLInputElement;

  set value(value: string) {
    this.viewContainer.value = value;
  }
  get value() {
    return this.viewContainer.value;
  }

  constructor(type: FormInputType, className: string = '') {
    super(className, 'input');
    this.viewContainer.type = type;

    this.viewContainer.addEventListener('keydown', (evt) => {
      evt.stopImmediatePropagation();
    })
  }
}
