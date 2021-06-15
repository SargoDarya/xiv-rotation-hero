import { WidgetBase } from '../widgets/widget-base.js';
import { GameDataService } from '../services/game-data.service.js';
import { Rotation, RotationPhase } from './interfaces.js';
import { RotationPhaseView } from './rotation-phase-view.js';

/**
 *
 */
export class RotationPhasesView extends WidgetBase {
  private _currentRotationIndex = 0;
  public set currentRotationIndex(value: number) {
    this.rotationPhaseViews[this._currentRotationIndex].isActive = false;
    this._currentRotationIndex = value;
    this.rotationPhaseViews[this._currentRotationIndex].isActive = true;
  }
  public get currentRotationIndex() {
    return this._currentRotationIndex;
  }

  private _currentActionIndex = 0;
  public set currentActionIndex(value: number) {
    this._currentActionIndex = value;
    this.rotationPhaseViews[this._currentRotationIndex].activeActionIndex = value;
  }
  public get currentActionIndex() {
    return this._currentActionIndex;
  }

  private _rotation: Rotation | null;
  public set rotation(value: Rotation | null) {
    this._rotation = value;
    this.resetView();
  }
  public get rotation() { return this._rotation; }

  private rotationPhaseViews: RotationPhaseView[] = [];

  constructor(private readonly gameDataService: GameDataService) {
    super('rotation-hero__rotation-phases');
  }

  public resetView() {
    this.reset();

    if (this.rotation) {
      this.rotationPhaseViews = this.rotation.phases.map(
        (phase) => new RotationPhaseView(this.gameDataService, phase)
      );
      this.rotationPhaseViews.forEach(
        (view) => this.append(view)
      );

      this.rotationPhaseViews[ 0 ].isActive = true;
      this.rotationPhaseViews[ 0 ].activeActionIndex = 0;
    } else {
      // Show empty view for now
    }
  }

  public handleAction(actionId: number) {
    if (!this.rotation) {
      return;
    }

    const currentPhase: RotationPhase = this.rotation.phases[ this.currentRotationIndex ];

    if (currentPhase.actions[ this.currentActionIndex ] === actionId) {
      this.currentActionIndex++;

      if (this.currentActionIndex === currentPhase.actions.length) {
        this.currentActionIndex = 0;
        this.rotationPhaseViews[ this.currentRotationIndex ].isDone = true;

        if (this.currentRotationIndex + 1 === this.rotation.phases.length) {
          this.currentRotationIndex = this.rotation.phases.findIndex((phase) => phase.repeatable);
          this.currentActionIndex = 0;
          // this.iteration++;
        } else {
          this.currentRotationIndex++;
          this.rotationPhaseViews[ this.currentRotationIndex ].isDone = false;
        }
      }
    } else {
      this.currentActionIndex = 0;
      this.currentRotationIndex = 0;
      // this.iteration = 0;

      this.rotationPhaseViews.forEach((view) => view.isDone = false);
    }
  }
}
