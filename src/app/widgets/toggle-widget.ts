import { ButtonWidget } from './button-widget.js';
import { WidgetBase } from './widget-base.js';

export class ToggleWidget extends ButtonWidget {
  private readonly UPWARD_ARROW = '&#9650;';
  private readonly DOWNWARD_ARROW = '&#9660;';

  constructor(private readonly targetWidget: WidgetBase) {
    super('', 'toggle-widget');
    this.html = this.targetWidget.isVisible ? this.UPWARD_ARROW : this.DOWNWARD_ARROW;
    this.registerEvents({ click: this.toggleTargetWidget.bind(this) });
  }

  private toggleTargetWidget() {
    const newVisibilityState = !this.targetWidget.isVisible;
    this.targetWidget.isVisible = newVisibilityState;
    this.html = newVisibilityState ? this.UPWARD_ARROW : this.DOWNWARD_ARROW;
  }
}
