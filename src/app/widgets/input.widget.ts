import { WidgetBase } from './widget-base.js';
import { FormInputType } from './form-widget';

export class InputWidget extends WidgetBase {
  declare public viewContainer: HTMLInputElement;

  constructor(type: FormInputType, className: string = '') {
    super(className, 'input');
    this.viewContainer.type = type;
  }
}
