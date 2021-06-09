import { DialogBase } from "./dialog-base.js";
import { RotationHero } from "../rotation-hero.js";
import { GameDataService } from "../services/game-data.service.js";
import { ActionService } from "../services/action.service.js";
import { Action } from "../interfaces.js";

export class RotationHeroDialog extends DialogBase {


  constructor(
    private readonly gameDataService: GameDataService,
    private readonly actionService: ActionService
  ) {
    super({
      closable: false,
      resizable: false
    });

    const rotationHero = new RotationHero(this.gameDataService, false);
    this.isVisible = true;

    this.contentContainer.appendChild(rotationHero.viewContainer);

    this.actionService.addEventListener('trigger', (evt: CustomEvent<Action>) => {
      rotationHero.recordAction(evt.detail.ID);
    });

    this.afterViewCreated();
  }
}