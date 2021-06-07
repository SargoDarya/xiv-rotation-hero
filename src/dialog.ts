import { createView } from "./utils.js";

export abstract class Dialog {
  public viewContainer = createView('div', 'dialog');
  private closeButton = createView('button', 'dialog__close-button');
  private titleContainer = createView('div', 'dialog__title');
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

  constructor() {
    this.onMouseDragStop = this.onMouseDragStop.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    this.viewContainer.appendChild(this.closeButton);
    this.viewContainer.appendChild(this.titleContainer);
    this.viewContainer.appendChild(this.contentContainer);

    this.titleContainer.addEventListener('mousedown', this.onMouseDragStart.bind(this));
    this.closeButton.addEventListener('click', () => this.isVisible = false);
  }

  public setTitle(title: string) {
    this.titleContainer.innerText = title;
  }

  public toggle() {
    this.isVisible = !this.isVisible;
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
