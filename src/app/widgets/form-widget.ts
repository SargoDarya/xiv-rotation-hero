import { WidgetBase } from './widget-base.js';
import { InputWidget } from './input.widget.js';
import { ButtonWidget } from './button-widget.js';
import { ContainerWidget } from './container-widget.js';
import { TextWidget } from './text-widget.js';

export enum FormInputType {
  Text = 'text',
  Password = 'password',
  Radio = 'radio',
  Checkbox = 'checkbox',
  Button = 'button'
}

export interface FormInputDescription {
  type: FormInputType,
  label?: string;
  className?: string;
  name?: string;
}

export class FormWidget extends WidgetBase {
  private formWidgets: WidgetBase[] = [];

  constructor(className: string, formDescription: FormInputDescription[] = [], events: { [k: string]: () => any } = {}) {
    super(className, 'form');

    const formWidgets = formDescription.map((declaration) => {
      if (declaration.type === FormInputType.Button) {
        return new ButtonWidget(declaration.label || '', declaration.className ? declaration.className : `form__input--${declaration.type}`);
      } else {
        const inputWidget = new InputWidget(declaration.type, declaration.className ? declaration.className : `form__input--${declaration.type}`);
        inputWidget.viewContainer.name = declaration.name || '';

        // If there is no label just return the input
        if (!declaration.label) {
          return inputWidget;
        }

        const labelWidget = new TextWidget(declaration.label, `form__input-label`, 'label');
        (<HTMLLabelElement>labelWidget.viewContainer).htmlFor = declaration.name || '';

        return new ContainerWidget(`form__input-container`, {}, [
          labelWidget,
          inputWidget
        ]);
      }
    });

    this.registerEvents(events);

    this.formWidgets.splice(0, 0, ...formWidgets);
    this.append(...formWidgets);
  }

}
