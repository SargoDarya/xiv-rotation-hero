import { Dialog } from "./dialog.js";
import { HotbarStyle } from "./hotbar.js";
import { createInput, createRadio, createSelect, createView } from "./utils.js";
export class HotbarLayoutDialog extends Dialog {
    constructor(hotbarManager) {
        super();
        this.hotbarManager = hotbarManager;
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
            const visibilityCheckbox = createInput('checkbox', `hotbar__visibility--${i}`);
            visibilityCheckbox.checked = hotbar.visible;
            visibilityCheckbox.addEventListener('change', (ev) => {
                hotbar.visible = visibilityCheckbox.checked;
            });
            const hotbarName = createView('span', `hotbar__name--${i}`);
            hotbarName.innerText = 'Hotbar ' + (i + 1);
            const radio1 = createRadio(`hotbar-style-${i}`, '12x1', `hotbar__radio`);
            radio1.checked = hotbar.hotbarStyle === HotbarStyle.Horizontal;
            const radio2 = createRadio(`hotbar-style-${i}`, '6x2', `hotbar__radio`);
            radio2.checked = hotbar.hotbarStyle === HotbarStyle.SplitHorizontal;
            const radio3 = createRadio(`hotbar-style-${i}`, '4x3', `hotbar__radio`);
            radio3.checked = hotbar.hotbarStyle === HotbarStyle.DoubleSplitHorizontal;
            const radio4 = createRadio(`hotbar-style-${i}`, '3x4', `hotbar__radio`);
            radio4.checked = hotbar.hotbarStyle === HotbarStyle.DoubleSplitVertical;
            const radio5 = createRadio(`hotbar-style-${i}`, '2x6', `hotbar__radio`);
            radio5.checked = hotbar.hotbarStyle === HotbarStyle.SplitVertical;
            const radio6 = createRadio(`hotbar-style-${i}`, '1x12', `hotbar__radio`);
            radio6.checked = hotbar.hotbarStyle === HotbarStyle.Vertical;
            const sizeSelect = createSelect([
                ['200%', '2'],
                ['150%', '1.5'],
                ['120%', '1.2'],
                ['100%', '1'],
                ['80%', '.8'],
                ['60%', '.6']
            ]);
            sizeSelect.addEventListener('change', (evt) => {
                if (evt.target && evt.target.value) {
                    hotbar.scale = Number(evt.target.value);
                }
            });
            hotbarSettings.appendChild(this.createRow([
                visibilityCheckbox,
                hotbarName,
                radio1,
                radio2,
                radio3,
                radio4,
                radio5,
                radio6,
                sizeSelect
            ]));
        });
        this.contentContainer.appendChild(hotbarSettings);
    }
    createHeaderRow(headers) {
        const row = document.createElement('tr');
        headers.forEach((header) => {
            const cell = document.createElement('th');
            cell.innerText = header;
            row.appendChild(cell);
        });
        return row;
    }
    createRow(elements) {
        const row = document.createElement('tr');
        elements.forEach((element) => {
            const cell = document.createElement('td');
            row.appendChild(cell);
            cell.appendChild(element);
        });
        return row;
    }
}
