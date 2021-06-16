import { DialogBase } from './dialog-base.js';
import { Services } from '../interfaces.js';
import { ContainerWidget } from '../widgets/container-widget.js';
import { TextInputWidget } from '../widgets/text-input.widget.js';
import { ButtonWidget } from '../widgets/button-widget.js';
import { TextWidget } from '../widgets/text-widget.js';

export class SigninSignupDialog extends DialogBase {
  public readonly uiTitle = 'Login/Register';

  constructor(services: Services) {
    super(services);

    this.title = this.uiTitle;

    this.append(this.createSignUpView(), this.createSignInView());

    this.afterViewCreated();
  }

  createSignUpView() {
    return new ContainerWidget('sign-up-view', {}, [
      new TextWidget('Registration', 'sign-up__title'),
      new TextInputWidget('sign-up__username'),
      new TextInputWidget('sign-up__email'),
      new TextInputWidget('sign-up__password', true),
      new ButtonWidget('Register', 'sign-up__register-button')
    ]);
  }

  createSignInView() {
    return new ContainerWidget('sign-in-view', {}, [
      new TextWidget('Sign in', 'sign-in__title'),
      new TextInputWidget('sign-in__email'),
      new TextInputWidget('sign-in__password', true),
      new ButtonWidget('Sign in', 'sign-in__sign-in-button')
    ]);
  }
}
