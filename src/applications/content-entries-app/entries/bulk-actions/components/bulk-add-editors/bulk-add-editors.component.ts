import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ISubscription} from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';

import {VidiunClient} from 'vidiun-ngx-client';
import {VidiunFilterPager} from 'vidiun-ngx-client';
import {SuggestionsProviderData} from '@vidiun-ng/vidiun-primeng-ui';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import {BrowserService} from 'app-shared/vmc-shell';
import {AreaBlockerMessage} from '@vidiun-ng/vidiun-ui';
import {PopupWidgetComponent, PopupWidgetStates} from '@vidiun-ng/vidiun-ui';
import {UserListAction} from 'vidiun-ngx-client';
import {VidiunUserFilter} from 'vidiun-ngx-client';
import {VidiunUser} from 'vidiun-ngx-client';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

@Component({
  selector: 'vBulkAddEditors',
  templateUrl: './bulk-add-editors.component.html',
  styleUrls: ['./bulk-add-editors.component.scss']
})
export class BulkAddEditorsComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() addEditorsChanged = new EventEmitter<VidiunUser[]>();

  public _loading = false;
  public _sectionBlockerMessage: AreaBlockerMessage;

  public _usersProvider = new Subject<SuggestionsProviderData>();
  public users: VidiunUser[] = [];

  private _searchEditorsSubscription: ISubscription;
  private _parentPopupStateChangeSubscribe: ISubscription;
  private _confirmClose: boolean = true;

  constructor(private _vidiunServerClient: VidiunClient,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService) {
    this._convertUserInputToValidValue = this._convertUserInputToValidValue.bind(this); // fix scope issues when binding to a property
  }

  ngOnInit() {
    this.users = [];
  }

  ngAfterViewInit() {
    if (this.parentPopupWidget) {
      this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$
        .subscribe(event => {
          if (event.state === PopupWidgetStates.Open) {
            this._confirmClose = true;
          }
          if (event.state === PopupWidgetStates.BeforeClose) {
            if (event.context && event.context.allowClose) {
              if (this.users.length && this._confirmClose) {
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

  ngOnDestroy() {
    this._parentPopupStateChangeSubscribe.unsubscribe();
  }

  _searchUsers(event): void {
    this._usersProvider.next({suggestions: [], isLoading: true});

    if (this._searchEditorsSubscription) {
      // abort previous request
      this._searchEditorsSubscription.unsubscribe();
      this._searchEditorsSubscription = null;
    }

    this._vidiunServerClient.request(new UserListAction({
      filter: new VidiunUserFilter({
        idOrScreenNameStartsWith: event.query
      }),
      pager: new VidiunFilterPager({
          pageIndex: 0,
          pageSize: 30
        }
      )
    }))
      .pipe(cancelOnDestroy(this))
      .subscribe(
        result => {
          const suggestions = [];
          const users: VidiunUser[] = result.objects;
          (users || []).forEach(suggestedUser => {
              suggestedUser['__tooltip'] = suggestedUser.id;
            const isSelectable = !this.users.find(user => {
              return user.id === suggestedUser.id;
            });
            suggestions.push({
              name: `${suggestedUser.screenName} (${suggestedUser.id})`,
              item: suggestedUser,
              isSelectable: isSelectable
            });
          });
          this._usersProvider.next({suggestions: suggestions, isLoading: false});
        },
        err => {
          this._usersProvider.next({suggestions: [], isLoading: false, errorMessage: (err.message || err)});
        }
      );

  }

  public _convertUserInputToValidValue(value: string): any {
    let result = null;
    const tooltip = this._appLocalization.get('applications.content.bulkActions.userTooltip', {0: value});
    if (value) {
      result = {
          id: value,
          screenName: value,
          __tooltip: tooltip,
          __class: 'userAdded'
        };

    }
    return result;
  }


  public _apply() {
    this.addEditorsChanged.emit(this.users);
    this._confirmClose = false;
    this.parentPopupWidget.close();
  }
}

