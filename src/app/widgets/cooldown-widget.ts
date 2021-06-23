import { WidgetBase } from './widget-base.js';

export class CooldownWidget extends WidgetBase {
  private readonly XMLNS = "http://www.w3.org/2000/svg";

  private readonly circle;
  private readonly shadow: ShadowRoot;

  constructor() {
    super('cooldown-widget', 'div');

    this.shadow = this.viewContainer.attachShadow({ mode: 'closed' });

    const svg = document.createElementNS(this.XMLNS, 'svg');
    svg.setAttribute('width', '64');
    svg.setAttribute('height', '64');
    svg.setAttribute('viewBox', '0 0 64 64');

    const maskNode = this.createNode('mask', { id: 'mask' } );
    const maskGroupNode = this.createNode('g', { transform: 'translate(32, 32)' });
    const maskRectNode = this.createNode('rect', { class: 'cooldown-widget__mask-rect', x: '-32', y: '-32', width: '64', height: '64', rx: '6', ry: '6' });
    const maskCircleNode = this.createNode('circle', { class: 'cooldown-widget__mask-circle', cx: '0', cy: '0', r: '14' });
    const rectNode = this.createNode('rect', { x: '0', y: '0', width: '64', height: '64', rx: '6', ry: '6', fill: 'black', mask: 'url(#mask)' });

    maskNode.appendChild(maskGroupNode);
    maskGroupNode.appendChild(maskRectNode);
    maskGroupNode.appendChild(maskCircleNode);
    svg.appendChild(maskNode);
    svg.appendChild(rectNode);

    this.shadow.appendChild(this.getStyles());
    this.shadow.appendChild(svg);
    this.circle = maskCircleNode;
    this.hide();
  }

  setCooldown(transitionDuration: number) {
    this.show();
    this.circle.style.setProperty('--transitionDuration', `${transitionDuration}ms`);
    this.circle.style.setProperty('--initialStroke', '88');

    setTimeout(() => this.circle.style.strokeDashoffset = '0');

    setTimeout(this.reset.bind(this), transitionDuration);
  }

  private createNode(nodeType: string, properties: { [k: string]: string } = {}) {
    const node = document.createElementNS(this.XMLNS, nodeType);

    Object.entries(properties).forEach(([ property, value ]) => {
      node.setAttributeNS(null, property, value);
    });

    return node;
  }

  public reset() {
    this.hide();
    this.circle.style.setProperty('--transitionDuration', `0`);
    this.circle.style.setProperty('--initialStroke', '88');
    this.circle.style.strokeDashoffset = '88';
  }

  private getStyles() {
    const style = document.createElement('style');
    style.textContent = `
    .cooldown-widget__mask-rect {
      fill: #BBB;
    }

    .cooldown-widget__mask-circle {
      --initialStroke: 88;
      --transitionDuration: 0;
      fill: none;
      stroke: #333333;
      stroke-width: 28;
      stroke-dasharray: var(--initialStroke);
      stroke-dashoffset: var(--initialStroke); 
      transition: stroke-dashoffset var(--transitionDuration) linear;
      transform: rotate(-90deg);
    }`;
    return style;
  }
}
