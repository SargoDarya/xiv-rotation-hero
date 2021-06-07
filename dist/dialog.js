import { createView } from "./utils.js";
export class Dialog {
    constructor() {
        this.viewContainer = createView('div', 'dialog');
        this.closeButton = createView('button', 'dialog__close-button');
        this.titleContainer = createView('div', 'dialog__title');
        this.contentContainer = createView('div', 'dialog__content');
        this.lastMousePosition = [0, 0];
        this.visible = false;
        this.onMouseDragStop = this.onMouseDragStop.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.viewContainer.appendChild(this.closeButton);
        this.viewContainer.appendChild(this.titleContainer);
        this.viewContainer.appendChild(this.contentContainer);
        this.titleContainer.addEventListener('mousedown', this.onMouseDragStart.bind(this));
        this.closeButton.addEventListener('click', () => this.isVisible = false);
    }
    set isVisible(visible) {
        this.visible = visible;
        visible ? this.viewContainer.classList.add('dialog--visible') : this.viewContainer.classList.remove('dialog--visible');
    }
    get isVisible() {
        return this.visible;
    }
    setTitle(title) {
        this.titleContainer.innerText = title;
    }
    toggle() {
        this.isVisible = !this.isVisible;
    }
    onMouseDragStart(evt) {
        if (evt.button !== 0) {
            return;
        }
        evt.preventDefault();
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseDragStop);
        this.lastMousePosition = [evt.clientX, evt.clientY];
    }
    onMouseMove(evt) {
        evt.preventDefault();
        const { clientLeft, clientTop } = this.viewContainer;
        const [oldX, oldY] = this.lastMousePosition;
        const { clientX, clientY } = evt;
        const [diffX, diffY] = [oldX - clientX, oldY - clientY];
        this.lastMousePosition = [clientX, clientY];
        this.viewContainer.style.left = (clientX) + 'px';
        this.viewContainer.style.top = (clientY) + 'px';
    }
    onMouseDragStop(evt) {
        document.removeEventListener('mouseup', this.onMouseDragStop);
        document.removeEventListener('mousemove', this.onMouseMove);
    }
}
