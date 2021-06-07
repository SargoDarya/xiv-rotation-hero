import { ManualUI } from "./manual-ui.js";
import { OverlayPluginLayer } from "./overlay-plugin-layer.js";
import { WebsocketLayer } from "./websocket-layer.js";
export class ACTRotationTrainer {
    constructor() {
        const wsUrl = WebsocketLayer.WEBSOCKET_REGEX.exec(location.search);
        if (wsUrl) {
            this.communicationLayer = new WebsocketLayer(wsUrl[1]);
        }
        else if (window.OverlayPluginApi !== undefined) {
            this.communicationLayer = new OverlayPluginLayer();
        }
        if (!this.communicationLayer) {
            this.manualUI = new ManualUI();
            this.manualUI.startTicking();
        }
        else {
        }
    }
    recordActionId(id) {
    }
    reset() { }
}
(() => {
    const trainer = new ACTRotationTrainer();
})();
