import { DialogBase } from './dialog-base.js';
import { Services } from '../interfaces.js';
import { ContainerWidget } from '../widgets/container-widget.js';
import { TextWidget } from '../widgets/text-widget.js';
import { KeyBindingEvent } from '../services/key-binding.service.js';

export class KeybindingDialog extends DialogBase {
  public uiTitle = 'Keybinds';

  private abortController: AbortController;

  constructor(services: Services) {
    super(services);

    this.title = 'Keybindings';
    this.dialogClass = 'keybinding-dialog';

    this.createView();

    this.onKeyDown = this.onKeyDown.bind(this);

    this.afterViewCreated();
  }

  createView() {
    const keybindings = this.services.keyBindingService.getAllKeyBindings();
    const availableBindings = this.services.keyBindingService.getAvailableKeyBindings();

    this.contentContainer.append(...Object.keys(availableBindings).map((label) => {
      const binding = keybindings[ label ];
      const bindingTextWidget = new TextWidget(binding || ' ');

      this.services.keyBindingService.addEventListener(KeyBindingEvent.BindingChanged, (evt: CustomEvent<string>) => {
        if (label === evt.detail) {
          bindingTextWidget.text = this.services.keyBindingService.getBinding(label) || ' ';
        }
      });

      return new ContainerWidget('keybinding', {}, [
        new TextWidget(label, 'keybinding__label'),
        new ContainerWidget('keybinding__binding', {
          click: this.listenForKeyPress.bind(this, label, bindingTextWidget)
        }, [ bindingTextWidget ])
      ]);
    }))
  }

  private resetBinding(label: string, targetWidget: TextWidget) {
    const keybindings = this.services.keyBindingService.getAllKeyBindings();
    targetWidget.text = keybindings[ label ];
  }

  private setBinding(label: string, binding: string[], targetWidget: TextWidget) {
    targetWidget.text = binding.join('+');
    this.services.keyBindingService.setKeyBinding(label, targetWidget.text);
  }

  private listenForKeyPress(label: string, targetWidget: TextWidget) {
    const listener = (evt: KeyboardEvent) => {
      evt.stopImmediatePropagation();

      const binding = this.onKeyDown(evt);

      if (binding.length) {
        if (binding[ 0 ] === 'Escape') {
          this.resetBinding(label, targetWidget);
        } else {
          this.setBinding(label, binding, targetWidget);
        }
        document.removeEventListener('keydown', listener, { capture: true });
      }
    }

    if (this.abortController) {
      this.abortController.abort();
    }

    targetWidget.text = 'Assign keys...';
    this.abortController = new AbortController();
    this.abortController.signal.addEventListener('abort', () => this.resetBinding(label, targetWidget));
    document.addEventListener('keydown', listener, <any>{ capture: true, signal: this.abortController.signal });
  }

  private onKeyDown(evt: KeyboardEvent): string[] {
    evt.preventDefault();
    const sequence = [];

    // User pressed escape, abort rebinding
    if (evt.key === 'Escape') {
      return ['Escape'];
    }

    // Return if a modifier was pressed
    const MODIFIER_KEYS = [
      'Shift',
      'Control',
      'Alt',
      'Meta'
    ];
    if (MODIFIER_KEYS.includes(evt.key)) {
      return [];
    }

    // Add modifiers to sequence
    evt.ctrlKey && sequence.push('Ctrl');
    evt.shiftKey && sequence.push('Shift');
    evt.altKey && sequence.push('Alt');

    // Check if a number was pressed
    const [,digitMatch] = evt.code.match(/Digit(\d)/) || [];
    if (digitMatch !== undefined) {
      return [...sequence, digitMatch];
    }

    const [numpadMatch] = evt.code.match(/Numpad(\d)/g) || [];
    if (numpadMatch !== undefined) {
      return [...sequence, numpadMatch];
    }

    const [keyMatch] = evt.code.match(/Key(\S)/g) || [];
    if (keyMatch !== undefined) {
      return [...sequence, keyMatch];
    } else {
      // Just return the barebones key
      return [...sequence, evt.code];
    }
  }

}
