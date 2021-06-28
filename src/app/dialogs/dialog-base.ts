import { Services } from "../interfaces.js";
import { AppStateEvent } from "../services/app-state.service.js";
import { WidgetBase } from '../widgets/widget-base.js';
import { ContainerWidget } from '../widgets/container-widget.js';
import { ButtonWidget } from '../widgets/button-widget.js';
import { TextWidget } from '../widgets/text-widget.js';

class DialogDefaults {
  closable: boolean = true;
  resizable: boolean = false;
}
export abstract class DialogBase extends WidgetBase {
  public contentContainer = new ContainerWidget('dialog__content');
  private closeButton = new ButtonWidget('', 'dialog__close-button');
  private titleContainer = new TextWidget('', 'dialog__title');

  public abstract uiTitle: string;

  protected readonly services: Services;

  private position: [ number, number ];
  private lastMousePosition: [ number, number ] = [ 0, 0 ];

  /**
   * Handles visibility of the dialog
   */
  private visible: boolean = false;
  public set isVisible(visible: boolean) {
    this.visible = visible;
    visible ? this.viewContainer.classList.add('dialog--visible') : this.viewContainer.classList.remove('dialog--visible');
  }
  public get isVisible() {
    return this.visible;
  }

  /**
   * Sets a title for the dialog. If no title is set
   * it will be hidden.
   */
  private _title: string = 'Dialog';
  public set title(title: string) {
    this._title = title;
    this.titleContainer.text = title;
    this.titleContainer.toggleModifier('empty', title.length === 0);
  }
  public get title() {
    return this._title;
  }

  /**
   * Sets a specific dialog class
   */
  private _dialogClass: string = '';
  public set dialogClass(dialogClass: string) {
    this._dialogClass && this.viewContainer.classList.remove(this._dialogClass);
    this._dialogClass = dialogClass;
    this.viewContainer.classList.add(this._dialogClass);
  }
  public get dialogClass(): string {
    return this._dialogClass;
  }

  protected constructor(services: Services, options: DialogDefaults = new DialogDefaults()) {
    super('dialog');

    this.services = services;
    this.onMouseDragStop = this.onMouseDragStop.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    this.createDialogBase();
    this.title = '';
    this.titleContainer.classList.add('drag-handle');

    this.services.appStateService.addEventListener(AppStateEvent.DialogOrderChanged, this.onDialogOrderChange.bind(this));

    if (!options.closable) {
      this.closeButton.addModifier('hidden');
    }

    this.viewContainer.addEventListener('mousedown', () => {
      if (this.services.appStateService.selectedDialog !== this) {
        this.services.appStateService.selectedDialog = this;
      }
    });

    this.closeButton.viewContainer.addEventListener('click', () => this.isVisible = false);

    this.updatePosition(100, 100);
  }

  /**
   * Toggles the visibility of the dialog
   */
  public toggle(): void {
    this.isVisible = !this.isVisible;
  }

  // Private methods
  public afterViewCreated() {
    this.viewContainer.querySelectorAll('.drag-handle').forEach(element => {
      element.addEventListener('mousedown', this.onMouseDragStart.bind(this));
    });
  }

  public focus() {
    this.services.appStateService.selectedDialog = this;
  }

  private onDialogOrderChange(evt: CustomEvent<DialogBase[]>) {
    const zPosition = evt.detail.indexOf(this) + 1;
    this.viewContainer.style.zIndex = zPosition.toString(10);

    if (zPosition === evt.detail.length) {
      this.viewContainer.classList.add('dialog--focus');
    } else {
      this.viewContainer.classList.remove('dialog--focus');
    }
  }

  private createDialogBase() {
    this.append(
      this.closeButton,
      this.titleContainer,
      this.contentContainer
    )
  }

  // Convenience methods for subclasses
  protected appendContent(widget: WidgetBase): void {
    this.contentContainer.append(widget);
  }

  // Event listeners for drag handling
  private onMouseDragStart(evt: MouseEvent): void {
    if (evt.button !== 0) {
      return;
    }

    evt.preventDefault();

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseDragStop);

    if (!this.position) {
      this.position = [
        this.viewContainer.clientLeft,
        this.viewContainer.clientTop
      ]
    }

    this.lastMousePosition = [ evt.clientX, evt.clientY ];
  }

  private onMouseMove(evt: MouseEvent): void {
    evt.preventDefault();

    const { offsetLeft, offsetTop } = this.viewContainer;

    // Get difference between last and new position in pixels
    const [ oldX, oldY ] = this.lastMousePosition;
    const { clientX, clientY } = evt;
    const [ diffX, diffY ] = [ oldX - clientX, oldY - clientY ];
    this.lastMousePosition = [ clientX, clientY ];

    // Set position
    this.updatePosition(offsetLeft - diffX, offsetTop - diffY);
  }

  private updatePosition(x: number, y: number) {
    this.viewContainer.style.left = Math.max(x, 0) + 'px';
    this.viewContainer.style.top = Math.max(y, 0) + 'px';
  }

  private onMouseDragStop(): void {
    document.removeEventListener('mouseup', this.onMouseDragStop);
    document.removeEventListener('mousemove', this.onMouseMove);
  }
}
