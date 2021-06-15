import { DialogBase } from "./dialog-base.js";
import { RotationHero } from "../rotation-hero/rotation-hero.js";
import { Action, Services } from "../interfaces.js";
import { AppStateEvent } from "../services/app-state.service.js";

export class RotationHeroDialog extends DialogBase {
  public uiTitle = 'Rotation Hero';

  private rotationHero: RotationHero;

  constructor(
    services: Services
  ) {
    super(
      services,
      {
        closable: false,
        resizable: false
      }
    );

    this.rotationHero = new RotationHero(this.services, false);
    this.isVisible = true;

    this.contentContainer.appendChild(this.rotationHero.viewContainer);

    this.rotationHero.addEventListener('app-changeclassjob', (evt: CustomEvent<number>) => {
      this.services.appStateService.selectedClassJobID = evt.detail;
    });

    this.services.actionService.addEventListener('trigger', (evt: CustomEvent<Action>) => {
      this.rotationHero.recordAction(evt.detail.ID);
    });

    this.services.appStateService.addEventListener(AppStateEvent.ClassJobChanged, (evt: CustomEvent<number>) => {
      this.rotationHero.setCurrentClassJobId(evt.detail);
    });

    if (this.services.appStateService.selectedClassJobID !== -1) {
      this.rotationHero.setCurrentClassJobId(this.services.appStateService.selectedClassJobID);
    }

    this.afterViewCreated();
  }
}
