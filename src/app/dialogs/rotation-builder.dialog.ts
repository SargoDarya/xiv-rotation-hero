import { Action, Services } from "../interfaces.js";
import { ActionService } from "../services/action.service.js";
import { createView } from "../utils.js";
import { DialogBase } from "./dialog-base.js";

export class RotationBuilderDialog extends DialogBase {
  public uiTitle = 'Rotation Builder';

  private _actions: Action[] = [];
  set actions(actions: Action[]) {
    this._actions = actions;
    this.renderView();
  }
  get actions(): Action[] {
    return this._actions;
  }

  private readonly sequenceIconsView = createView('div', 'action-history__sequence-icons');
  private readonly sequenceIdsView = createView('div', 'action-history__sequence-ids');

  constructor(
    services: Services
  ) {
    super(services);

    this.isVisible = false;
    this.title = 'Rotation Builder';
    this.dialogClass = 'rotation-builder';

    // Set up listeners
    this.services.actionService.addEventListener('trigger', this.onAction.bind(this));

    // Set up
    this.appendChild(this.sequenceIconsView);
    this.appendChild(this.sequenceIdsView);

    this.afterViewCreated();
  }

  private onAction(actionEvent: CustomEvent<Action>) {
    // only record when visible
    if (this.isVisible) {
      this.actions = [ ...this.actions, actionEvent.detail ];
    }
  }

  private renderView() {
    this.sequenceIconsView.innerHTML = `${ this.actions.map((action) => `<img src="https://xivapi.com${action.IconHD}" />`).join('') }`;
    this.sequenceIdsView.innerText = `[ ${ this.actions.map(action => action.ID ).join(', ') } ]`;
  }

  private resetActions() {
    this.actions = [];
  }
}
