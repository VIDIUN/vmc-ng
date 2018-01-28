import {Injectable, OnDestroy} from '@angular/core';
import {KalturaClient, KalturaMultiRequest} from 'kaltura-ngx-client';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import {Observable} from 'rxjs/Observable';
import {CategoryListAction} from 'kaltura-ngx-client/api/types/CategoryListAction';
import {KalturaCategoryFilter} from 'kaltura-ngx-client/api/types/KalturaCategoryFilter';
import {PartnerGetInfoAction} from 'kaltura-ngx-client/api/types/PartnerGetInfoAction';
import {KalturaPrivacyType} from 'kaltura-ngx-client/api/types/KalturaPrivacyType';
import {KalturaContributionPolicyType} from 'kaltura-ngx-client/api/types/KalturaContributionPolicyType';
import {KalturaAppearInListType} from 'kaltura-ngx-client/api/types/KalturaAppearInListType';
import {CategoryUpdateAction} from 'kaltura-ngx-client/api/types/CategoryUpdateAction';
import { CategoryGetAction } from 'kaltura-ngx-client/api/types/CategoryGetAction';
import { CategoriesSearchService } from 'app-shared/content-shared/categories/categories-search.service';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { CategoriesGraphUpdatedEvent } from 'app-shared/kmc-shared/app-events/categories-graph-updated/categories-graph-updated';
import { AppEventsService } from 'app-shared/kmc-shared';

export interface EntitlementSectionData {
  categories: KalturaCategory[];
  partnerDefaultEntitlementEnforcement: boolean
}

@Injectable()
export class EntitlementService implements OnDestroy{

  constructor(private _kalturaServerClient: KalturaClient, private _appEvents: AppEventsService, private _categoriesSearch: CategoriesSearchService, private _appLocalization: AppLocalization) {
  }

  public getEntitlementsSectionData(): Observable<EntitlementSectionData> {

    const request = new KalturaMultiRequest(
      new PartnerGetInfoAction(),
      new CategoryListAction({
        filter: new KalturaCategoryFilter({
          privacyContextEqual: '*'
        })
      })
    );

    return this._kalturaServerClient.multiRequest(request).cancelOnDestroy(this).map(
      response => {
        if (response.hasErrors()) {
          throw new Error('error occurred in action \'getEntitlementsSectionData\'');
        }

        const partnerDefaultEntitlementEnforcement: boolean = response[0].result.defaultEntitlementEnforcement;
        const categories: KalturaCategory[] = response[1].result.objects;
        return {categories, partnerDefaultEntitlementEnforcement};
      }
    );
  }

  public deleteEntitlement({id, privacyContextData}: { id: number, privacyContextData?: { privacyContext: string, privacyContexts: string } }): Observable<void> {
      if (!id) {
          return Observable.throw(new Error('Error occurred while trying to delete entitlement'));
      }

      const category = new KalturaCategory();
      category.privacyContext = null;

      if (privacyContextData !== null && typeof privacyContextData !== "undefined") {
          const context = (privacyContextData && privacyContextData.privacyContext.split(',')) || [];
          const contexts = (privacyContextData && privacyContextData.privacyContexts.split(',')) || [];

          // Subtract privacyContext from privacyContexts and if no contexts left so set the following properties
          if (contexts.length && contexts.filter(c => (context.indexOf(c) < 0)).length) {
              category.privacy = KalturaPrivacyType.all;
              category.appearInList = KalturaAppearInListType.partnerOnly;
              category.contributionPolicy = KalturaContributionPolicyType.all;
          }
      }

      return this._kalturaServerClient.request(new CategoryUpdateAction({
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

                return this._kalturaServerClient.request(new CategoryUpdateAction({
                    id,
                    category: new KalturaCategory({
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
