import {
  Action,
  Services
} from "../interfaces.js";
import { DialogBase } from "./dialog-base.js";
import { ContainerWidget } from '../widgets/container-widget.js';
import { ButtonWidget } from '../widgets/button-widget.js';
import { WidgetBase } from '../widgets/widget-base.js';
import { TextWidget } from '../widgets/text-widget.js';
import { ImageWidget } from '../widgets/image-widget.js';
import { HelpTextWidget } from '../widgets/help-text-widget.js';
import { GameDataService } from '../services/game-data.service.js';
import {
  Rotation,
  RotationPhase
} from '../rotation-hero/interfaces.js';
import { AppStateEvent } from '../services/app-state.service.js';
import { PhaseEnum } from '../rotation-hero/enums.js';
import { TextareaWidget } from '../widgets/textarea-widget.js';
import { InputWidget } from '../widgets/input.widget.js';
import { FormInputType } from '../widgets/form-widget.js';
import { API } from '../api.js';
import { ModalWidget } from '../widgets/modal-widget.js';
import { ToggleWidget } from '../widgets/toggle-widget.js';


export class RotationBuilderDialog extends DialogBase {
  public uiTitle = 'Builder';

  private _actions: Action[] = [];
  set actions(actions: Action[]) {
    this._actions = actions;
  }
  get actions(): Action[] {
    return this._actions;
  }

  private isRecording: boolean = false;
  private phaseWidgets: Map<PhaseEnum, RotationBuilderPhaseWidget>;

  private enabledPhases: PhaseEnum[] = [];
  private recordTarget: RotationBuilderPhaseWidget | null;

  private readonly titleInputWidget = new InputWidget(FormInputType.Text, 'rotation-builder__title-input');
  private readonly descriptionTextareaWidget = new TextareaWidget('rotation-builder__description-input');

  private readonly recordButtonWidget = new ButtonWidget('Record', 'rotation-builder__record-button', { click: this.toggleRecording.bind(this) });
  private readonly emptyHelpView = new TextWidget('\u261d\r\nEnable phases to start building your rotation', 'rotation-builder__empty-view');
  private readonly addingActionsHelpView = new HelpTextWidget(`Adding actions:\r\n- Press record, select a phase for recording and mash buttons\r\n- Drag and drop actions from the Actions & Traits dialog`, 'rb-add-action');

  constructor(
    services: Services
  ) {
    super(services);

    this.isVisible = true;
    this.title = 'Rotation Builder';
    this.dialogClass = 'rotation-builder';

    // Set placeholders
    this.titleInputWidget.viewContainer.placeholder = 'Enter rotation title';
    this.descriptionTextareaWidget.viewContainer.placeholder = 'Enter a description for your rotation';

    // Create phases
    this.phaseWidgets = new Map([
      [ PhaseEnum.PrePull, new RotationBuilderPhaseWidget(services.gameDataService, PhaseEnum.PrePull, { click: this.togglePhaseAsRecording.bind(this, PhaseEnum.PrePull) }) ],
      [ PhaseEnum.Opener, new RotationBuilderPhaseWidget(services.gameDataService, PhaseEnum.Opener, { click: this.togglePhaseAsRecording.bind(this, PhaseEnum.Opener) }) ],
      [ PhaseEnum.Cooldown, new RotationBuilderPhaseWidget(services.gameDataService, PhaseEnum.Cooldown, { click: this.togglePhaseAsRecording.bind(this, PhaseEnum.Cooldown) }) ],
      [ PhaseEnum.Burst, new RotationBuilderPhaseWidget(services.gameDataService, PhaseEnum.Burst, { click: this.togglePhaseAsRecording.bind(this, PhaseEnum.Burst) }) ]
    ])

    // Set up listeners
    this.services.actionService.addEventListener('trigger', this.onAction.bind(this));

    const metaInformation = new ContainerWidget('rotation-builder__meta-information', {}, [
      this.titleInputWidget,
      this.descriptionTextareaWidget
    ]);

    this.append(
      metaInformation,
      new ToggleWidget(metaInformation, new TextWidget('Toggle Meta Information'), 'rotation-builder__meta-toggle'),
      this.createToolbar(),
      this.addingActionsHelpView
    );

    for (let widget of this.phaseWidgets.entries()) {
      widget[1].hide();
      this.append(widget[1]);
    }

    // Hide adding action help view for now
    this.addingActionsHelpView.hide();
    this.recordButtonWidget.disabled = true;

    this.append(this.emptyHelpView);

    this.afterViewCreated();
  }

