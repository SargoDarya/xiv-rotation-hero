import { WidgetBase } from './widget-base.js';

export class TextareaWidget extends WidgetBase {
  declare public viewContainer: HTMLTextAreaElement;

  set value(value: string) {
    this.viewContainer.value = value;
  }
  get value() {
    return this.viewContainer.value;
  }

  constructor(className: string) {
    super(className, 'textarea');
  }
}
