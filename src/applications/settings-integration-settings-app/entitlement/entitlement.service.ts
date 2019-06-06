import {Injectable, OnDestroy} from '@angular/core';
import {VidiunClient, VidiunMultiRequest} from 'vidiun-ngx-client';
import {VidiunCategory} from 'vidiun-ngx-client';
import { Observable } from 'rxjs';
import {CategoryListAction} from 'vidiun-ngx-client';
import {VidiunCategoryFilter} from 'vidiun-ngx-client';
import {PartnerGetInfoAction} from 'vidiun-ngx-client';
import {VidiunPrivacyType} from 'vidiun-ngx-client';
import {VidiunContributionPolicyType} from 'vidiun-ngx-client';
import {VidiunAppearInListType} from 'vidiun-ngx-client';
import {CategoryUpdateAction} from 'vidiun-ngx-client';
import { CategoryGetAction } from 'vidiun-ngx-client';
import { CategoriesSearchService } from 'app-shared/content-shared/categories/categories-search.service';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { CategoriesGraphUpdatedEvent } from 'app-shared/vmc-shared/app-events/categories-graph-updated/categories-graph-updated';
import { AppEventsService } from 'app-shared/vmc-shared';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

export interface EntitlementSectionData {
  categories: VidiunCategory[];
  partnerDefaultEntitlementEnforcement: boolean
}

@Injectable()
export class EntitlementService implements OnDestroy{

  constructor(private _vidiunServerClient: VidiunClient, private _appEvents: AppEventsService, private _categoriesSearch: CategoriesSearchService, private _appLocalization: AppLocalization) {
  }

  public getEntitlementsSectionData(): Observable<EntitlementSectionData> {

    const request = new VidiunMultiRequest(
      new PartnerGetInfoAction(),
      new CategoryListAction({
        filter: new VidiunCategoryFilter({
          privacyContextEqual: '*'
        })
      })
    );

    return this._vidiunServerClient.multiRequest(request).pipe(cancelOnDestroy(this)).map(
      response => {
        if (response.hasErrors()) {
          throw new Error('error occurred in action \'getEntitlementsSectionData\'');
        }

        const partnerDefaultEntitlementEnforcement: boolean = response[0].result.defaultEntitlementEnforcement;
        const categories: VidiunCategory[] = response[1].result.objects;
        return {categories, partnerDefaultEntitlementEnforcement};
      }
    );
  }

  public deleteEntitlement({id, privacyContextData}: { id: number, privacyContextData?: { privacyContext: string, privacyContexts: string } }): Observable<void> {
      if (!id) {
          return Observable.throw(new Error('Error occurred while trying to delete entitlement'));
      }

      const category = new VidiunCategory();
      category.privacyContext = null;

      if (privacyContextData !== null && typeof privacyContextData !== "undefined") {
          const context = (privacyContextData && privacyContextData.privacyContext.split(',')) || [];
          const contexts = (privacyContextData && privacyContextData.privacyContexts.split(',')) || [];

          // Subtract privacyContext from privacyContexts and if no contexts left so set the following properties
          if (contexts.length && contexts.filter(c => (context.indexOf(c) < 0)).length) {
              category.privacy = VidiunPrivacyType.all;
              category.appearInList = VidiunAppearInListType.partnerOnly;
              category.contributionPolicy = VidiunContributionPolicyType.all;
          }
      }

      return this._vidiunServerClient.request(new CategoryUpdateAction({
          id,
          category
      }))
          .do(() => {
              this._notifyCategoriesGraphChanges();
          })
          .map(_ => (undefined));
  }

  public addEntitlement({id, privacyContext}: { id: number, privacyContext: string }): Observable<void> {
    if (!id || !privacyContext) {
      return Observable.throw(new Error('Error occurred while trying to add entitlement, invalid entitlement\'s data'));
    }

    return this._categoriesSearch.getCategory(id)
        .switchMap(category =>
        {
            if (category.privacyContext && category.privacyContext.length)
            {
                return Observable.throw(new Error(this._appLocalization.get('applications.settings.integrationSettings.entitlement.editEntitlement.errors.privacyContextLabelExists')));
            }else {

                return this._vidiunServerClient.request(new CategoryUpdateAction({
                    id,
                    category: new VidiunCategory({
                        privacyContext
                    })
                }))
                    .do(() => {
                        this._notifyCategoriesGraphChanges();
                    })
                    .map(_ => (undefined));
            }
        });
  }

  private _notifyCategoriesGraphChanges(): void{
      this._appEvents.publish(new CategoriesGraphUpdatedEvent());
  }

  ngOnDestroy() {
  }

}
