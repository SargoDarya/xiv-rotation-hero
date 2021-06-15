import { WidgetBase } from './widget-base.js';

export class ContainerWidget extends WidgetBase {
  constructor(className: string, events: { [k: string]: () => void } = {}, children: WidgetBase[] = []) {
    super(className);

    // Add events
    this.registerEvents(events);

    // Add children
    children.forEach((child) => this.append(child));
  }
}
