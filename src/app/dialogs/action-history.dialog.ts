import { Action } from "../interfaces.js";
import { ActionService } from "../services/action.service.js";
import { createView } from "../utils.js";
import { DialogBase } from "./dialog-base.js";

export class ActionHistoryDialog extends DialogBase {

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
    private readonly actionService: ActionService
  ) {
    super();

    this.isVisible = false;
    this.title = 'Action History';
    this.dialogClass = 'action-history';

    // Set up listeners
    this.actionService.addEventListener('trigger', this.onAction.bind(this));

    // Set up
    this.appendChild(this.sequenceIconsView);
    this.appendChild(this.sequenceIdsView);

    this.afterViewCreated();
  }

  private onAction(actionEvent: CustomEvent<Action>) {
    this.actions = [ ...this.actions, actionEvent.detail ];
  }

  private renderView() {
    this.sequenceIconsView.innerHTML = `${ this.actions.map((action) => `<img src="https://xivapi.com${action.IconHD}" />`).join('') }`;
    this.sequenceIdsView.innerText = `[ ${ this.actions.map(action => action.ID ).join(', ') } ]`;
  }

  private resetActions() {
    this.actions = [];
  }
}
