import { GameDataService } from "../services/game-data.service.js";
import { createView } from "../utils.js";
import { WidgetBase } from '../widgets/widget-base.js';
import { ContainerWidget } from '../widgets/container-widget.js';
import { TextWidget } from '../widgets/text-widget.js';
import { Rotation } from "./interfaces.js";
import { RotationBrowserView } from "./rotation-browser-view.js";
import { RotationPhasesView } from "./rotation-phases-view.js";
import { ToggleWidget } from '../widgets/toggle-widget.js';
import { ActiveRotationSummaryView } from './active-rotation-summary-view.js';


export class RotationHero extends WidgetBase {
  private _rotation: Rotation | null;
  private set rotation(rotation: Rotation | null) {
    this._rotation = rotation;
    this.updateView();
  }
  private get rotation() { return this._rotation; }

  private rotationPresets: Rotation[] = [];
  private rotationPhasesView: RotationPhasesView;
  private presetContainer = <HTMLSelectElement>createView('select', 'rotation-hero__preset-select');
  private activeRotationSummaryView: ActiveRotationSummaryView = new ActiveRotationSummaryView();
  private rotationBrowserView: RotationBrowserView;
  private currentClassJobId: number;

  private readonly gameDataService: GameDataService;

  public _iteration = 0;
  public set iteration(iteration: number) {
    this._iteration = iteration;
  }
  public get iteration(): number {
    return this._iteration;
  }

  constructor(
    private readonly services: { gameDataService: GameDataService },
    isEmbedded: boolean = true
  ) {
    super('rotation-hero');

    this.gameDataService = services.gameDataService;

    this.rotationBrowserView = new RotationBrowserView(this.services.gameDataService);
    this.rotationPhasesView = new RotationPhasesView(this.services.gameDataService);

    const contentContainer = new ContainerWidget('rotation-hero__content');
    const titleBar = new ContainerWidget('rotation-hero__title-bar', {}, [
      new TextWidget('Rotation Hero', 'rotation-hero__title'),
      new ToggleWidget(contentContainer)
    ]);
    titleBar.classList.add('drag-handle');

    this.append(titleBar, contentContainer);

    contentContainer.append(
      this.rotationBrowserView,
      this.activeRotationSummaryView,
      this.rotationPhasesView
    );

    this.rotationBrowserView.addEventListener('app-rotationselected', (evt: CustomEvent<Rotation>) => {
      console.log('selecting rotation', evt.detail);
      this.selectRotation(evt.detail);
    });

    this.activeRotationSummaryView.addEventListener('app-clearrotation', () => {
      this.selectRotation(null);
    })

    if (!isEmbedded) {
      this.viewContainer.style.maxWidth = '400px';
      this.viewContainer.style.overflow = 'hidden';
    }

    this.updateView();
  }

  public setCurrentClassJobId(classJobId: number) {
    this.currentClassJobId = classJobId;
    this.selectRotation(this.rotationPresets[0]);
  }

  public setPresets(presets: Rotation[]) {
    this.rotationPresets = presets;
  }

  public selectRotation(rotation: Rotation | null) {
    this.activeRotationSummaryView.rotation = rotation;
    this.rotationPhasesView.rotation = rotation;
    this.rotation = rotation;

    if (rotation && rotation.classJobId !== this.currentClassJobId) {
      this.dispatchEvent(new CustomEvent('app-changeclassjob', { detail: rotation.classJobId }));
    }
  }

  public recordAction(actionId: number) {
    this.rotationPhasesView.handleAction(actionId);
  }

  private updateView() {
    const hasRotation = Boolean(this.rotation);
    this.rotationPhasesView.isVisible = hasRotation;
    this.activeRotationSummaryView.isVisible = hasRotation;
    this.rotationBrowserView.isVisible = !hasRotation;
  }
}


