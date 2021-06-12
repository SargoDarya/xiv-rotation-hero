import { Services } from "../interfaces";
import { ServiceBase } from "./service-base";

interface GamepadCache {
  readonly buttons: number[];
  readonly axes: number[];
}

export enum GamepadCustomEvent {
  ButtonDown = 'gamepadbuttondown',
  ButtonUp = 'gamepadbuttonup',
  ButtonPress = 'gamepadbuttonpress',
}

export enum GamepadButtonState {
  Idle,
  Pressed,
  Held,
  Released
}

export enum PSGamepadButton {
  Cross,
  Circle,
  Square,
  Triangle,
  L1,
  R1,
  L2,
  R2,
  Select,
  Start,
  L3,
  R3,
  Up,
  Down,
  Left,
  Right
}

export enum PSGamepadAxis {
  LeftX,
  LeftY,
  RightX,
  RightY
}

export class GamepadService extends EventTarget implements ServiceBase {
  private gamepad: Gamepad | null;
  private gamepadCache: GamepadCache;
  private _hasUpdate: boolean;
  public get hasUpdate() { return this._hasUpdate; }

  public gamepadButtonState: GamepadButtonState[];

  constructor(private readonly services: Services) {
    super();
  }

  init() {
    window.addEventListener('gamepadconnected', this.onGamepadConnected.bind(this));
    window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected.bind(this));

    this.updateGamepadState = this.updateGamepadState.bind(this);
  }

  hasGamepad() {
    return !!this.gamepad;
  }

  onGamepadConnected() {
    this.gamepad = navigator.getGamepads()[0];

    if (!this.gamepad) return;
    this.updateGamepadCache(this.gamepad);
    this.updateGamepadState(this.gamepad);
  }

  onGamepadDisconnected() {
    this.gamepad = null;
  }

  /**
   * Takes care of updating the button state when there is a controller
   * available
   */
  poll() {
    const newState = navigator.getGamepads()[0];

    if (!newState) {
      return;
    }

    this._hasUpdate = !this.gamepad || this.gamepad.timestamp !== newState.timestamp;
    this.gamepad = newState;

    // Only run the update when actually something changed
    if (this._hasUpdate) {
      this.updateGamepadState(this.gamepad);
    }
  }

  updateGamepadState(gamepad: Gamepad) {
    const gamepadCache = this.gamepadCache;

    // Iterate buttons
    this.gamepadButtonState = gamepad.buttons.map((button, index) => {
      let buttonState: GamepadButtonState = GamepadButtonState.Idle;

      // Pressed
      if (button.value && !gamepadCache.buttons[ index ]) {
        buttonState = GamepadButtonState.Pressed;
      }

      // Held
      if (button.value && gamepadCache.buttons[ index ]) {
        buttonState = GamepadButtonState.Held;
      }

      // Released
      if (!button.value && gamepadCache.buttons[ index ]) {
        buttonState = GamepadButtonState.Released;
      }

      // Idle
      return buttonState;
    })

    this.updateGamepadCache(gamepad);
  }

  updateGamepadCache(gamepad: Gamepad) {
    this.gamepadCache = {
      buttons: gamepad.buttons.map(button => button.value),
      axes: [ ...gamepad.axes ]
    }
  }
}
