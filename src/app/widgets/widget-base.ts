import { createView } from '../utils.js';

export class WidgetBase extends EventTarget {
  public readonly viewContainer: HTMLElement;

  private _isVisible = true;
  public set isVisible(value: boolean) {
    this._isVisible = value;
    this.viewContainer.style.display = value ? '' : 'none';
  }
  public get isVisible() { return this._isVisible; }

  public parent?: WidgetBase;

  // Just a shortcut for the view container
  // Prefer using the *Modifier methods.
  public readonly classList: DOMTokenList;

  private readonly children: Set<WidgetBase> = new Set<WidgetBase>();

  constructor(private readonly widgetClassName: string, containerType = 'div') {
    super();

    this.viewContainer = createView(containerType, widgetClassName);
    this.classList = this.viewContainer.classList;
  }

  // VISIBILITY HELPERS
  /**
   * Show this widget
   */
  public show() {
    this.isVisible = true;
  }

  /**
   * Hide this widget
   */
  public hide() {
    this.isVisible = false;
  }

  // BEM SUPPORT CLASSES
  /**
   * Add given modifiers from the widgets container
   */
  public addModifier(...modifiers: string[]) {
    modifiers.forEach(modifier => {
      this.classList.add(`${this.widgetClassName}--${modifier}`);
    });
  }

  /**
   * Remove given modifiers from the widgets container
   */
  public removeModifier(...modifiers: string[]) {
    modifiers.forEach(modifier => {
      this.classList.remove(`${this.widgetClassName}--${modifier}`);
    });
  }

  /**
   * Toggle a modifier with the widget base class according to BEM.
   * Can alternatively be set to always force a state.
   */
  public toggleModifier(modifier: string, force?: boolean) {
    if (typeof force !== 'undefined') {
      force
        ? this.addModifier(modifier)
        : this.removeModifier(modifier)

    } else {
      this.classList.toggle(`${this.widgetClassName}--${modifier}`);
    }
  }

  /**
   * Appends given widgets to the container
   */
  public append(...widgets: WidgetBase[]): void {
    widgets.forEach((widget) => {
      widget.parent = this;
      this.children.add(widget);
      this.viewContainer.appendChild(widget.viewContainer);
    });
  }

  /**
   * Removes given widgets from the container
   */
  public remove(...widgets: WidgetBase[]): void {
    widgets.forEach((widget) => {
      this.children.delete(widget);

      this.viewContainer.removeChild(widget.viewContainer);
    });
  }

  /**
   * Removes itself from the parent container if a parent container
   * is available.
   */
  public removeSelf(): void {
    if (!this.parent) {
      return;
    }

    this.parent.remove(this);
  }

  /**
   * Removes all children from the container essentially resetting
   * the view.
   */
  protected reset(): void {
    this.children.forEach((child) => {
      this.viewContainer.removeChild(child.viewContainer);
      this.children.delete(child);
    });
  }

  /**
   * Registers an object full with events on the view container
   */
  protected registerEvents(events: { [ k: string] : () => any }): void {
    for (let k in events) {
      this.viewContainer.addEventListener(k, events[ k ]);
    }
  }
}
