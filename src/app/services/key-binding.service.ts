import { Services } from "../interfaces";
import { ServiceBase } from "./service-base";

export class KeyBindingService implements ServiceBase {

  private availableBindings: { [ k: string ]: () => {} } = {};
  private keyBindings: { [ k: string ]: string } = {};
  private reverseMapping: { [ k: string ]: string } = {};

  constructor(private readonly services: Services) {}

  public init() {
    this.loadKeyBindings();
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  handleKeyDown(evt: KeyboardEvent): void {
    const { code, ctrlKey, shiftKey, altKey, repeat } = evt;

    if (repeat) {
      return;
    }

    const keys = [];
    if (ctrlKey) keys.push('Ctrl');
    if (shiftKey) keys.push('Shift');
    if (altKey) keys.push('Alt');
    keys.push(code);

    const keyString = keys.join('+');

    if (this.keyBindings[ keyString ]) {
      this.availableBindings[ this.keyBindings[ keyString ] ]();
    }
  }

  registerAvailableBindings(action: string, keyDefault: string | undefined, cb: () => any): void {
    this.availableBindings[ action ] = cb;

    if (keyDefault && !Object.values(this.keyBindings).includes(action)) {
      this.keyBindings[ keyDefault ] = action;
      this.reverseMapping[ action ] = keyDefault;
    }
  }

  loadKeyBindings(): void {
    let savedKeyBindings = localStorage.getItem('key-bindings');

    if (!savedKeyBindings) {
      // this.keyBindings = [];
    } else {
      const keyBindings = JSON.parse(savedKeyBindings);
      this.keyBindings = {}
    }
  }

  saveKeyBindings(): void {
  }
}
