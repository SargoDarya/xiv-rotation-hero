import { ActionService } from "./services/action.service";
import { AppStateService } from "./services/app-state.service";
import { GameDataService } from "./services/game-data.service";
import { GamepadService } from "./services/gamepad.service";
import { HotbarService } from "./services/hotbar.service";
import { KeyBindingService } from "./services/key-binding.service";
import { PhaseEnum } from './rotation-hero/enums';
import { TooltipService } from './services/tooltip.service';

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
  GameContentLinks: {
    Actions: number[],
    ActionIndirection: {
      ClassJob: number[]
    } | null
  }
}

export interface Action {
  ID: number,
  Name: string,
  Description: string,
  BehaviourType: number,
  ClassJobLevel: number,
  CooldownGroup: number,
  ActionComboTargetID: any,
  IconHD: string,
  Cast100ms: number,
  Recast100ms: number,
  PreservesCombo: number,
  PrimaryCostType: number,
  PrimaryCostValue: number,
  ActionCategory: {
    ID: number,
    Name: string
  },
  CastType: number,
  EffectRange: number,
  Range: number,
  TargetArea: number
}

export interface ActionIndirection {
  ID: number,
  Name: Action
}

export interface Services {
  actionService: ActionService;
  appStateService: AppStateService;
  gameDataService: GameDataService;
  gamepadService: GamepadService;
  hotbarService: HotbarService;
  keyBindingService: KeyBindingService;
  tooltipService: TooltipService;
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
