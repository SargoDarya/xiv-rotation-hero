import { Action, Job } from "../interfaces";
import { RotationSet } from "../rotation-hero";

export class GameDataService extends EventTarget {
  private actionsById: { [ actionId: number ]: Action } = {};
  private actionsByClassJob: { [ classJobId: string ]: Action[] } = {};
  private classJobs: Job[] = [];
  private rotationPresets: RotationSet[];

  async load() {
    // Load game data
    await Promise.all([
      fetch('./assets/classjobactions.json')
        .then(response => response.json())
        .then(this.registerActions.bind(this)),
      fetch('./assets/classjobs.json')
        .then(response => response.json())
        .then((response) => this.classJobs = response),
      fetch('./assets/rotation-presets.json')
        .then(response => response.json())
        .then((response) => this.rotationPresets = response)
    ]);

    this.dispatchEvent(new CustomEvent('gamedataloaded'));
  }

  getActionById(id: number) {
    return this.actionsById[ id ];
  }

  getActionsByClassJobId(classJobId: number) {
    return this.actionsByClassJob[ classJobId ];
  }

  getClassJobs() {
    return this.classJobs;
  }

  getRotationPresets() {
    return this.rotationPresets;
  }

  private registerActions(actions: { [ classJobId: string ]: Action[] }): void {
    this.actionsByClassJob = actions;

    Object.values(actions).flat().forEach((action) => {
      this.actionsById[ action.ID ] = action;
    });
  }
}
