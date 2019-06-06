import {VidiunCategory} from 'vidiun-ngx-client';
import {Injectable, OnDestroy} from '@angular/core';
import { Observable } from 'rxjs';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import {CategorySectionsList} from './category-sections-list';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import {CategoryWidget} from '../category-widget';
import { ContentCategoryViewSections, ContentCategoryViewService } from 'app-shared/vmc-shared/vmc-views/details-views';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';

export interface SectionWidgetItem {
  label: string;
  isValid: boolean;
  attached: boolean;
  key: ContentCategoryViewSections;
}

@Injectable()
export class CategorySectionsListWidget extends CategoryWidget implements OnDestroy {
  private _sections = new BehaviorSubject<SectionWidgetItem[]>([]);
  public sections$: Observable<SectionWidgetItem[]> = this._sections.asObservable();

  constructor(private _appLocalization: AppLocalization,
              private _contentCategoryView: ContentCategoryViewService,
              logger: VidiunLogger
              ) {
    super('categorySectionsList', logger);
  }

  protected onDataLoading(dataId: any): void {
    this._clearSectionsList();
  }

  protected onActivate(firstTimeActivating: boolean) {
    if (firstTimeActivating) {
      this._initialize();
    }
  }

  protected onDataLoaded(data: VidiunCategory): void {
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



  private _reloadSections(category: VidiunCategory): void {
      const sections = [];
      const formWidgetsState = this.form.widgetsState;

      if (category) {
          CategorySectionsList.forEach((section) => {

              if (this._contentCategoryView.isAvailable({ category, section: section.key })) {
                  const sectionFormWidgetState = formWidgetsState ? formWidgetsState[section.key] : null;
                  const isSectionActive = sectionFormWidgetState && sectionFormWidgetState.isActive;

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



  ngOnDestroy() {
  }
}
