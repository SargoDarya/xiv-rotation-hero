import { DialogBase } from './dialog-base.js';
import { Services } from '../interfaces.js';
import { ContainerWidget } from '../widgets/container-widget.js';
import { TextWidget } from '../widgets/text-widget.js';
import {
  FormInputType,
  FormWidget
} from '../widgets/form-widget.js';
import { API } from '../api.js';
import { ButtonWidget } from '../widgets/button-widget.js';

export class SigninSignupDialog extends DialogBase {
  public readonly uiTitle = 'Sign in / Sign up';

  private activeView: 'signin' | 'signup' = 'signin';

  private signInView: ContainerWidget;
  private signUpView: ContainerWidget;

  constructor(services: Services) {
    super(services);

    this.title = 'Sign in';

    this.signInView = this.createSignInView();
    this.signUpView = this.createSignUpView();
    this.signUpView.hide();

    this.append(new ContainerWidget('signin-signup-dialog__content', {}, [
      this.signInView,
      this.signUpView
    ]));

    this.afterViewCreated();
  }

  changeActiveView(view: 'signin' | 'signup') {
    switch(view) {
      case 'signin':
        this.title = 'Sign in';
        this.signUpView.hide();
        this.signInView.show();
        break;

      case 'signup':
        this.title = 'Sign up';
        this.signUpView.show();
        this.signInView.hide();
    }
  }

  createSignUpView() {
    return new ContainerWidget('sign-up-view', {}, [
      new FormWidget(
        'sign-up-form', [
          { type: FormInputType.Text, label: 'Email', name: 'email' },
          { type: FormInputType.Text, label: 'Username', name: 'username' },
          { type: FormInputType.Password, label: 'Password', name: 'password' },
          { type: FormInputType.Button, label: 'Register' }
        ],
        { submit: this.onRegistrationSubmit.bind(this) }
      ),
      new ButtonWidget('Sign in', '', { click: this.changeActiveView.bind(this, 'signin') })
    ]);
  }

  createSignInView() {
    return new ContainerWidget('sign-in-view', {}, [
      new FormWidget(
        'sign-in-form', [
          { type: FormInputType.Text, label: 'Email', name: 'email' },
          { type: FormInputType.Password, label: 'Password', name: 'password' },
          { type: FormInputType.Button, label: 'Sign in' }
        ],
        { submit: this.onLoginSubmit.bind(this) }
      ),
      new ButtonWidget('Sign up', '', { click: this.changeActiveView.bind(this, 'signup') })
    ]);
  }

  async onRegistrationSubmit(evt: Event) {
    evt.preventDefault();
    const formData = new FormData(<HTMLFormElement>evt.target);
    const signUpResponse = await API.signIn(<string>formData.get('email') || '', <string>formData.get('password') || '');
    console.log(signUpResponse);
  }

  async onLoginSubmit(evt: Event) {
    evt.preventDefault();
    const formData = new FormData(<HTMLFormElement>evt.target);
    const signInResponse = await API.signIn(<string>formData.get('email') || '', <string>formData.get('password') || '');
    console.log(signInResponse);
  }
}
