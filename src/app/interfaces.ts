import { ActionService } from "./services/action.service";
import { AppStateService } from "./services/app-state.service";
import { GameDataService } from "./services/game-data.service";
import { GamepadService } from "./services/gamepad.service";
import { HotbarService } from "./services/hotbar.service";
import { KeyBindingService } from "./services/key-binding.service";
import { PhaseEnum } from './rotation-hero/enums';

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
  ActionComboTargetID: any,
  IconHD: string,
  Cast100ms: number,
  Recast100ms: number,
  PreservesCombo: number,
  PrimaryCostType: number,
  PrimaryCostValue: number
}

export interface Services {
  actionService: ActionService;
  appStateService: AppStateService;
  gameDataService: GameDataService;
  gamepadService: GamepadService;
  hotbarService: HotbarService;
  keyBindingService: KeyBindingService;
}

export interface RotationCreation {
  title: string,
  description: string,
  phases: {
    phase: PhaseEnum,
    actions: number[]
  }[]
}

// private readonly keyBindingService = new KeyBindingService();
// private readonly actionService = new ActionService();
// private readonly gamepadService = new GamepadService();
// private readonly hotbarService;
