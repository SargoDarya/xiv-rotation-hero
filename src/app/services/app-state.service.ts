import { DialogBase } from "../dialogs/dialog-base.js";
import { ServiceBase } from "./service-base.js";
import { User } from '../rotation-hero/interfaces.js';


export enum AppStateEvent {
  ClassJobChanged = 'app-classjobchanged',
  DialogOrderChanged = 'app-dialogfocuschanged',
  TryRotation = 'app-tryrotation',
  UserLogin = 'app-userlogin',
  UserLogout = 'app-userlogout'
}

export enum AppStateKey {
  SelectedClassJobID = 'selected-class-job-id'
}

/**
 * This class contains all application state and emits events
 * as any important actions in the application happen which need
 * to be propagated.
 *
 * This is also used as an event-bus
 */
export class AppStateService extends EventTarget implements ServiceBase {
  private _selectedClassJobID: number;
  public set selectedClassJobID(value: number) {
    this._selectedClassJobID = value;
    localStorage.setItem(AppStateKey.SelectedClassJobID, value.toString());
    this.dispatchEvent(new CustomEvent(AppStateEvent.ClassJobChanged, { detail: value }));
  }
  public get selectedClassJobID() {
    return this._selectedClassJobID;
  }

  private readonly _dialogOrder: DialogBase[] = [];
  public set selectedDialog(dialog: DialogBase) {
    // Move dialog to last z-order
    const currentPosition = this._dialogOrder.indexOf(dialog);
    this._dialogOrder.splice(currentPosition);
    this._dialogOrder.push(dialog);

    this.dispatchEvent(new CustomEvent(AppStateEvent.DialogOrderChanged, { detail: this._dialogOrder }));
  }
  public get selectedDialog(): DialogBase {
    return [ ...this._dialogOrder ].reverse()[ 0 ];
  }

  private _loggedInUser: User | null;
  public get loggedInUser() {
    return this._loggedInUser;
  }

  constructor() {
    super();

    // Initialise defaults and persistance here
    this._selectedClassJobID = localStorage.getItem(AppStateKey.SelectedClassJobID) !== null ? Number(localStorage.getItem(AppStateKey.SelectedClassJobID)) : -1;

    this.addEventListener(AppStateEvent.UserLogin, (evt: CustomEvent<User>) => {
      this._loggedInUser = evt.detail;
    });
    this.addEventListener(AppStateEvent.UserLogout, (evt: CustomEvent<undefined>) => {
      this._loggedInUser = null;
    });
  }

  init() {}
}

declare global {
  interface ElementEventMap {
    [ AppStateEvent.ClassJobChanged ]: CustomEvent<number>;
  }
}
