import { ServiceBase } from "./service-base.js";

export enum KeyBindingEvent {
  BindingRegistered = 'app-bindingregistered',
  BindingChanged = 'app-bindingchanged'
}

export class KeyBindingService extends EventTarget implements ServiceBase {

  private availableBindings: { [ label: string ]: () => {} } = {};
  private labelToBindingMapping: { [ label: string ]: string } = {};
  private bindingToLabelMapping: { [ binding: string ]: string } = {};

  constructor() {
    super();
  }

  public init() {
    this.loadKeyBindings();
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  getAllKeyBindings() {
    return this.labelToBindingMapping;
  }

  getAvailableKeyBindings() {
    return this.availableBindings;
  }

  getBinding(label: string) {
    return this.labelToBindingMapping[ label ];
  }

  setKeyBinding(label: string, binding: string) {
    // Check if there was some other label assigned to the binding first
    const oldBindingLabel = this.bindingToLabelMapping[ binding ];
    const oldLabelBinding = this.labelToBindingMapping[ label ];
    if (oldBindingLabel) {
      delete this.labelToBindingMapping[oldBindingLabel];
      delete this.bindingToLabelMapping[binding];
      this.dispatchEvent(new CustomEvent(KeyBindingEvent.BindingChanged, { detail: oldBindingLabel }))
    }
    // Check if there was some other binding assigned to the label first
    if (oldLabelBinding) {
      delete this.bindingToLabelMapping[oldLabelBinding];
      // Note that this does not need an extra event as it's dispatched below already
    }

    this.bindingToLabelMapping[ binding ] = label;
    this.labelToBindingMapping[ label ] = binding;

    this.dispatchEvent(new CustomEvent(KeyBindingEvent.BindingChanged, { detail: label }))

    this.saveKeyBindings();
  }

  handleKeyDown(evt: KeyboardEvent): void {
    const { code, ctrlKey, shiftKey, altKey, repeat } = evt;

    if (repeat) {
      return;
    }

    const sequence = [];
    if (ctrlKey) sequence.push('Ctrl');
    if (shiftKey) sequence.push('Shift');
    if (altKey) sequence.push('Alt');

    // Check if a number was pressed
    const [,digitMatch] = evt.code.match(/Digit(\d)/) || [];
    const [numpadMatch] = evt.code.match(/Numpad(\d)/g) || [];
    if (digitMatch !== undefined) {
      sequence.push(digitMatch);
    } else if (numpadMatch !== undefined) {
      sequence.push(numpadMatch);
    } else {
      sequence.push(code);
    }

    const keyString = sequence.join('+');

    if (this.bindingToLabelMapping[ keyString ]) {
      this.availableBindings[ this.bindingToLabelMapping[ keyString ] ]();
      evt.preventDefault();
    }
  }

  registerAvailableBindings(label: string, keyDefault: string | undefined, cb: () => any): void {
    this.availableBindings[ label ] = cb;

    if (keyDefault && !Object.values(this.bindingToLabelMapping).includes(label)) {
      this.bindingToLabelMapping[ keyDefault ] = label;
      this.labelToBindingMapping[ label ] = keyDefault;
    }

    this.dispatchEvent(new CustomEvent(KeyBindingEvent.BindingRegistered, { detail: label }));
  }

  loadKeyBindings(): void {
    let savedKeyBindings = localStorage.getItem('key-bindings');

    if (savedKeyBindings) {
      this.bindingToLabelMapping = JSON.parse(savedKeyBindings);
      this.labelToBindingMapping = Object.entries(this.bindingToLabelMapping).reduce((prev, next) => {
        prev[ next[ 1 ] ] = next[ 0 ];
        return prev;
      }, <{ [k: string]: string}>{});
    }
  }

  saveKeyBindings(): void {
    localStorage.setItem('key-bindings', JSON.stringify(this.bindingToLabelMapping));
  }
}
