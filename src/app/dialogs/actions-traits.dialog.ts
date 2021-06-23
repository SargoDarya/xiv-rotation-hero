import { Services } from "../interfaces.js";
import { AppStateEvent } from "../services/app-state.service.js";
import { DialogBase } from "./dialog-base.js";
import { ContainerWidget } from '../widgets/container-widget.js';
import { TextWidget } from '../widgets/text-widget.js';
import { ActionWidget } from '../widgets/action-widget.js';
import { WidgetBase } from '../widgets/widget-base';

export class ActionsTraitsDialog extends DialogBase {
  public uiTitle = 'Actions & Traits';
  private readonly actionsContainer = new ContainerWidget('actions-traits-dialog__actions', {}, []);
  private readonly actionsWidgets: WidgetBase[] = [];

  constructor(services: Services) {
    super(services);

    this.title = 'Actions & Traits';
    this.dialogClass = 'actions-traits-dialog';

    this.afterViewCreated();

    this.services.appStateService.addEventListener(AppStateEvent.ClassJobChanged,
      (evt: CustomEvent<number>) => this.updateViewForClassJobID(evt.detail)
    );

    this.append(this.actionsContainer);

    this.updateViewForClassJobID(this.services.appStateService.selectedClassJobID);
  }

  updateViewForClassJobID(classJobId: number) {
    this.actionsContainer.remove(...this.actionsWidgets);

    if (classJobId === -1) {
      // this.contentContainer. = 'Select a Job to get started.';
      return;
    }

    const actions = [
      ...this.services.gameDataService.getActionsByClassJobId(classJobId),
      // ...this.services.gameDataService.getActionIndirectionsByClassJobId(classJobId).map((a) => a.Name)
    ]
      .filter(a => a.ClassJobLevel !== 0)
      .sort((a, b) => a.ClassJobLevel - b.ClassJobLevel);

    this.actionsWidgets.splice(0, this.actionsWidgets.length, ...actions.map((action) =>
      new ContainerWidget('actions-traits-dialog__action', {}, [
        new ActionWidget(action, this.services),
        new TextWidget(action.Name, 'actions-traits-dialog__action-title'),
        new TextWidget(`Level ${action.ClassJobLevel}`, 'actions-traits-dialog__action-level'),
      ])
    ));

    this.actionsContainer.append(
      ...this.actionsWidgets
    );
  }
}
