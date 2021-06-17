import { Services } from "../interfaces.js";
import { AppStateEvent } from "../services/app-state.service.js";
import { DialogBase } from "./dialog-base.js";
import { ContainerWidget } from '../widgets/container-widget.js';
import { ImageWidget } from '../widgets/image-widget.js';
import { TextWidget } from '../widgets/text-widget.js';

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

    const actionsContainer = new ContainerWidget('actions-traits-dialog__actions', {}, [
      ...actions.map((action) =>
        new ContainerWidget('actions-traits-dialog__action', {}, [
          new ImageWidget(`https://xivapi.com${action.IconHD}`, 'actions-traits-dialog__action-icon'),
          new TextWidget(action.Name, 'actions-traits-dialog__action-title'),
          new TextWidget(`Level ${action.ClassJobLevel}`, 'actions-traits-dialog__action-level'),
        ])
      )
    ]);

    this.append(actionsContainer);
  }
}
