import { WidgetBase } from '../widgets/widget-base.js';
import { TextWidget } from '../widgets/text-widget.js';
import { ContainerWidget } from '../widgets/container-widget.js';
import { GameDataService } from '../services/game-data.service.js';
import { RotationPhase } from './interfaces.js';

/**
 *
 */
export class RotationPhaseView extends WidgetBase {
  private readonly rotationTitleWidget = new TextWidget('', 'rotation-hero__rotation-title');
  private readonly rotationActionCounterWidget = new TextWidget('', 'rotation-hero__action-counter');
  private readonly actionsContainer = new ContainerWidget('rotation-hero__actions');
  private readonly actionWidgets: WidgetBase[] = [];

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
    this.actionWidgets.forEach((el, i) => {
      el.classList.remove('rotation-hero__action--done', 'rotation-hero__action--next');
      if (typeof activeActionIndex === 'number' && i < activeActionIndex) el.classList.add('rotation-hero__action--done');
      if (typeof activeActionIndex === 'number' && i === activeActionIndex) el.classList.add('rotation-hero__action--next');
    });

    if (typeof activeActionIndex === 'number') {
      this.rotationActionCounterWidget.text = `${activeActionIndex}/${this.rotationPhase.actions.length}`;
      this.actionsContainer.viewContainer.style.left = (20-(<WidgetBase>this.actionWidgets[ activeActionIndex ]).viewContainer.offsetLeft) + 'px';
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
      ? this.activeActionIndex = this.rotationPhase.actions.length
      : this.activeActionIndex = 0;
  }
  public get isDone() {
    return this._isDone;
  }

  constructor(
    private readonly gameDataService: GameDataService,
    private readonly rotationPhase: RotationPhase
  ) {
    super('rotation-hero__rotation');

    this.rotationTitleWidget.text = rotationPhase.phase;
    this.rotationActionCounterWidget.text = `0/${rotationPhase.actions.length}`;
    this.append(
      this.rotationTitleWidget,
      this.rotationActionCounterWidget,
      this.actionsContainer
    );

    rotationPhase.actions.map(actionId => {
      const action = this.gameDataService.getActionById(actionId);

      if (action) {
        const actionContainer = new ContainerWidget('rotation-hero__action');
        const img = new Image();
        img.src = `https://xivapi.com/${action.IconHD}`;
        actionContainer.viewContainer.appendChild(img);

        this.actionWidgets.push(actionContainer);

        this.actionsContainer.append(actionContainer);
      }
    });

    this.activeActionIndex = 0;
  }
}
