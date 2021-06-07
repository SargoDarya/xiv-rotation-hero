export class Action extends HTMLElement {
    constructor() {
        super();
        var shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(document.createElement('p'));
    }
}
customElements.define('xiv-action', Action);
