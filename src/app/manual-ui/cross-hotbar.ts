import { Services } from "../interfaces.js";
import { GamepadButtonState, PSGamepadButton } from "../services/gamepad.service.js";
import { createView } from "../utils.js";

enum CrossHotbarSide {
  Left,
  Right
}

export class CrossHotbar {
  public viewContainer = createView('div', 'cross-hotbar');
  private activeHotbarIndex = 0;
  private _activeHotbarSide: CrossHotbarSide | null = null;
  private set activeHotbarSide(value: CrossHotbarSide | null) {
    if (this._activeHotbarSide !== null) {
      const oldSide = this._activeHotbarSide === CrossHotbarSide.Left ? 'left' : 'right';
      this.viewContainer.querySelector(`.cross-hotbar__side--${ oldSide }`)?.classList.remove('cross-hotbar__side--active');
    }
    this._activeHotbarSide = value;
    if (this._activeHotbarSide !== null) {
      const newSide = value === CrossHotbarSide.Left ? 'left' : 'right';
      this.viewContainer.querySelector(`.cross-hotbar__side--${ newSide }`)?.classList.add('cross-hotbar__side--active');
    }
  }
  private get activeHotbarSide() { return this._activeHotbarSide; }

  private readonly crossHotbarSets: Array<[Array<any>, Array<any>]> = [];
  private readonly HOTBAR_SET_COUNT = 8;
  private readonly BUTTON_ORDER = [
    PSGamepadButton.Left,
    PSGamepadButton.Up,
    PSGamepadButton.Down,
    PSGamepadButton.Right,
    PSGamepadButton.Square,
    PSGamepadButton.Triangle,
    PSGamepadButton.Cross,
    PSGamepadButton.Circle,
  ];

  private hotbarSideElements = [
    createView('div', 'cross-hotbar__side', 'cross-hotbar__side--left'),
    createView('div', 'cross-hotbar__side', 'cross-hotbar__side--right')
  ]

  constructor(private readonly services: Services) {
    this.createEmptyHotbarSets();

    this.viewContainer.appendChild(this.hotbarSideElements[ 0 ]);
    this.viewContainer.appendChild(this.hotbarSideElements[ 1 ]);

    this.hotbarSideElements.forEach((element) => {
      for (let i=0; i<8; i++) {
        element.appendChild(createView('div', 'cross-hotbar__slot', `cross-hotbar__slot--${i+1}`));
      }
    });
  }

  createEmptyHotbarSets() {
    for (let i=0; i<this.HOTBAR_SET_COUNT; i++) {
      this.crossHotbarSets.push(
        [
          [ null, null, null, null, null, null, null, null ],
          [ null, null, null, null, null, null, null, null ]
        ]
      );
    }
  }

  selectHotbarSet(hotbarIndex: number) {
    this.activeHotbarIndex = hotbarIndex;
  }

  handleTick() {
    // Only update when there are actual updates
    if (!this.services.gamepadService.hasGamepad() || !this.services.gamepadService.hasUpdate) {
      return;
    }

    const b = this.services.gamepadService.gamepadButtonState
    this.updateSelectedSide(b[ PSGamepadButton.L2 ], b[ PSGamepadButton.R2 ]);

    // Get pressed buttons
    const actionIndex = this.BUTTON_ORDER.findIndex((button) => b[button] === GamepadButtonState.Pressed);
    if (this.activeHotbarSide !== null && actionIndex !== -1) {
      console.log(`triggering ${this.activeHotbarSide} ${actionIndex}`);
      const targetElement = this.hotbarSideElements[ this.activeHotbarSide ].children[ actionIndex ];
      targetElement.classList.add('cross-hotbar__slot--triggered');

      setTimeout(() => {
        targetElement.classList.remove('cross-hotbar__slot--triggered');
      }, 100);
    }
  }

  /**
   * If a new hotbar side is selected it always overrides the previous one.
   * If both keys are held, the later one wins.
   * If one is released it goes back to the still held button.
   */
  updateSelectedSide(l2ButtonState: GamepadButtonState, r2ButtonState: GamepadButtonState) {
    // Check for released state first and only clear
    // if that side is responsible
    if (l2ButtonState === GamepadButtonState.Released && this.activeHotbarSide === CrossHotbarSide.Left) {
      this.activeHotbarSide = null;
    }
    if (r2ButtonState === GamepadButtonState.Released && this.activeHotbarSide === CrossHotbarSide.Right) {
      this.activeHotbarSide = null;
    }

    // Check for pressed state
    if (l2ButtonState === GamepadButtonState.Pressed ||
        (this.activeHotbarSide === null && l2ButtonState === GamepadButtonState.Held)) {
      this.activeHotbarSide = CrossHotbarSide.Left;
    }
    if (r2ButtonState === GamepadButtonState.Pressed ||
        (this.activeHotbarSide === null && r2ButtonState === GamepadButtonState.Held)) {
      this.activeHotbarSide = CrossHotbarSide.Right;
    }
  }
}
