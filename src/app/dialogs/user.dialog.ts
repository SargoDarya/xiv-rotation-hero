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
  public activeView: ContainerWidget;

  private readonly userIdTextWidget: TextWidget = new TextWidget('', 'user-dialog__text');
  private readonly userNameTextWidget: TextWidget = new TextWidget('', 'user-dialog__text');
  private readonly userACTOverlayURLTextWidget: TextWidget = new TextWidget('', 'user-dialog__text');

  private readonly userDialogContent: ContainerWidget = new ContainerWidget('user-dialog__content');

  constructor(services: Services) {
    super(services);

    this.append(this.userDialogContent);

    this.viewContainer.addEventListener('keydown', (evt) => {
      evt.stopImmediatePropagation();
    })

    this.services.appStateService.addEventListener(AppStateEvent.UserLogin, this.onUserLogin.bind(this));

    this.changeActiveView(UserDialogActiveViewEnum.SignIn);

    this.afterViewCreated();
  }

  public changeActiveView(view: UserDialogActiveViewEnum) {
    // Remove previous view
    if (this.activeView) {
      this.userDialogContent.remove(this.activeView);
    }

    switch(view) {
      case UserDialogActiveViewEnum.SignIn:
        this.title = 'Sign in';
        this.activeView = this.createSignInView();
        break;

      case UserDialogActiveViewEnum.SignUp:
        this.title = 'Sign up';
        this.activeView = this.createSignUpView();
        break;

      case UserDialogActiveViewEnum.SignUpSuccess:
        this.title = 'Success';
        this.activeView = this.createSignUpSuccessView();
        break;

      case UserDialogActiveViewEnum.SignInSuccess:
        this.activeView = this.createUserView();
        break;

      default:
        break;
    }

    // Show new view
    this.userDialogContent.append(this.activeView);
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
    const registrationPendingModal = new ModalWidget(new TextWidget('Registering, please wait...'), false)
    this.append(registrationPendingModal);
    const formData = new FormData(<HTMLFormElement>evt.target);
    const signUpResponse = await API.signUp(<string>formData.get('email') || '', <string>formData.get('username') || '', <string>formData.get('password') || '');

    registrationPendingModal.dismiss();

    if (signUpResponse.ok) {
      this.changeActiveView(UserDialogActiveViewEnum.SignUpSuccess);
    } else {
      this.append(new ModalWidget(new TextWidget(await signUpResponse.text())));
    }
  }

  private async onLoginSubmit(evt: Event) {
    evt.preventDefault();
    const signInPendingModal = new ModalWidget(new TextWidget('Logging in, please wait...'), false)
    this.append(signInPendingModal);
    const formData = new FormData(<HTMLFormElement>evt.target);
    const signInResponse = await API.signIn(<string>formData.get('email') || '', <string>formData.get('password') || '');

    signInPendingModal.dismiss();

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
