import { WidgetBase } from './widget-base.js';

export class ButtonWidget extends WidgetBase {
  declare viewContainer: HTMLButtonElement;

  constructor(text: string, containerClass: string = '', events: { [k: string]: () => void } = {}) {
    super(containerClass, 'button');
    this.viewContainer.innerText = text;
    this.registerEvents(events);
  }

  set html(html: string) {
    this.viewContainer.innerHTML = html;
  }
  get html() {
    return this.viewContainer.innerHTML;
  }

  set text(text: string) {
    this.viewContainer.innerText = text;
  }
  get text() {
    return this.viewContainer.innerText;
  }

  set disabled(value: boolean) {
    this.viewContainer.disabled = value;
  }
  get disabled() {
    return this.viewContainer.disabled;
  }

  set title(title: string) {
    this.viewContainer.title = title;
  }
  get title() {
    return this.viewContainer.title;
  }
}
