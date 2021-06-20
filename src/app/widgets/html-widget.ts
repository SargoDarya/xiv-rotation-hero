import { WidgetBase } from './widget-base.js';

export class HTMLWidget extends WidgetBase {
  private _html: string = '';
  public set html(value: string) {
    this.viewContainer.innerHTML = value;
    this._html = value;
  }
  public get text() { return this._html; }

  constructor(html: string = '', widgetClassName: string = '', type: 'div' | 'span' | 'p' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' = 'div') {
    super(widgetClassName, type);
    this.html = html;
  }

}
