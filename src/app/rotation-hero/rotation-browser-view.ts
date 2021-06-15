import { WidgetBase } from '../widgets/widget-base.js';
import {
  RotationBrowserCategoryType,
  RotationBrowserSubCategoryType
} from './enums.js';
import { ButtonWidget } from '../widgets/button-widget.js';
import { ContainerWidget } from '../widgets/container-widget.js';
import { Rotation } from './interfaces.js';
import { API } from '../api.js';
import { TextWidget } from '../widgets/text-widget.js';
import { GameDataService } from '../services/game-data.service.js';
import { ImageWidget } from '../widgets/image-widget.js';
import { Job } from '../interfaces.js';

/**
 *
 */
export class RotationBrowserView extends WidgetBase {
  private activeBrowserCategory: RotationBrowserCategoryType;
  private activeBrowserSubCategory?: RotationBrowserSubCategoryType;

  private readonly mainTabBar: ContainerWidget;
  private readonly secondaryTabBar: ContainerWidget;
  private readonly rotationListView: ContainerWidget;

  private visibleRotationViews: ContainerWidget[] = [];

  private mainTabBarWidgets: ButtonWidget[];
  private secondaryTabBarWidgets: ButtonWidget[];

  constructor(private readonly gameDataService: GameDataService) {
    super('rotation-browser');

    this.mainTabBarWidgets = [
      new ButtonWidget('Community', 'rotation-browser__button', { click: this.selectBrowserCategory.bind(this, RotationBrowserCategoryType.Community, RotationBrowserSubCategoryType.Favorites )}),
      new ButtonWidget('Favorites', 'rotation-browser__button', { click: this.selectBrowserCategory.bind(this, RotationBrowserCategoryType.Favourites, undefined )}),
      new ButtonWidget('Mine', 'rotation-browser__button', { click: this.selectBrowserCategory.bind(this, RotationBrowserCategoryType.Mine, undefined )})
    ];
    this.mainTabBar = new ContainerWidget('rotation-browser__tab-bar', {}, this.mainTabBarWidgets);
    this.mainTabBar.addModifier('primary');

    this.secondaryTabBarWidgets = [
      new ButtonWidget('Favorites', 'rotation-browser__button', { click: this.selectBrowserCategory.bind(this, RotationBrowserCategoryType.Community, RotationBrowserSubCategoryType.Favorites )}),
      new ButtonWidget('Recent', 'rotation-browser__button', { click: this.selectBrowserCategory.bind(this, RotationBrowserCategoryType.Community, RotationBrowserSubCategoryType.Recent )}),
    ];
    this.secondaryTabBar = new ContainerWidget('rotation-browser__tab-bar', {}, this.secondaryTabBarWidgets);
    this.secondaryTabBar.addModifier('secondary');

    this.rotationListView = new ContainerWidget('rotation-browser__list');

    this.append(this.mainTabBar, this.secondaryTabBar, this.rotationListView);

    this.selectBrowserCategory(RotationBrowserCategoryType.Community, RotationBrowserSubCategoryType.Favorites);
  }

  private async selectBrowserCategory(category: RotationBrowserCategoryType, subCategory?: RotationBrowserSubCategoryType) {
    // Don't do unnecessary stuff when there's no update
    if (this.activeBrowserCategory === category && this.activeBrowserSubCategory === subCategory) {
      return;
    }
    this.activeBrowserCategory = category;
    this.activeBrowserSubCategory = subCategory;

    // TODO: Show loading symbol

    // Clear current list
    const replacedRotations = this.visibleRotationViews.splice(0, this.visibleRotationViews.length);
    replacedRotations.forEach((rotation) => this.rotationListView.remove(rotation));

    // Update UI
    this.mainTabBarWidgets.forEach((widget) => widget.removeModifier('selected'));
    this.mainTabBarWidgets[ category ].addModifier('selected');
    this.secondaryTabBar.isVisible = this.activeBrowserCategory === RotationBrowserCategoryType.Community;
    this.secondaryTabBarWidgets.forEach((widget) => widget.removeModifier('selected'));
    if (typeof subCategory !== 'undefined') {
      this.secondaryTabBarWidgets[ subCategory ].addModifier('selected');
    }

    // Fetch rotations
    let rotations: Rotation[] = [];
    switch (category) {
      case RotationBrowserCategoryType.Community:
        switch(subCategory) {
          case RotationBrowserSubCategoryType.Favorites: rotations = await API.getAllRotations(); break;
          case RotationBrowserSubCategoryType.Recent: rotations = await API.getAllRotations(); break;
        }
        break

      case RotationBrowserCategoryType.Favourites:
        rotations = await API.userFavourites();
        break;

      case RotationBrowserCategoryType.Mine:
        rotations = await API.userFavourites();
        break;
    }

    if (rotations && rotations.length) {
      this.fillRotationList(rotations);
    }

    // TODO: Hide loading symbol

  }

  private fillRotationList(rotations: Rotation[]) {
    const rotationViews = this.createRotationListItemView(rotations);
    const replacedRotations = this.visibleRotationViews.splice(0, 0, ...rotationViews);
    rotationViews.forEach((rotation) => this.rotationListView.append(rotation));
  }

  private async selectRotation(rotation: Rotation): Promise<void> {
    const fullRotation = await API.getRotation(rotation.id);
    this.dispatchEvent(new CustomEvent('app-rotationselected', { detail: fullRotation }));
  }

  private createRotationListItemView(rotations: Rotation[]): ContainerWidget[] {
    return rotations.map((rotation) => {
      const classJob = <Job>this.gameDataService.getClassJob(rotation.classJobId);

      return new ContainerWidget(
        'rotation-browser__list-item',
        { click: this.selectRotation.bind(this, rotation) },
        [
          new ImageWidget(`https://xivapi.com${classJob.Icon}`, 'rotation-browser__list-item-image'),
          new TextWidget(`${rotation.title}`, 'rotation-browser__list-item-title'),
          new TextWidget(`${classJob ? classJob.Abbreviation : rotation.classJobId} | 80 | Patch: ${rotation.patch}`, 'rotation-browser__list-item-subtitle'),
          new TextWidget(`${rotation.favouriteCount}`, 'rotation-browser__list-item-favourite'),
        ])
    });
  }
}
