import { Component, OnInit, OnDestroy, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

import { VidiunClient } from 'vidiun-ngx-client';
import { TagSearchAction } from 'vidiun-ngx-client';
import { VidiunFilterPager } from 'vidiun-ngx-client';
import { VidiunTagFilter } from 'vidiun-ngx-client';
import { VidiunTaggedObjectType } from 'vidiun-ngx-client';
import { SuggestionsProviderData } from '@vidiun-ng/vidiun-primeng-ui';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { BrowserService } from 'app-shared/vmc-shell';
import { AreaBlockerMessage } from '@vidiun-ng/vidiun-ui';
import { PopupWidgetComponent, PopupWidgetStates } from '@vidiun-ng/vidiun-ui';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

@Component({
  selector: 'vBulkAddTags',
  templateUrl: './bulk-add-tags.component.html',
  styleUrls: ['./bulk-add-tags.component.scss']
})
export class BulkAddTags implements OnInit, OnDestroy, AfterViewInit {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() addTagsChanged = new EventEmitter<string[]>();

  public _loading = false;
  public _sectionBlockerMessage: AreaBlockerMessage;

  public _tagsProvider = new Subject<SuggestionsProviderData>();
  public tags: string[] = [];

  private _searchTagsSubscription : ISubscription;
  private _parentPopupStateChangeSubscribe : ISubscription;
  private _confirmClose: boolean = true;

  constructor(private _vidiunServerClient: VidiunClient, private _appLocalization: AppLocalization, private _browserService: BrowserService) {
  }

  ngOnInit() {
    this.tags = [];
  }

  ngAfterViewInit(){
    if (this.parentPopupWidget) {
      this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$
        .subscribe(event => {
          if (event.state === PopupWidgetStates.Open) {
            this._confirmClose = true;
          }
          if (event.state === PopupWidgetStates.BeforeClose) {
            if (event.context && event.context.allowClose){
              if (this.tags.length && this._confirmClose){
                event.context.allowClose = false;
                this._browserService.confirm(
                  {
                    header: this._appLocalization.get('applications.content.entryDetails.captions.cancelEdit'),
                    message: this._appLocalization.get('applications.content.entryDetails.captions.discard'),
                    accept: () => {
                      this._confirmClose = false;
                      this.parentPopupWidget.close();
                    }
                  }
                );
              }
            }
          }
        });
    }
  }

  ngOnDestroy(){
    this._parentPopupStateChangeSubscribe.unsubscribe();
  }

  _searchTags(event) : void {
    this._tagsProvider.next({ suggestions : [], isLoading : true});

    if (this._searchTagsSubscription)
    {
      // abort previous request
      this._searchTagsSubscription.unsubscribe();
      this._searchTagsSubscription = null;
    }

    const requestSubscription = this._vidiunServerClient.request(
      new TagSearchAction(
        {
          tagFilter: new VidiunTagFilter(
            {
              tagStartsWith : event.query,
              objectTypeEqual : VidiunTaggedObjectType.entry
            }
          ),
          pager: new VidiunFilterPager({
            pageIndex : 0,
            pageSize : 30
          })
        }
      )
    )
      .pipe(cancelOnDestroy(this))
      .subscribe(
        result =>
        {
          const suggestions = [];
          const tags = result.objects.map(item => item.tag);
          (tags|| []).forEach(suggestedTag => {
            const isSelectable = !this.tags.find(tag => {
              return tag === suggestedTag;
            });
            suggestions.push({ item: suggestedTag, isSelectable: isSelectable});
          });
          this._tagsProvider.next({suggestions: suggestions, isLoading: false});
        },
        err =>
        {
          this._tagsProvider.next({ suggestions : [], isLoading : false, errorMessage : <any>(err.message || err)});
        }
      );

  }

  public _apply(){
    this.addTagsChanged.emit(this.tags);
    this._confirmClose = false;
    this.parentPopupWidget.close();
  }
}

