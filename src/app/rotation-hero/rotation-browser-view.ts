import { WidgetBase } from '../widgets/widget-base.js';
import {
  RotationBrowserCategoryType,
  RotationBrowserSubCategoryType
} from './enums.js';
import { ButtonWidget } from '../widgets/button-widget.js';
import { ContainerWidget } from '../widgets/container-widget.js';
import { Rotation } from './interfaces.js';
import {
  API,
  PaginatedResponse
} from '../api.js';
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

  private readonly visibleRotationViews: ContainerWidget[] = [];

  private readonly mainTabBarWidgets: ButtonWidget[];
  private readonly secondaryTabBarWidgets: ButtonWidget[];

  private readonly loadingTextWidget: TextWidget;
  private readonly emptyViewTextWidget: TextWidget;

  private readonly userToken?: string;

  constructor(private readonly gameDataService: GameDataService) {
    super('rotation-browser');

    const userTokenMatch = window.location.search.match(/[\?&]token=([^&]+)/);
    if (userTokenMatch) {
      this.userToken = userTokenMatch[ 1 ];
    }

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

    this.emptyViewTextWidget = new TextWidget(`Looks like there's nothing here yet...`, 'rotation-browser__empty-view');
    this.emptyViewTextWidget.hide();
    this.loadingTextWidget = new TextWidget(Math.random() < 0.0001 ? `Rotating loadations` : 'Loading rotations', 'rotation-browser__loading-view');
    this.loadingTextWidget.hide();

    this.append(this.mainTabBar, this.secondaryTabBar, this.rotationListView, this.emptyViewTextWidget, this.loadingTextWidget);

    this.selectBrowserCategory(RotationBrowserCategoryType.Community, RotationBrowserSubCategoryType.Favorites);
  }

  private async selectBrowserCategory(category: RotationBrowserCategoryType, subCategory?: RotationBrowserSubCategoryType) {
    // Don't do unnecessary stuff when there's no update
    if (this.activeBrowserCategory === category && this.activeBrowserSubCategory === subCategory) {
      return;
    }
    this.activeBrowserCategory = category;
    this.activeBrowserSubCategory = subCategory;

    this.emptyViewTextWidget.hide();
    this.loadingTextWidget.show();

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
    let rotations: PaginatedResponse<Rotation>;
    switch (category) {
      case RotationBrowserCategoryType.Favourites: rotations = await this.getUserFavorites(); break;
      case RotationBrowserCategoryType.Mine: rotations = await this.getUserRotations(); break;

      case RotationBrowserCategoryType.Community:
      default:
        switch(subCategory) {
          case RotationBrowserSubCategoryType.Recent: rotations = await API.getAllRotations({ sortBy: 'createdAt' }); break;

          case RotationBrowserSubCategoryType.Favorites:
          default: rotations = await API.getAllRotations({ sortBy: 'favouriteCount' }); break;
        }
        break;
    }

    if (rotations && rotations.results && rotations.results.length) {
      this.fillRotationList(rotations.results);
    } else {
      // Show empty view
      this.emptyViewTextWidget.show();
    }

    this.loadingTextWidget.hide();

  }

  private getUserRotations() {
    return this.userToken
      ? API.userTokenRotations(this.userToken)
      : API.userRotations();
  }

  private getUserFavorites() {
    return this.userToken
      ? API.userTokenFavourites(this.userToken)
      : API.userFavourites();
  }

  private fillRotationList(rotations: Rotation[]) {
    const rotationViews = this.createRotationListItemView(rotations);
    this.visibleRotationViews.splice(0, 0, ...rotationViews);
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
          new TextWidget(`${classJob ? classJob.Abbreviation : rotation.classJobId} | 80 | Patch: ${rotation.patch} | ${rotation.user.username}`, 'rotation-browser__list-item-subtitle'),
          new TextWidget(`${rotation.favouriteCount} \u2665`, 'rotation-browser__list-item-favourite'),
        ])
    });
  }
}
