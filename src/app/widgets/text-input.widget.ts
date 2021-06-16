import { WidgetBase } from './widget-base.js';

export class TextInputWidget extends WidgetBase {
  constructor(className: string = '', isPassword = false) {
    super(className, 'input');
    (<HTMLInputElement>this.viewContainer).type = isPassword ? 'password' : 'text';
  }
}
