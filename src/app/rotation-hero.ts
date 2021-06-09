import { GameDataService } from "./services/game-data.service.js";
import { createView } from "./utils.js";

interface Rotation {
  actions: number[],
  title: string,
  repeatable?: boolean
}

interface RotationSet {
  title: string;
  rotations: Rotation[];
}

export class RotationHero {
  public viewContainer = createView('div', 'rotation-hero');

  public rotationSet: RotationSet = {
    title: 'Higanbana 1st',
    rotations: [
      {
        actions: [ 7477, 7478, 7479, 7480, 7481 ],
        title: 'Opener'
      },
      {
        actions: [ 7477, 7478, 7479, 7480, 7481 ],
        title: 'Cooldown Phase',
        repeatable: true
      },
      {
        actions: [ 7477, 7478, 7479, 7480, 7481 ],
        title: 'Burst Phase',
        repeatable: true
      }
    ]
  };
  public blindModeEnabled = false;
  public iteration = 0;
  public rotationsContainer = createView('div', 'rotation-hero__rotations');
  public rotationViews: RotationView[];

  private _currentRotationIndex = 0;
  public set currentRotationIndex(value: number) {
    this.rotationViews[this._currentRotationIndex].isActive = false;
    this._currentRotationIndex = value;
    this.rotationViews[this._currentRotationIndex].isActive = true;
  }
  public get currentRotationIndex() {
    return this._currentRotationIndex;
  }

  private _currentActionIndex = 0;
  public set currentActionIndex(value: number) {
    this._currentActionIndex = value;
    this.rotationViews[this._currentRotationIndex].activeActionIndex = value;
  }
  public get currentActionIndex() {
    return this._currentActionIndex;
  }

  constructor(
    private readonly gameDataService: GameDataService,
    isEmbedded: boolean = true
  ) {
    this.viewContainer.innerHTML = `
      <div class="rotation-hero__title-bar drag-handle">
        <div class="rotation-hero__title">Rotation Hero</div>
        <div class="rotation-hero__settings">&#9881;</div>
      </div>
    `;

    this.viewContainer.appendChild(this.rotationsContainer);

    this.rotationViews = this.rotationSet.rotations.map(
      (rotation) => new RotationView(this.gameDataService, rotation)
    );
    this.rotationViews.forEach(
      (view) => this.viewContainer.appendChild(view.viewContainer)
    );

    this.rotationViews[ 0 ].isActive = true;
    this.rotationViews[ 0 ].activeActionIndex = 0;

    if (!isEmbedded) {
      this.viewContainer.style.maxWidth = '400px';
      this.viewContainer.style.overflow = 'hidden';
    }
  }

  public recordAction(actionId: number) {
    const currentRotation: Rotation = this.rotationSet.rotations[ this.currentRotationIndex ];

    if (currentRotation.actions[ this.currentActionIndex ] === actionId) {
      this.currentActionIndex++;

      if (this.currentActionIndex === currentRotation.actions.length) {
        this.currentActionIndex = 0;
        this.rotationViews[ this.currentRotationIndex ].isDone = true;

        if (this.currentRotationIndex + 1 === this.rotationSet.rotations.length) {
          this.currentRotationIndex = this.rotationSet.rotations.findIndex((rotation) => rotation.repeatable);
          this.currentActionIndex = 0;
          this.iteration++;
        } else {
          this.currentRotationIndex++;
          this.rotationViews[ this.currentRotationIndex ].isDone = false;
        }
      }
    } else {
      this.currentActionIndex = 0;
      this.currentRotationIndex = 0;
      this.iteration = 0;

      this.rotationViews.forEach((view) => view.isDone = false);
    }
  }
}

class RotationView {

  public readonly viewContainer = createView('div', 'rotation-hero__rotation');
  private readonly rotationTitleContainer = createView('div', 'rotation-hero__rotation-title');
  private readonly rotationActionCounterContainer = createView('div', 'rotation-hero__action-counter');
  private readonly actionsContainer = createView('div', 'rotation-hero__actions');
  private readonly actionElements: HTMLElement[] = [];

  private _isActive: boolean = false;
  public set isActive(isActive: boolean) {
    this._isActive = isActive;
    isActive
      ? this.viewContainer.classList.add('rotation-hero__rotation--active')
      : this.viewContainer.classList.remove('rotation-hero__rotation--active');
  }
  public get isActive() {
    return this._isActive;
  }

  private _activeActionIndex: number | null = null;
  public set activeActionIndex(activeActionIndex: number | null) {
    this.actionElements.forEach((el, i) => {
      el.classList.remove('rotation-hero__action--done', 'rotation-hero__action--next');
      if (typeof activeActionIndex === 'number' && i < activeActionIndex) el.classList.add('rotation-hero__action--done');
      if (typeof activeActionIndex === 'number' && i === activeActionIndex) el.classList.add('rotation-hero__action--next');
    });

    if (typeof activeActionIndex === 'number') {
      this.rotationActionCounterContainer.innerText = `${activeActionIndex}/${this.rotation.actions.length}`;
    }
    this._activeActionIndex = activeActionIndex;
  }
  public get activeActionIndex() {
    return this._activeActionIndex;
  }

  private _isDone: boolean = false;
  public set isDone(isDone: boolean) {
    this._isDone = isDone;
    isDone
      ? this.viewContainer.classList.add('rotation-hero__rotation--done')
      : this.viewContainer.classList.remove('rotation-hero__rotation--done');
    isDone
      ? this.activeActionIndex = this.rotation.actions.length
      : this.activeActionIndex = 0;
  }
  public get isDone() {
    return this._isDone;
  }

  constructor(
    private readonly gameDataService: GameDataService,
    private readonly rotation: Rotation
  ) {
    this.rotationTitleContainer.innerText = rotation.title;
    this.viewContainer.appendChild(this.rotationTitleContainer);

    this.rotationActionCounterContainer.innerText = `0/${rotation.actions.length}`;
    this.viewContainer.appendChild(this.rotationActionCounterContainer);

    this.viewContainer.appendChild(this.actionsContainer);

    rotation.actions.map(actionId => {
      const action = this.gameDataService.getActionById(actionId);

      if (action) {
        const actionContainer = createView('div', 'rotation-hero__action');
        const img = new Image();
        img.src = `https://xivapi.com/${action.IconHD}`;
        actionContainer.appendChild(img);

        this.actionElements.push(actionContainer);

        this.actionsContainer.appendChild(actionContainer);
      }
    });

    this.activeActionIndex = 0;
  }

}
