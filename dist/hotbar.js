import { HotbarSlot } from "./hotbar-slot.js";
import { createView } from "./utils.js";
export var HotbarStyle;
(function (HotbarStyle) {
    HotbarStyle[HotbarStyle["Horizontal"] = 0] = "Horizontal";
    HotbarStyle[HotbarStyle["SplitHorizontal"] = 1] = "SplitHorizontal";
    HotbarStyle[HotbarStyle["DoubleSplitHorizontal"] = 2] = "DoubleSplitHorizontal";
    HotbarStyle[HotbarStyle["DoubleSplitVertical"] = 3] = "DoubleSplitVertical";
    HotbarStyle[HotbarStyle["SplitVertical"] = 4] = "SplitVertical";
    HotbarStyle[HotbarStyle["Vertical"] = 5] = "Vertical";
})(HotbarStyle || (HotbarStyle = {}));
export class Hotbar {
    constructor(id, hotbarManager, actionManager, options) {
        this.id = id;
        this.hotbarManager = hotbarManager;
        this.actionManager = actionManager;
        this.options = options;
        this.viewContainer = createView('div', 'hotbar');
        this.hotbarNumberContainer = createView('div', 'hotbar__number');
        this.slotContainer = createView('div', 'hotbar__slots');
        this.hotbarSlots = [];
        this.onMouseDragStop = this.onMouseDragStop.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.hotbarNumberContainer.innerText = (this.id + 1).toString();
        this.hotbarNumberContainer.addEventListener('mousedown', this.onMouseDragStart.bind(this));
        this.viewContainer.appendChild(this.hotbarNumberContainer);
        this.viewContainer.appendChild(this.slotContainer);
        this.position = this.options.position;
        this.visible = this.options.visible;
        this.hotbarStyle = this.options.hotbarStyle;
        this.scale = this.options.scale;
        document.body.appendChild(this.viewContainer);
        for (let slotId = 0; slotId < 12; slotId++) {
            const hotbarSlot = new HotbarSlot(this, this.id, slotId);
            this.hotbarSlots.push(hotbarSlot);
            this.slotContainer.appendChild(hotbarSlot.view);
        }
    }
    get position() {
        return this.options.position;
    }
    set position(position) {
        this.viewContainer.style.left = position[0] * 100 + '%';
        this.viewContainer.style.top = position[1] * 100 + '%';
        this.options.position = position;
    }
    get visible() {
        return this.options.visible;
    }
    set visible(visible) {
        if (visible) {
            this.viewContainer.classList.add('hotbar--visible');
        }
        else {
            this.viewContainer.classList.remove('hotbar--visible');
        }
        this.options.visible = visible;
    }
    get hotbarStyle() {
        return this.options.hotbarStyle;
    }
    set hotbarStyle(style) {
        this.viewContainer.classList.remove(this.getHotbarStyleClass(this.hotbarStyle));
        this.viewContainer.classList.add(this.getHotbarStyleClass(style));
    }
    get scale() {
        return this.options.scale;
    }
    set scale(scale) {
        this.viewContainer.style.transform = `scale(${scale})`;
        this.options.scale = scale;
        console.log(scale);
    }
    trigger(slotId) {
        if (!this.options.visible) {
            return;
        }
        this.hotbarSlots[slotId].trigger();
    }
    setSlotAction(slotId, action) {
        this.hotbarSlots[slotId].action = action;
    }
    getSlotAction(slotId) {
        return this.hotbarSlots[slotId].action;
    }
    getHotbarStyleClass(hotbarStyle) {
        switch (hotbarStyle) {
            default:
            case HotbarStyle.Horizontal:
                return 'hotbar--12x1';
            case HotbarStyle.SplitHorizontal:
                return 'hotbar--6x2';
            case HotbarStyle.DoubleSplitHorizontal:
                return 'hotbar--4x3';
            case HotbarStyle.DoubleSplitVertical:
                return 'hotbar--3x4';
            case HotbarStyle.SplitVertical:
                return 'hotbar--2x6';
            case HotbarStyle.Vertical:
                return 'hotbar--1x12';
        }
    }
    onMouseDragStart(evt) {
        if (evt.button !== 0) {
            return;
        }
        evt.preventDefault();
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseDragStop);
        this.lastMousePosition = [evt.clientX, evt.clientY];
    }
    onMouseMove(evt) {
        evt.preventDefault();
        const width = evt.view ? evt.view.innerWidth : 0;
        const height = evt.view ? evt.view.innerHeight : 0;
        const [currentX, currentY] = this.position;
        const [realX, realY] = [currentX * width, currentY * height];
        const [oldX, oldY] = this.lastMousePosition;
        const { clientX, clientY } = evt;
        const [diffX, diffY] = [oldX - clientX, oldY - clientY];
        this.lastMousePosition = [clientX, clientY];
        this.position = [(realX - diffX) / width, (realY - diffY) / height];
    }
    onMouseDragStop(evt) {
        document.removeEventListener('mouseup', this.onMouseDragStop);
        document.removeEventListener('mousemove', this.onMouseMove);
        this.hotbarManager.persistSettings();
    }
}
