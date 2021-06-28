import { WidgetBase } from '../widgets/widget-base.js';
import { Rotation } from './interfaces.js';
import { TextWidget } from '../widgets/text-widget.js';
import { ButtonWidget } from '../widgets/button-widget.js';
import { API } from '../api.js';
import {AppStateService} from "../services/app-state.service.js";
import {ModalWidget} from "../widgets/modal-widget.js";

export class ActiveRotationSummaryView extends WidgetBase {
  private _rotation: Rotation | null;
  public set rotation(rotation: Rotation | null) {
    this._rotation = rotation;
    this.updateView();
  }
  public get rotation() {
    return this._rotation;
  }

  // Elements
  private readonly titleTextWidget = new TextWidget('', 'active-rotation-summary__title');
  private readonly descriptionTextWidget = new TextWidget('', 'active-rotation-summary__description');
  private readonly patchTextWidget = new TextWidget('', 'active-rotation-summary__patch');
  private readonly authorTextWidget = new TextWidget('', 'active-rotation-summary__author');
  private readonly changeSetButtonWidget = new ButtonWidget('Change set', 'active-rotation-summary__change-set', { click: this.dispatchEvent.bind(this, new CustomEvent('app-clearrotation')) });
  private readonly favoritesButtonWidget = new ButtonWidget('', 'active-rotation-summary__favourites', { click: this.toggleFavorite.bind(this) });

  constructor(
      private readonly services: { appStateService: AppStateService }
  ) {
    super('active-rotation-summary');

    this.append(
      this.titleTextWidget,
      this.descriptionTextWidget,
      this.patchTextWidget,
      this.authorTextWidget,
      this.changeSetButtonWidget,
      this.favoritesButtonWidget
    );
  }

  private async toggleFavorite() {
    if (!this.services.appStateService.userToken && !this.services.appStateService.loggedInUser) {
      this.append(new ModalWidget(new TextWidget('You need to be logged in to favourite rotations.')));
      return;
    }

    if (this.rotation) {
      let newFavouriteCount: { favouriteCount: number };

      if (this.services.appStateService.userToken) {
        newFavouriteCount = await API.favoriteRotationWithToken(this.rotation.id, this.services.appStateService.userToken);
      } else {
        newFavouriteCount = await API.favoriteRotation(this.rotation.id);
      }

      this.favoritesButtonWidget.html = `${newFavouriteCount.favouriteCount} &#9829;`;
    }
  }

  private updateView() {
    this.isVisible = Boolean(this.rotation);

    if (!this._rotation) {
      return;
    }

    const r = this._rotation;
    this.titleTextWidget.text = r.title;
    this.descriptionTextWidget.text = r.description;
    this.patchTextWidget.text = r.patch;
    this.authorTextWidget.text = 'someone';
    this.favoritesButtonWidget.html = `${r.favouriteCount} &#9829;`;
  }
}
