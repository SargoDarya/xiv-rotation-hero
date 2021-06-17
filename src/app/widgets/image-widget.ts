import { WidgetBase } from './widget-base.js';

export class ImageWidget extends WidgetBase {
  public set src(value: string) {
    (<HTMLImageElement>this.viewContainer).src = value;
  }
  public get src(): string {
    return (<HTMLImageElement>this.viewContainer).src;
  }

  constructor(src: string, classNames: string = '') {
    super(classNames, 'img');
    this.src = src;
  }

}
