import { Services } from "./interfaces.js";
import { GameDataService } from "./services/game-data.service.js";
import { createSelect, createView } from "./utils.js";

interface Rotation {
  actions: number[],
  title: string,
  repeatable?: boolean
}

export interface RotationSet {
  title: string;
  classJobId: number;
  rotations: Rotation[];
}

export class RotationHero {
  public viewContainer = createView('div', 'rotation-hero');

  private rotationSet: RotationSet | null;
  private rotationPresets: RotationSet[] = [];
  private rotationsContainer = createView('div', 'rotation-hero__rotations');
  private presetContainer = <HTMLSelectElement>createView('select', 'rotation-hero__preset-select');
  private rotationViews: RotationView[];
  private currentClassJobId: number;

  private readonly gameDataService: GameDataService;

  public _iteration = 0;
  public set iteration(iteration: number) {
    this._iteration = iteration;
  }
  public get iteration(): number {
    return this._iteration;
  }

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
    private readonly services: { gameDataService: GameDataService },
    isEmbedded: boolean = true
  ) {
    this.gameDataService = services.gameDataService;

    this.viewContainer.innerHTML = `
      <div class="rotation-hero__title-bar drag-handle">
        <div class="rotation-hero__title">Rotation Hero</div>
        <div class="rotation-hero__settings">&#9881;</div>
      </div>
    `;

    this.viewContainer.appendChild(this.presetContainer);
    this.presetContainer.addEventListener('change', () => {
      this.selectRotationSet(this.rotationPresets[parseInt(this.presetContainer.value)] || null);
    });

    this.setPresets(this.gameDataService.getRotationPresets());

    this.viewContainer.appendChild(this.rotationsContainer);

    this.resetView();

    if (!isEmbedded) {
      this.viewContainer.style.maxWidth = '400px';
      this.viewContainer.style.overflow = 'hidden';
    }
  }

  public setCurrentClassJobId(classJobId: number) {
    this.currentClassJobId = classJobId;
    this.updatePresets();
    this.selectRotationSet(this.rotationPresets[0]);
  }

  public setPresets(presets: RotationSet[]) {
    this.rotationPresets = presets;
    this.updatePresets();
  }

  private updatePresets() {
    this.presetContainer.innerHTML = '';

    const availablePresetForCurrentJob = this.rotationPresets.filter((preset) => preset.classJobId === this.currentClassJobId)

    const emptyOption = document.createElement('option');
    emptyOption.label = availablePresetForCurrentJob.length ? 'Select a preset' : 'No presets available :(';
    this.presetContainer.disabled = availablePresetForCurrentJob.length === 0;
    this.presetContainer.appendChild(emptyOption);

    availablePresetForCurrentJob
      .forEach((preset, i) => {
        const opt = document.createElement('option');
        opt.value = i.toString();
        opt.label = `${preset.title}`;
        this.presetContainer.appendChild(opt);
      });
  }

  public selectRotationSet(rotationSet: RotationSet | null) {
    this.rotationSet = rotationSet;
    this.resetView();
  }

  public resetView() {
    this.rotationsContainer.innerHTML = '';

    if (this.rotationSet) {
      this.rotationViews = this.rotationSet.rotations.map(
        (rotation) => new RotationView(this.gameDataService, rotation)
      );
      this.rotationViews.forEach(
        (view) => this.rotationsContainer.appendChild(view.viewContainer)
      );

      this.rotationViews[ 0 ].isActive = true;
      this.rotationViews[ 0 ].activeActionIndex = 0;
    } else {
      // Show empty view for now
    }
  }

  public recordAction(actionId: number) {
    if (!this.rotationSet) { return; }

    const currentRotation: Rotation = this.rotationSet.rotations[ this.currentRotationIndex ];

    if (currentRotation.actions[ this.currentActionIndex ] === actionId) {
      this.currentActionIndex++;

      this.rotationViews[ this.currentRotationIndex ]

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
      this.actionsContainer.style.left = (20-(<HTMLElement>this.actionsContainer.children[ activeActionIndex ]).offsetLeft) + 'px';
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
