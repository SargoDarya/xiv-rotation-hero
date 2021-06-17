import { WidgetBase } from './widget-base.js';

export class TextWidget extends WidgetBase {
  private _text: string = '';
  public set text(value: string) {
    this.viewContainer.innerText = value;
    this._text = value;
  }
  public get text() { return this._text; }

  constructor(text: string = '', widgetClassName: string = '', type: 'div' | 'span' | 'p' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' = 'div') {
    super(widgetClassName, type);
    this.text = text;
  }

}
