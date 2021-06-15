import { WidgetBase } from './widget-base.js';

export class TextWidget extends WidgetBase {
  private _text: string = '';
  public set text(value: string) {
    this.viewContainer.innerText = value;
    this._text = value;
  }
  public get text() { return this._text; }

  constructor(text: string = '', widgetClassName: string, type: 'div' | 'span' | 'p' = 'div') {
    super(widgetClassName, type);
    this.text = text;
  }

}
