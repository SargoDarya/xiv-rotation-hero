import {
  Action,
  ActionIndirection,
  Job
} from "../interfaces";

export class GameDataService extends EventTarget {
  private actionsById: { [ actionId: number ]: Action } = {};
  private actionsByClassJob: { [ classJobId: string ]: Action[] } = {};
  private actionIndirectionsById: { [ actionId: number ]: ActionIndirection } = {};
  private classJobs: Job[] = [];
  private classJobsById: Map<number, Job> = new Map();

  async load() {
    // Load game data
    await Promise.all([
      fetch('./assets/classjobactions.json')
        .then(response => response.json())
        .then(this.registerActions.bind(this)),
      fetch('./assets/actionindirections.json')
        .then(response => response.json())
        .then(this.registerActionIndirections.bind(this)),
      fetch('./assets/classjobs.json')
        .then(response => response.json())
        .then((response: Job[]) => {
          this.classJobs = response;
          response.forEach((job) => {
            this.classJobsById.set(job.ID, job);
          })
        }),
    ]);

    this.dispatchEvent(new CustomEvent('gamedataloaded'));
  }

  getActionById(id: number) {
    return this.actionsById[ id ];
  }

  getActionsByClassJobId(classJobId: number) {
    return this.actionsByClassJob[ classJobId ];
  }

  getActionIndirectionById(id: number) {
    return this.actionIndirectionsById[ id ];
  }

  getActionIndirectionsByClassJobId(classJobId: number) {
    const classJob = this.classJobsById.get(classJobId);
    if (!classJob || !classJob.GameContentLinks.ActionIndirection) return [];

    return classJob.GameContentLinks.ActionIndirection.ClassJob.map((actionIndirection) => this.actionIndirectionsById[ actionIndirection ]);
  }

  getClassJobs() {
    return this.classJobs;
  }

  getClassJob(classJobID: number): Job | undefined {
    return this.classJobsById.get(classJobID);
  }

  getClassJobIcon(classJobID: number) {
    const classJob = this.getClassJob(classJobID);

    return classJob ? classJob.Icon : classJob
  }

  getClassJobAbbreviation(classJobID: number) {
    const classJob = this.getClassJob(classJobID);

    return classJob ? classJob.Abbreviation : classJob;
  }

  private registerActions(actions: { [ classJobId: string ]: Action[] }): void {
    this.actionsByClassJob = actions;

    Object.values(actions).flat().forEach((action) => {
      this.actionsById[ action.ID ] = action;
    });
  }

  private registerActionIndirections(actionIndirections: ActionIndirection[]): void {
    Object.values(actionIndirections).forEach((action) => {
      this.actionIndirectionsById[ action.ID ] = action;
    });
  }
}
