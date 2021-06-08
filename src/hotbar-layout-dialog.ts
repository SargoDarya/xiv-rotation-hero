import { Dialog } from "./dialog.js";
import { HotbarManager } from "./hotbar-manager.js";
import { HotbarStyle } from "./hotbar.js";
import { createCheckbox, createInput, createRadio, createSelect, createView, wrapForStyle } from "./utils.js";

export class HotbarLayoutDialog extends Dialog {
  constructor(
    private readonly hotbarManager: HotbarManager
  ) {
    super();

    this.setTitle('Hotbar Layout');

    const hotbarSettings = document.createElement('table');

    hotbarSettings.appendChild(this.createHeaderRow([
      'V',
      'Name',
      '12x1',
      '6x2',
      '4x3',
      '3x4',
      '2x6',
      '1x12',
      'Size'
    ]));

    this.hotbarManager.hotbars.forEach((hotbar, i) => {
      const visibilityCheckbox = createCheckbox('checkbox', `hotbar__visibility--${i}`);
      visibilityCheckbox.checked = hotbar.visible;
      visibilityCheckbox.addEventListener('change', (ev) => {
        hotbar.visible = visibilityCheckbox.checked;
        this.hotbarManager.persistSettings();
      });
      const hotbarName = createView('span', `hotbar__name--${i}`);
      hotbarName.innerText = 'Hotbar ' + (i + 1);
      const radio1 = createRadio(`hotbar-style-${i}`, HotbarStyle.Horizontal, `hotbar__radio`);
      radio1.checked = hotbar.hotbarStyle === HotbarStyle.Horizontal;
      const radio2 = createRadio(`hotbar-style-${i}`, HotbarStyle.SplitHorizontal, `hotbar__radio`);
      radio2.checked = hotbar.hotbarStyle === HotbarStyle.SplitHorizontal;
      const radio3 = createRadio(`hotbar-style-${i}`, HotbarStyle.DoubleSplitHorizontal, `hotbar__radio`);
      radio3.checked = hotbar.hotbarStyle === HotbarStyle.DoubleSplitHorizontal;
      const radio4 = createRadio(`hotbar-style-${i}`, HotbarStyle.DoubleSplitVertical, `hotbar__radio`);
      radio4.checked = hotbar.hotbarStyle === HotbarStyle.DoubleSplitVertical;
      const radio5 = createRadio(`hotbar-style-${i}`, HotbarStyle.SplitVertical, `hotbar__radio`);
      radio5.checked = hotbar.hotbarStyle === HotbarStyle.SplitVertical;
      const radio6 = createRadio(`hotbar-style-${i}`, HotbarStyle.Vertical, `hotbar__radio`);
      radio6.checked = hotbar.hotbarStyle === HotbarStyle.Vertical;

      const sizeSelect = createSelect([
        ['200%', '2'],
        ['150%', '1.5'],
        ['120%', '1.2'],
        ['100%', '1'],
        ['80%', '0.8'],
        ['60%', '0.6']
      ], hotbar.scale.toString());
      sizeSelect.addEventListener('change', (evt) => {
        if (evt.target && (<HTMLSelectElement>evt.target).value) {
          hotbar.scale = Number((<HTMLSelectElement>evt.target).value);
          this.hotbarManager.persistSettings();
        }
      });

      hotbarSettings.appendChild(this.createRow([
        wrapForStyle(visibilityCheckbox),
        hotbarName,
        wrapForStyle(radio1),
        wrapForStyle(radio2),
        wrapForStyle(radio3),
        wrapForStyle(radio4),
        wrapForStyle(radio5),
        wrapForStyle(radio6),
        sizeSelect
      ]));

      [ radio1, radio2, radio3, radio4, radio5, radio6 ].forEach((radio) => {
        radio.addEventListener('change', (evt: Event) => {
          if (evt.target) {
            hotbar.hotbarStyle = <HotbarStyle>(<HTMLInputElement>evt.target).value;
          }
        });
      });
    });

    this.contentContainer.appendChild(hotbarSettings);
  }

  private createHeaderRow(headers: string[]) {
    const row = document.createElement('tr');
    headers.forEach((header) => {
      const cell = document.createElement('th');
      cell.innerText = header;
      row.appendChild(cell);
    });
    return row;
  }

  private createRow(elements: HTMLElement[]) {
    const row = document.createElement('tr');
    elements.forEach((element) => {
      const cell = document.createElement('td');
      row.appendChild(cell);
      cell.appendChild(element);
    });
    return row;
  }
}
