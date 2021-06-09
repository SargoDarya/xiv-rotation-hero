import { CommunicationLayer } from "./app/services/communication-layer.js";
import { OverlayPluginLayer } from "./app/services/overlay-plugin-layer.js";
import { RotationHero } from "./app/rotation-hero.js";
import { WebsocketLayer } from "./app/services/websocket-layer.js";
import { ActionService } from "./app/services/action.service.js";
import { Action } from "./app/interfaces.js";
import { GameDataService } from "./app/services/game-data.service.js";

export class ACTRotationTrainer {
  private communicationLayer: CommunicationLayer | null;
  private gameDataService = new GameDataService();

  constructor() {
    this.gameDataService.addEventListener('gamedataloaded', this.init.bind(this));
    this.gameDataService.load();
  }

  private init() {
    // Check if there's any communication or if we need to run a local instance
    const wsUrl = WebsocketLayer.WEBSOCKET_REGEX.exec(location.search);
    if (wsUrl) {
      this.communicationLayer = new WebsocketLayer(wsUrl[ 1 ]);
    } else if (window.OverlayPluginApi !== undefined) {
      this.communicationLayer = new OverlayPluginLayer();
    }

    // If there is no comms layer it means we're running a normal
    // browser instance.
    if (!this.communicationLayer) {
      // Load more stuff which is necessary to display
      // everything. This is done so the ACT overlay isn't
      // loading unnecessary scripts
      import('./app/manual-ui.js').then(({ ManualUI }) => {
        const manualUI = new ManualUI(this.gameDataService);
        manualUI.startTicking();
      });
    } else {
      // Handle action recording in here
      const rotationHero = new RotationHero(this.gameDataService);
      document.body.appendChild(rotationHero.viewContainer);
    }
  }
}

(() => {
  // window.OverlayPluginApi = <any>{};
  new ACTRotationTrainer();
})()
