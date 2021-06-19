import { ContainerWidget } from './container-widget.js';
import { TextWidget } from './text-widget.js';
import { ButtonWidget } from './button-widget.js';

export class HelpTextWidget extends ContainerWidget {
  private readonly HELP_TEXT_STORAGE_KEY = 'app-help-texts';

  constructor(helpText: string, private readonly helpTextId: string) {
    super('help-text-widget');

    this.append(
      new TextWidget(helpText, 'help-text-widget__text'),
      new ButtonWidget('Dismiss', 'help-text-widget__dismiss-button', { click: this.dismiss.bind(this) })
    );

    if (this.isDismissed()) {
      this.hide();
    }
  }

  show() {
    if (!this.isDismissed()) {
      super.show();
    }
  }

  isDismissed() {
    const dismissedHelpTexts: string[] = JSON.parse(localStorage.getItem(this.HELP_TEXT_STORAGE_KEY) || '[]');
    return dismissedHelpTexts.includes(this.helpTextId);
  }

  dismiss() {
    const dismissedHelpTexts: string[] = JSON.parse(localStorage.getItem(this.HELP_TEXT_STORAGE_KEY) || '[]');
    dismissedHelpTexts.push(this.helpTextId);
    localStorage.setItem(this.HELP_TEXT_STORAGE_KEY, JSON.stringify(dismissedHelpTexts));
    this.hide();
  }
}
