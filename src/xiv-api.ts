interface PaginatedResults<T> {
  Results: T[],
  Pagination: {
    Page: number,
    PageNext?: string,
    PagePrev?: string,
    PageTotal: number,
    Results: number,
    ResultsPerPage: number,
    ResultsTotal: number
  }
}

export interface JobShort {
  Abbreviation: string;
  BattleClassIndex: number | string;
  ID: number;
  Icon: string;
  Name: string;
  Name_en: string;
  Name_de: string;
  Name_fr: string;
  Name_ja: string;
  Url: string;
}

export interface Job extends JobShort {
  Abbreviation: string,
  ClassJobParentTargetID: number,
  ClassJobParent: {
    ClassJobCategory: number
  },
}

export interface Action {
  ID: number,
  Name: string,
  Description: string,
  ClassJobLevel: number,
  CooldownGroup: number,
  ActionCombo: any,
  IconHD: string,
  Cast100ms: number,
  Recast100ms: number
}

export class XIVApi {
  private static readonly BASE_URL = 'https://xivapi.com';

  public static action() {}

  public static search() {
    const url = `${this.BASE_URL}/search`;
  }

  public static jobs(): Promise<PaginatedResults<JobShort>> {
    const columns = [
      'ID',
      'Abbreviation',
      'BattleClassIndex',
      'Url',
      'Icon',
      'Name_en',
      'Name_ja',
      'Name_fr',
      'Name_de',
    ];

    return this.fetchAPI(`/ClassJob?columns=${columns.join()}`);
  }

  public static job(id: number) {
    return this.fetchAPI(`/ClassJob/${id}`);
  }

  public static actionsForJob(job: Job): Promise<PaginatedResults<Action>> {
    const filters = [
      `ClassJobTargetID|=${job.ID};${job.ClassJobParentTargetID}`,
      `ClassJobCategory.${job.Abbreviation}=1`,
      `IsPvP=0`
    ].join(',');

    const columns = [
      'ID',
      'Name',
      'Description',
      'ClassJobLevel',
      'CooldownGroup',
      'ActionCombo',
      'IconHD',
      'Cast100ms',
      'Recast100ms'
    ].join(',')

    return this.fetchAPI(`/search?indexes=action&filters=${filters}&columns=${columns}`);
  }

  public static fetchAPI(request: string): Promise<any> {
    return fetch(`${this.BASE_URL}${request}`).then((response) => response.json());
  }
}
