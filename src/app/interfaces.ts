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
