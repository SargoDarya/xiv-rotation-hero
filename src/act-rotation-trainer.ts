import { CommunicationLayer } from "./communication-layer.js";
import { ManualUI } from "./manual-ui.js";
import { OverlayPluginLayer } from "./overlay-plugin-layer.js";
import { WebsocketLayer } from "./websocket-layer.js";

export class ACTRotationTrainer {
  private communicationLayer: CommunicationLayer | null;
  private manualUI?: ManualUI;

  constructor() {
    // Check if there's any communication or if we need to run a local instance
    const wsUrl = WebsocketLayer.WEBSOCKET_REGEX.exec(location.search);

    if (wsUrl) {
      this.communicationLayer = new WebsocketLayer(wsUrl[ 1 ]);
    } else if (window.OverlayPluginApi !== undefined) {
      this.communicationLayer = new OverlayPluginLayer();
    }

    if (!this.communicationLayer) {
      // This is a browser instance
      this.manualUI = new ManualUI();
      this.manualUI.startTicking();
    } else {
      // Handle action recording in here
    }
  }

  /**
   * Records a given action id and puts it into the history
   */
  recordActionId(id: number) {

  }

  reset() {}
}

(() => {
  const trainer = new ACTRotationTrainer();
})()
