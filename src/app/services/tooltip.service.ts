import { ServiceBase } from './service-base.js';
import { ContainerWidget } from '../widgets/container-widget.js';
import { WidgetBase } from '../widgets/widget-base.js';

export class TooltipService implements ServiceBase {
  private readonly tooltipContainer = new ContainerWidget('tooltip');
  private activeTooltip?: WidgetBase;

  init() {}

  showTooltip(tooltip: WidgetBase) {
    document.body.appendChild(this.tooltipContainer.viewContainer);
    this.tooltipContainer.append(tooltip);
    this.activeTooltip = tooltip;
  }

  updatePosition(x: number, y: number) {
    this.tooltipContainer.viewContainer.style.left = `${x}px`;
    this.tooltipContainer.viewContainer.style.top = `${y+10}px`;
  }

  hideTooltip() {
    if (!this.activeTooltip) return;
    this.tooltipContainer.remove(this.activeTooltip);
    this.activeTooltip = undefined;
    document.body.removeChild(this.tooltipContainer.viewContainer);
  }
}
