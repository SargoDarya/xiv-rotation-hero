import { CommunicationLayer, LogLineEvent } from "./app/services/communication-layer.js";
import { OverlayPluginLayer } from "./app/services/overlay-plugin-layer.js";
import { RotationHero } from "./app/rotation-hero/rotation-hero.js";
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
      import('./app/manual-ui/manual-ui.js').then(({ ManualUI }) => {
        const manualUI = new ManualUI(this.gameDataService);
        document.body.appendChild(manualUI.viewContainer);
        manualUI.startTicking();
      });
    } else {
      // Handle action recording in here
      const rotationHero = new RotationHero({ gameDataService: this.gameDataService });
      document.body.appendChild(rotationHero.viewContainer);

      this.communicationLayer.addOverlayListener('LogLine', (evt: LogLineEvent) => {
        const ignoreEvents = ['00', '16', '39', '31', '26'];
        if (ignoreEvents.indexOf(evt.line[0]) !== -1) { return; }

        if (evt.line[0] !== '21') {
          console.log(evt.line);
        }

        switch(evt.line[0]) {
          case '12':
            console.log(`Role changed to ${evt.line[2]}`);
            rotationHero.setCurrentClassJobId(Number(evt.line[2]));
            break;

          case '20':
            // Casting

          case '21':
            // Disregard auto-attacks
            if (evt.line[4] === '07') return;

            rotationHero.recordAction(parseInt(evt.line[4], 16));
            break;

          case '14':
            // status effect removed

          case '26':
            // status effect added
        }
      });
      this.communicationLayer.startOverlayEvents();
    }
  }
}

(() => {
  // window.OverlayPluginApi = <any>{};
  new ACTRotationTrainer();
})()
