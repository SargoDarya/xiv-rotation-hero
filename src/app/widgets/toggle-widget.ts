import { ButtonWidget } from './button-widget.js';
import { WidgetBase } from './widget-base.js';
import { TextWidget } from './text-widget.js';

export class ToggleWidget extends ButtonWidget {
  private readonly UPWARD_ARROW = '\u25B2';
  private readonly DOWNWARD_ARROW = '\u25BC';
  private readonly arrowTextWidget = new TextWidget('', '', 'span');

  constructor(private readonly targetWidget: WidgetBase, private readonly contentContainer?: WidgetBase, additionalClassName?: string) {
    super('', 'toggle-widget');
    this.registerEvents({ click: this.toggleTargetWidget.bind(this) });

    if (this.contentContainer) {
      this.append(this.contentContainer);
    }

    if (additionalClassName) {
      this.classList.add(additionalClassName);
    }

    this.append(this.arrowTextWidget);
    this.updateView();
  }

  public hideTarget() {
    this.targetWidget.isVisible = false;
    this.updateView();
  }
  public showTarget() {
    this.targetWidget.isVisible = false;
    this.updateView();
  }

  private updateView() {
    this.arrowTextWidget.text = this.targetWidget.isVisible ? this.UPWARD_ARROW : this.DOWNWARD_ARROW;
  }

  private toggleTargetWidget() {
    this.targetWidget.isVisible = !this.targetWidget.isVisible;
    this.updateView();
  }
}