  private onAction(actionEvent: CustomEvent<Action>) {
    if (!this.isRecording || !this.recordTarget) {
      return;
    }

    this.recordTarget.appendAction(actionEvent.detail);
  }

  private togglePhaseAsRecording(phase: PhaseEnum) {
    if (!this.isRecording) {
      return;
    }

    if (this.recordTarget) this.recordTarget.removeModifier('record-active');
    const newPhase = <RotationBuilderPhaseWidget>this.phaseWidgets.get(phase);

    this.recordTarget = newPhase === this.recordTarget ? null : newPhase;

    if (this.recordTarget) {
      this.recordTarget.addModifier('record-active');
    }
  }

  private createToolbar() {
    const phaseButtons = new ContainerWidget(
      'rotation-builder__phase-buttons',
      {},
      [ PhaseEnum.PrePull, PhaseEnum.Opener, PhaseEnum.Cooldown, PhaseEnum.Burst ].map((phase) => {
        return new ButtonWidget(phase, 'rotation-builder__phase-button', { click: this.togglePhase.bind(this, phase) })
      })
    );

    return new ContainerWidget('rotation-builder__toolbar', {}, [
      this.recordButtonWidget,
      phaseButtons,
      new ButtonWidget('Try out', 'rotation-builder__save-button', { click: this.tryOutRotation.bind(this) }),
      new ButtonWidget('Save', 'rotation-builder__save-button', { click: this.saveRotation.bind(this) })
    ]);
  }

  private togglePhase(phase: PhaseEnum, evt: MouseEvent) {
    if (this.enabledPhases.includes(phase)) {
      this.enabledPhases.splice(this.enabledPhases.indexOf(phase), 1);
      (<HTMLButtonElement>evt.target).classList.remove('rotation-builder__phase-button--enabled');
      (<RotationBuilderPhaseWidget>this.phaseWidgets.get(phase)).hide();
    } else {
      this.enabledPhases.push(phase);
      (<HTMLButtonElement>evt.target).classList.add('rotation-builder__phase-button--enabled');
      (<RotationBuilderPhaseWidget>this.phaseWidgets.get(phase)).show();
    }

    if (this.enabledPhases.length) {
      this.emptyHelpView.hide();
      this.addingActionsHelpView.show();
      this.recordButtonWidget.disabled = false;
    } else {
      this.emptyHelpView.show();
      this.addingActionsHelpView.hide();
      this.recordButtonWidget.disabled = true;
    }
  }

  private toggleRecording() {
    this.isRecording = !this.isRecording;

    this.recordButtonWidget.text = this.isRecording ? 'Stop' : 'Record';
    this.recordButtonWidget.classList.toggle('rotation-builder__record-button--recording', this.isRecording);

    if (!this.isRecording) {
      this.recordTarget && this.recordTarget.removeModifier('record-active')
      this.recordTarget = null;
    }
  }

  private tryOutRotation() {
    this.services.appStateService.dispatchEvent(new CustomEvent(AppStateEvent.TryRotation, { detail: this.createRotation() }));
  }

  private createRotation(): Rotation {
    return {
      id: '',
      favouriteCount: 0,
      user: {
        id: '',
        username: ''
      },
      classJobId: this.services.appStateService.selectedClassJobID,
      phases: <RotationPhase[]>[ ...this.phaseWidgets.entries() ]
        .map(([, phase]) => phase.createPhase())
        .filter((phase) => phase !== null),
      description: this.descriptionTextareaWidget.value,
      title: this.titleInputWidget.value,
      patch: '',
      createdAt: '',
      public: false
    }
  }


