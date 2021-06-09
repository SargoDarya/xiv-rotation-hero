import { createView } from "../utils.js";

class DialogDefaults {
  closable: boolean = true;
  resizable: boolean = false;
}
export abstract class DialogBase {
  public viewContainer = createView('div', 'dialog');
  private closeButton = createView('button', 'dialog__close-button');
  private titleContainer = createView('div', 'dialog__title', 'drag-handle');
  public contentContainer = createView('div', 'dialog__content');

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

  private _title: string = 'Dialog';
  public set title(title: string) {
    this._title = title;
    this.titleContainer.innerText = title;
  }
  public get title() {
    return this._title;
  }

  private _dialogClass: string = '';
  public set dialogClass(dialogClass: string) {
    this._dialogClass && this.viewContainer.classList.remove(this._dialogClass);
    this._dialogClass = dialogClass;
    this.viewContainer.classList.add(this._dialogClass);
  }
  public get dialogClass(): string {
    return this.dialogClass;
  }

  constructor(options: DialogDefaults = new DialogDefaults()) {
    this.onMouseDragStop = this.onMouseDragStop.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    if (options.closable) {
      this.viewContainer.appendChild(this.closeButton);
    }
    this.viewContainer.appendChild(this.titleContainer);
    this.viewContainer.appendChild(this.contentContainer);

    this.closeButton.addEventListener('click', () => this.isVisible = false);
  }

  protected afterViewCreated() {
    this.viewContainer.querySelectorAll('.drag-handle').forEach(element => {
      element.addEventListener('mousedown', this.onMouseDragStart.bind(this));
    });
  }

  public toggle(): void {
    this.isVisible = !this.isVisible;
  }

  protected appendChild(element: HTMLElement): void {
    this.contentContainer.appendChild(element);
  }

  private onMouseDragStart(evt: MouseEvent): void {
    if (evt.button !== 0) {
      return;
    }

    evt.preventDefault();

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseDragStop);

    this.lastMousePosition = [ evt.clientX, evt.clientY ];
  }

  private onMouseMove(evt: MouseEvent): void {
    evt.preventDefault();

    const { clientLeft, clientTop } = this.viewContainer;

    // Get difference between last and new position in pixels
    const [ oldX, oldY ] = this.lastMousePosition;
    const { clientX, clientY } = evt;
    const [ diffX, diffY ] = [ oldX - clientX, oldY - clientY ];
    this.lastMousePosition = [ clientX, clientY ];

    // Set position
    this.viewContainer.style.left = (clientX) + 'px';
    this.viewContainer.style.top = (clientY) + 'px';
  }

  private onMouseDragStop(evt: MouseEvent): void {
    document.removeEventListener('mouseup', this.onMouseDragStop);
    document.removeEventListener('mousemove', this.onMouseMove);
  }
}
