import { createView } from '../utils.js';

export class WidgetBase extends EventTarget {
  public readonly viewContainer: HTMLElement;

  private _isVisible = true;
  public set isVisible(value: boolean) {
    this._isVisible = value;
    this.viewContainer.style.display = value ? '' : 'none';
  }
  public get isVisible() { return this._isVisible; }

  // Just a shortcut for the view container
  public readonly classList: DOMTokenList;

  private readonly children: Set<WidgetBase> = new Set<WidgetBase>();

  constructor(private readonly widgetClassName: string, containerType = 'div') {
    super();

    this.viewContainer = createView(containerType, widgetClassName);
    this.classList = this.viewContainer.classList;
  }

  // VISIBILITY HELPERS
  public show() {
    this.isVisible = true;
  }
  public hide() {
    this.isVisible = false;
  }

  // BEM SUPPORT CLASSES
  public addModifier(...modifiers: string[]) {
    modifiers.forEach(modifier => {
      this.classList.add(`${this.widgetClassName}--${modifier}`);
    });
  }
  public removeModifier(...modifiers: string[]) {
    modifiers.forEach(modifier => {
      this.classList.remove(`${this.widgetClassName}--${modifier}`);
    });
  }
  public toggleModifier(modifier: string) {
    this.classList.toggle(`${this.widgetClassName}--${modifier}`);
  }

  public append(...widgets: WidgetBase[]): void {
    widgets.forEach((widget) => {
      this.children.add(widget);
      this.viewContainer.appendChild(widget.viewContainer);
    });
  }

  public remove(...widgets: WidgetBase[]): void {
    widgets.forEach((widget) => {
      this.children.delete(widget);
      this.viewContainer.removeChild(widget.viewContainer);
    });
  }

  protected reset(): void {
    this.children.forEach((child) => {
      this.viewContainer.removeChild(child.viewContainer);
      this.children.delete(child);
    });
  }

  protected registerEvents(events: { [ k: string] : () => any }): void {
    for (let k in events) {
      this.viewContainer.addEventListener(k, events[ k ]);
    }
  }
}
