import {Action, RotationCreation, RotationUpdate, Services} from "../interfaces.js";
import {DialogBase} from "./dialog-base.js";
import {ContainerWidget} from '../widgets/container-widget.js';
import {ButtonWidget} from '../widgets/button-widget.js';
import {WidgetBase} from '../widgets/widget-base.js';
import {TextWidget} from '../widgets/text-widget.js';
import {ImageWidget} from '../widgets/image-widget.js';
import {HelpTextWidget} from '../widgets/help-text-widget.js';
import {GameDataService} from '../services/game-data.service.js';
import {Rotation, RotationPhase} from '../rotation-hero/interfaces.js';
import {AppStateEvent} from '../services/app-state.service.js';
import {PhaseEnum, PublishState} from '../rotation-hero/enums.js';
import {TextareaWidget} from '../widgets/textarea-widget.js';
import {InputWidget} from '../widgets/input.widget.js';
import {FormInputType} from '../widgets/form-widget.js';
import {API} from '../api.js';
import {ModalWidget} from '../widgets/modal-widget.js';
import {ToggleWidget} from '../widgets/toggle-widget.js';


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
  private phaseButtonWidgets: Map<PhaseEnum, ButtonWidget> = new Map();

  private recordTarget: RotationBuilderPhaseWidget | null;
  private rotation?: Rotation = undefined;
  private readonly enabledPhases: PhaseEnum[] = [];

  private readonly rotationIdWidget = new TextWidget('-', 'rotation-builder__rotation-id');
  private readonly titleInputWidget = new InputWidget(FormInputType.Text, 'rotation-builder__title-input');
  private readonly descriptionTextareaWidget = new TextareaWidget('rotation-builder__description-input');
  private readonly metaInformationContainerWidget: ContainerWidget;

  private readonly recordButtonWidget = new ButtonWidget('Record', 'rotation-builder__record-button', { click: this.toggleRecording.bind(this) });
  private readonly emptyHelpView = new TextWidget('\u261d\r\nEnable phases to start building your rotation', 'rotation-builder__empty-view');
  private readonly addingActionsHelpView = new HelpTextWidget(`Adding actions:\r\n- Press record, select a phase for recording and mash buttons\r\n- Drag and drop actions from the Actions & Traits dialog`, 'rb-add-action');

  private readonly TITLE_MIN_LENGTH = 10;
  private readonly TITLE_MAX_LENGTH = 50;

  private readonly DESCRIPTION_MIN_LENGTH = 0;
  private readonly DESCRIPTION_MAX_LENGTH = 500;

  constructor(
    services: Services
  ) {
    super(services);

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

    // Meta Information
    this.metaInformationContainerWidget = new ContainerWidget('rotation-builder__meta-information', {}, [
      new TextWidget('Title:', 'rotation-builder__meta-label'),
      this.titleInputWidget,
      new TextWidget('Description:', 'rotation-builder__meta-label'),
      this.descriptionTextareaWidget,
      new TextWidget('ID:', 'rotation-builder__meta-label'),
      this.rotationIdWidget
    ]);

    this.append(
      this.createToolbar(),
      this.addingActionsHelpView,
      this.metaInformationContainerWidget,
    );

    for (let widget of this.phaseWidgets.entries()) {
      widget[1].hide();
      this.append(widget[1]);
    }

    // Hide adding action help view for now
    this.addingActionsHelpView.hide();
    this.recordButtonWidget.disabled = true;

    this.append(this.emptyHelpView);

    // Set up listeners
    this.services.actionService.addEventListener('trigger', this.onAction.bind(this));

    // On load we want to set the rotation
    this.services.appStateService.addEventListener(AppStateEvent.EditRotation, (evt: CustomEvent<string>) => {
      this.loadRotation(evt.detail);
    })

    this.afterViewCreated();
  }

  /**
   * Resets the current rotation view
   */
  public resetRotation() {
    this.rotation = undefined;
    this.titleInputWidget.value = '';
    this.descriptionTextareaWidget.value = '';
    this.rotationIdWidget.text = '-';

    // Clear enabled phases
    for (let widget of this.phaseWidgets.values()) {
      widget.loadActions([]);
    }
    [...this.enabledPhases].forEach(this.togglePhase.bind(this));
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
    // Top Toolbar shows menu buttons
    const topToolbar = new ContainerWidget('rotation-builder__toolbar', {}, [
      new ButtonWidget('New', 'rotation-builder__toolbar-button', { click: this.resetRotation.bind(this) }),
      new ButtonWidget('Try', 'rotation-builder__toolbar-button', { click: this.tryOutRotation.bind(this) }),
      new ButtonWidget('Save/Update', 'rotation-builder__toolbar-button', { click: this.saveRotation.bind(this) })
    ]);
    topToolbar.addModifier('top');

    // Bottom Toolbar shows phases and the meta information toggle
    const bottomToolbar = new ContainerWidget('rotation-builder__toolbar', {}, [
      this.recordButtonWidget,
      new ContainerWidget(
        'rotation-builder__phase-buttons',
        {},
        [ PhaseEnum.PrePull, PhaseEnum.Opener, PhaseEnum.Cooldown, PhaseEnum.Burst ].map((phase) => {
          const widget = new ButtonWidget(phase, 'rotation-builder__phase-button', { click: this.togglePhase.bind(this, phase) });
          widget.title = `Toggle ${phase} phase`;
          this.phaseButtonWidgets.set(phase, widget);
          return widget;
        })
      ),
      new ToggleWidget(this.metaInformationContainerWidget, new TextWidget('Meta Info'), 'rotation-builder__meta-toggle'),
    ]);
    bottomToolbar.addModifier('bottom');

    return new ContainerWidget('rotation-builder__toolbars', {}, [
      topToolbar,
      bottomToolbar
    ]);
  }

  private togglePhase(phase: PhaseEnum) {
    const phaseButtonWidget = <ButtonWidget>this.phaseButtonWidgets.get(phase);

    if (this.enabledPhases.includes(phase)) {
      this.enabledPhases.splice(this.enabledPhases.indexOf(phase), 1);
      phaseButtonWidget.removeModifier('enabled');
      (<RotationBuilderPhaseWidget>this.phaseWidgets.get(phase)).hide();
    } else {
      this.enabledPhases.push(phase);
      phaseButtonWidget.addModifier('enabled');
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
    this.services.appStateService.dispatchEvent(
      new CustomEvent(AppStateEvent.TryRotation, {
        detail: {
          ...this.createRotation(),
          favouriteCount: 0
        }
      })
    );
  }

  private createRotation(): RotationCreation | RotationUpdate {
    return {
      id: this.rotation ? this.rotation.id : '',
      classJobId: this.services.appStateService.selectedClassJobID,
      phases: <RotationPhase[]>[ ...this.phaseWidgets.entries() ]
        .map(([, phase]) => phase.createPhase())
        .filter((phase) => phase !== null),
      description: this.descriptionTextareaWidget.value,
      title: this.titleInputWidget.value
    }
  }

  private async loadRotation(rotationId: string) {
    const rotation = await API.getRotation(rotationId);

    if (!rotation) {
      return;
    }

    this.resetRotation();
    this.rotation = rotation;
    this.show();

    this.titleInputWidget.value = rotation.title;
    this.descriptionTextareaWidget.value = rotation.description;
    this.rotationIdWidget.text = `${rotationId}`;

    rotation.phases.forEach((phase) => {
      this.togglePhase(phase.phase);
      const phaseWidget = <RotationBuilderPhaseWidget>this.phaseWidgets.get(phase.phase);
      phaseWidget.loadActions(phase.actions.map((actionId) => this.services.gameDataService.getActionById(actionId)));
    });

    this.focus();
  }

  private async saveRotation() {
    if (!this.services.appStateService.loggedInUser) {
      this.append(new ModalWidget(new TextWidget('You need to be logged in to save or update rotations.')));
      return;
    }

    // Check if rotation is valid
    const rotation = this.createRotation();
    if (rotation.title.length < this.TITLE_MIN_LENGTH || rotation.title.length > this.TITLE_MAX_LENGTH) {
      this.append(new ModalWidget(new TextWidget(`The title needs to be between ${this.TITLE_MIN_LENGTH} and ${this.TITLE_MAX_LENGTH} characters long.`)));
      return;
    }

    if (rotation.description.length < this.DESCRIPTION_MIN_LENGTH || rotation.title.length > this.DESCRIPTION_MAX_LENGTH) {
      this.append(new ModalWidget(new TextWidget(`The description needs to be between ${this.DESCRIPTION_MIN_LENGTH} and ${this.DESCRIPTION_MAX_LENGTH} characters long.`)));
      return;
    }

    let response: Response;

    if (this.rotation) {
      // Update rotation
      response = await API.updateRotation(<RotationUpdate>rotation);
    } else {
      // Save rotation
      response = await API.createRotation(rotation);
    }

    if (!response.ok) {
      const errorResponse = await response.json();
      this.append(new ModalWidget(new TextWidget(`There was an error saving your rotation: ${errorResponse.message}`)));
      return;
    }

    this.rotation = <Rotation>await response.json();

    this.append(new ModalWidget(new TextWidget('Your rotation has been saved.')));
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

  private createView() {
    const phaseLabelWidget = new TextWidget(this.phase, 'rotation-builder__phase-label');

    this.append(
      new ContainerWidget('rotation-builder__phase-information', {}, [
        phaseLabelWidget,
        // this.phaseTargetTimeLabelWidget,
        // this.phaseEstimatedTimeLabelWidget,
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

  public loadActions(actions: Action[] = []) {
    this.actions = [];
    this.actionWidgets.forEach((actionWidget) => actionWidget.removeSelf());
    this.actionWidgets.splice(0, this.actionWidgets.length);
    actions.forEach(this.appendAction.bind(this));
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

  private updateTimeEstimation() {
    const estimate = this.actions.reduce((prev, next) => prev + next.Recast100ms/10, 0);
    this.phaseEstimatedTimeLabelWidget.text = `Est.: ${estimate}s`;
  }
}
