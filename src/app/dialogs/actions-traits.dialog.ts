import { Services } from "../interfaces.js";
import { AppStateEvent } from "../services/app-state.service.js";
import { createView } from "../utils.js";
import { DialogBase } from "./dialog-base.js";

export class ActionsTraitsDialog extends DialogBase {
  public uiTitle = 'Actions & Traits';

  constructor(services: Services) {
    super(services);

    this.title = 'Actions & Traits';
    this.dialogClass = 'actions-traits-dialog';

    this.afterViewCreated();

    this.services.appStateService.addEventListener(AppStateEvent.ClassJobChanged,
      (evt: CustomEvent<number>) => this.updateViewForClassJobID(evt.detail)
    );

    this.updateViewForClassJobID(this.services.appStateService.selectedClassJobID);
  }

  updateViewForClassJobID(classJobId: number) {
    this.contentContainer.innerHTML = '';

    if (classJobId === -1) {
      this.contentContainer.innerText = 'Select a Job to get started.';
      return;
    }

    const actions = [ ...this.services.gameDataService.getActionsByClassJobId(classJobId) ].sort((a, b) => a.ClassJobLevel - b.ClassJobLevel);

    actions.forEach((action) => {
      const actionElement = createView('div', 'actions-traits-dialog__action');

      actionElement.innerHTML = `
        <img src="https://xivapi.com${action.IconHD}" class="actions-traits-dialog__action-icon" />
        <div class="actions-traits-dialog__action-title">${action.Name}</div>
        <div class="actions-traits-dialog__action-level">Lv. ${action.ClassJobLevel}</div>
      `;

      this.appendChild(actionElement);
    });
  }
}
