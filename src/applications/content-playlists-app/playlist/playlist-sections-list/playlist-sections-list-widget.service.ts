import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { PlaylistWidget } from '../playlist-widget';
import { VidiunPlaylist } from 'vidiun-ngx-client';
import { SectionsList } from './sections-list';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import { ContentPlaylistViewService } from 'app-shared/vmc-shared/vmc-views/details-views';
import { ContentPlaylistViewSections } from 'app-shared/vmc-shared/vmc-views/details-views/content-playlist-view.service';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';
export interface SectionWidgetItem {
  label: string;
  isValid: boolean;
  attached: boolean;
  key: ContentPlaylistViewSections;
}

@Injectable()
export class PlaylistSectionsListWidget extends PlaylistWidget implements OnDestroy {
  private _sections = new BehaviorSubject<SectionWidgetItem[]>([]);
  public sections$: Observable<SectionWidgetItem[]> = this._sections.asObservable();

  constructor(private _appLocalization: AppLocalization,
              private _contentPlaylistView: ContentPlaylistViewService,
              logger: VidiunLogger
              ) {
    super('sectionsList', logger);
  }

  ngOnDestroy() {
  }

  protected onDataLoading(dataId: any): void {
    this._clearSectionsList();
  }

  protected onActivate(firstTimeActivating: boolean) {
    if (firstTimeActivating) {
      this._initialize();
    }
  }

  protected onDataLoaded(data: VidiunPlaylist): void {
    this._reloadSections(data);
  }

  private _initialize(): void {
    this.form.widgetsState$
      .pipe(cancelOnDestroy(this))
      .subscribe(
        sectionsState => {
          this._sections.getValue().forEach((section: SectionWidgetItem) => {
            const sectionState = sectionsState[section.key];
            const isValid = (!sectionState || sectionState.isBusy || sectionState.isValid || !sectionState.isActive);
            const isAttached = (!!sectionState && sectionState.isAttached);

            if (section.attached !== isAttached || section.isValid !== isValid) {
              section.attached = isAttached;
              section.isValid = isValid;
            }
          });
        }
      );
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset() {

  }

  private _clearSectionsList(): void {
    this._sections.next([]);

  }

  private _reloadSections(playlist: VidiunPlaylist): void {
    const sections = [];
    const formWidgetsState = this.form.widgetsState;

    if (playlist) {
      SectionsList.forEach((section) => {

        const sectionFormWidgetState = formWidgetsState ? formWidgetsState[section.key] : null;
        const isSectionActive = sectionFormWidgetState && sectionFormWidgetState.isActive;

        if (this._contentPlaylistView.isAvailable({ section: section.key, playlist })) {
          sections.push(
            {
              label: this._appLocalization.get(section.label),
              active: isSectionActive,
              hasErrors: sectionFormWidgetState ? sectionFormWidgetState.isValid : false,
              key: section.key
            }
          );
        }
      });
    }

    this._sections.next(sections);
  }
}
