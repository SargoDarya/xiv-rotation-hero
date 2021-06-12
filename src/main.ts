import { CommunicationLayer } from "./app/services/communication-layer.js";
import { OverlayPluginLayer } from "./app/services/overlay-plugin-layer.js";
import { RotationHero } from "./app/rotation-hero.js";
import { WebsocketLayer } from "./app/services/websocket-layer.js";
import { GameDataService } from "./app/services/game-data.service.js";

/**
 * This is the main class which is bootstrapping the application.
 *
 * As this acts as a hybrid application for ACT and browser usage this
 * houses the logic to either connect to ACT and show the minimal view or
 * to create the complete ManualUI to work in the browser with a simulation.
 */
export class ACTRotationTrainer {
  private communicationLayer: CommunicationLayer | null;
  private gameDataService = new GameDataService();

  constructor() {
    // Load all necessary data first before initialising anything.
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
      // loading unnecessary scripts.
      import('./app/manual-ui.js').then(({ ManualUI }) => {
        const manualUI = new ManualUI(this.gameDataService);
        manualUI.startTicking();
      });
    } else {
      // Handle action recording in here
      const rotationHero = new RotationHero({ gameDataService: this.gameDataService });
      document.body.appendChild(rotationHero.viewContainer);

      this.communicationLayer.addOverlayListener('LogLine', (evt) => {
        console.log(evt);
      });
    }
  }
}

(() => {
  // window.OverlayPluginApi = <any>{};
  new ACTRotationTrainer();
})()
