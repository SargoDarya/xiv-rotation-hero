import { DialogBase } from './dialog-base.js';
import { Services } from '../interfaces.js';
import { ContainerWidget } from '../widgets/container-widget.js';
import {
  FormInputType,
  FormWidget
} from '../widgets/form-widget.js';
import { API } from '../api.js';
import { ButtonWidget } from '../widgets/button-widget.js';
import { TextWidget } from '../widgets/text-widget.js';
import { AppStateEvent } from '../services/app-state.service.js';
import { User } from '../rotation-hero/interfaces.js';
import { ModalWidget } from '../widgets/modal-widget.js';

export enum UserDialogActiveViewEnum {
  SignIn,
  SignUp,
  SignInSuccess,
  SignUpSuccess
}

export class UserDialog extends DialogBase {
  public readonly uiTitle = 'Sign in / Sign up';

  private readonly userIdTextWidget: TextWidget = new TextWidget('', 'user-dialog__text');
  private readonly userNameTextWidget: TextWidget = new TextWidget('', 'user-dialog__text');
  private readonly userACTOverlayURLTextWidget: TextWidget = new TextWidget('', 'user-dialog__text');

  private readonly signInView: ContainerWidget = this.createSignInView();
  private readonly signUpView: ContainerWidget = this.createSignUpView();
  private readonly userView: ContainerWidget = this.createUserView();
  private readonly signUpSuccessView: ContainerWidget = this.createSignUpSuccessView();

  constructor(services: Services) {
    super(services);

    this.title = 'Sign in';

    this.signUpView.hide();
    this.userView.hide();
    this.signUpSuccessView.hide();

    this.append(new ContainerWidget('user-dialog__content', {}, [
      this.signInView,
      this.signUpView,
      this.userView,
      this.signUpSuccessView
    ]));

    this.viewContainer.addEventListener('keydown', (evt) => {
      evt.stopImmediatePropagation();
    })

    this.services.appStateService.addEventListener(AppStateEvent.UserLogin, this.onUserLogin.bind(this));

    this.afterViewCreated();
  }

  public changeActiveView(view: UserDialogActiveViewEnum) {
    switch(view) {
      case UserDialogActiveViewEnum.SignIn:
        this.title = 'Sign in';
        this.signUpView.hide();
        this.signInView.show();
        this.signUpSuccessView.hide();
        this.userView.hide();
        break;

      case UserDialogActiveViewEnum.SignUp:
        this.title = 'Sign up';
        this.signUpView.show();
        this.signInView.hide();
        break;

      case UserDialogActiveViewEnum.SignUpSuccess:
        this.title = 'Success';
        this.signUpSuccessView.show();
        this.signUpView.hide();
        break;

      case UserDialogActiveViewEnum.SignInSuccess:
        this.signInView.hide();
        this.signUpView.hide();
        this.userView.show();
        break;

      default:
        break;
    }
  }

  private createSignUpView() {
    return new ContainerWidget('sign-up-view', {}, [
      new FormWidget(
        'sign-up-form', [
          { type: FormInputType.Email, label: 'Email', name: 'email' },
          { type: FormInputType.Text, label: 'Username', name: 'username', minLength: 3 },
          { type: FormInputType.Password, label: 'Password', name: 'password', minLength: 8 },
          { type: FormInputType.Button, label: 'Register' }
        ],
        { submit: this.onRegistrationSubmit.bind(this) }
      ),
      new ButtonWidget('Sign in', '', { click: this.changeActiveView.bind(this, UserDialogActiveViewEnum.SignIn) })
    ]);
  }

  private createSignInView() {
    return new ContainerWidget('sign-in-view', {}, [
      new FormWidget(
        'sign-in-form', [
          { type: FormInputType.Email, label: 'Email', name: 'email' },
          { type: FormInputType.Password, label: 'Password', name: 'password' },
          { type: FormInputType.Button, label: 'Sign in' }
        ],
        { submit: this.onLoginSubmit.bind(this) }
      ),
      new ButtonWidget('Sign up', '', { click: this.changeActiveView.bind(this, UserDialogActiveViewEnum.SignUp) })
    ]);
  }

  private createUserView() {
    return new ContainerWidget('user-view', {}, [
      this.userIdTextWidget,
      this.userNameTextWidget,
      this.userACTOverlayURLTextWidget,
      new ButtonWidget('Logout', '', { click: this.logout.bind(this) })
    ]);
  }

  private createSignUpSuccessView() {
    return new ContainerWidget('signup-success-view', {}, [
      new TextWidget('Account was successfully created!', 'signup-success-view__message'),
      new ButtonWidget('Return to sign in', '', { click: this.changeActiveView.bind(this, UserDialogActiveViewEnum.SignIn) })
    ]);
  }

  private async logout() {
    await API.logout();
    this.services.appStateService.dispatchEvent(new CustomEvent(AppStateEvent.UserLogout))
    this.changeActiveView(UserDialogActiveViewEnum.SignIn);
  }

  private async onRegistrationSubmit(evt: Event) {
    evt.preventDefault();
    const formData = new FormData(<HTMLFormElement>evt.target);
    const signUpResponse = await API.signUp(<string>formData.get('email') || '', <string>formData.get('username') || '', <string>formData.get('password') || '');

    if (signUpResponse.ok) {
      this.changeActiveView(UserDialogActiveViewEnum.SignUpSuccess);
    } else {
      this.append(new ModalWidget(new TextWidget(await signUpResponse.text())));
    }
  }

  private async onLoginSubmit(evt: Event) {
    evt.preventDefault();
    const formData = new FormData(<HTMLFormElement>evt.target);
    const signInResponse = await API.signIn(<string>formData.get('email') || '', <string>formData.get('password') || '');

    if (signInResponse.ok) {
      this.services.appStateService.dispatchEvent(new CustomEvent(AppStateEvent.UserLogin, { detail: await signInResponse.json() }));
    } else {
      this.append(new ModalWidget(new TextWidget('Wrong username or password')));
    }
  }

  private onUserLogin() {
    this.changeActiveView(UserDialogActiveViewEnum.SignInSuccess);
    const user = <User>this.services.appStateService.loggedInUser;
    this.title = `Hello ${user.username}`;
    this.userNameTextWidget.text = `Username:\r\n${user.username}`;
    this.userIdTextWidget.text = `ID:\r\n${user.id}`;
    this.userACTOverlayURLTextWidget.text = `ACT Overlay URL:\r\nhttps://app.xivrotationhero.com/?token=${user.uniqueToken}`;
  }
}