  private async saveRotation() {
    if (!this.services.appStateService.loggedInUser) {
      this.append(new ModalWidget(new TextWidget('You need to be logged in to save rotations.')));
      return;
    }
    await API.createRotation(this.createRotation());
  }

}

class RotationBuilderPhaseWidget extends ContainerWidget {
  private _actions: Action[] = [];
  private set actions(actions: Action[]) {
    this._actions = actions;
  }
  private get actions() {
    return this._actions;
  }

  private readonly actionContainerWidget: ContainerWidget = new ContainerWidget('rotation-builder__phase-actions');
  private readonly actionWidgets: WidgetBase[] = [];

  private readonly phaseTargetTimeLabelWidget = new TextWidget('Target: 0s', 'rotation-builder__phase-target-time');
  private readonly phaseEstimatedTimeLabelWidget = new TextWidget('Est: 0s', 'rotation-builder__phase-estimated-time');

  constructor(
    private readonly gameDataService: GameDataService,
    public readonly phase: PhaseEnum,
    events: { [k: string]: () => any } = {}
  ) {
    super('rotation-builder__phase', events);
    this.createView();
  }

  createView() {
    const phaseLabelWidget = new TextWidget(this.phase, 'rotation-builder__phase-label');

    this.append(
      new ContainerWidget('rotation-builder__phase-information', {}, [
        phaseLabelWidget,
        this.phaseTargetTimeLabelWidget,
        this.phaseEstimatedTimeLabelWidget,
      ]),
      this.actionContainerWidget
    );

    this.actionContainerWidget.viewContainer.addEventListener('dragenter', (evt) => {
      this.actionContainerWidget.addModifier('drag-over');
      evt.preventDefault();
      return false;
    });

    this.actionContainerWidget.viewContainer.addEventListener('dragover', (evt) => {
      evt.preventDefault();
      return false;
    });

    this.actionContainerWidget.viewContainer.addEventListener('drop', (evt) => {
      evt.preventDefault();

      const dt = <DataTransfer>evt.dataTransfer;
      if (dt.getData('drag-type') === 'action') {
        const action = this.gameDataService.getActionById(parseInt(dt.getData('action-id'), 10));
        this.appendAction(action);
      }

      this.actionContainerWidget.removeModifier('drag-over');

      return false;
    });

    this.actionContainerWidget.viewContainer.addEventListener('dragleave', (evt) => {
      this.actionContainerWidget.removeModifier('drag-over');
      evt.preventDefault();
      return false;
    });
  }

  public appendAction(action: Action) {
    this.actions.push(action);
    const actionWidget = new ImageWidget(`https://xivapi.com${action.IconHD}`, 'rotation-builder__phase-action-image');
    actionWidget.viewContainer.addEventListener('click', () => {
      this.removeAction(actionWidget);
    });
    this.actionWidgets.push(actionWidget);
    this.actionContainerWidget.append(actionWidget);
    this.updateTimeEstimation();
  }

  public removeAction(widget: WidgetBase) {
    this.actionWidgets.splice(this.actionWidgets.indexOf(widget), 1);
    this.actionContainerWidget.remove(widget);
  }

  public updateTimeEstimation() {
    const estimate = this.actions.reduce((prev, next) => prev + next.Recast100ms/10, 0);
    this.phaseEstimatedTimeLabelWidget.text = `Est.: ${estimate}s`;
  }

  public loadActions(action: Action[]) {
    this.actions = [];
  }

  public createPhase(): RotationPhase | null {
    if (!this.actions || this.actions.length === 0) {
      return null;
    }

    return {
      phase: this.phase,
      actions: this.actions.map((action) => action.ID)
    }
  }
}
