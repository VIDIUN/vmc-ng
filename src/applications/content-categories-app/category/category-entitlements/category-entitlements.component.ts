import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {CategoryEntitlementsWidget} from './category-entitlements-widget.service';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import {VidiunCategoryUserPermissionLevel} from 'vidiun-ngx-client';
import {VidiunUser} from 'vidiun-ngx-client';
import {VidiunContributionPolicyType} from 'vidiun-ngx-client';
import {VidiunAppearInListType} from 'vidiun-ngx-client';
import {VidiunPrivacyType} from 'vidiun-ngx-client';
import { PopupWidgetComponent, PopupWidgetStates } from '@vidiun-ng/vidiun-ui';
import {BrowserService} from 'app-shared/vmc-shell';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

@Component({
  selector: 'vCategoryEntitlements',
  templateUrl: './category-entitlements.component.html',
  styleUrls: ['./category-entitlements.component.scss'],
    providers: [VidiunLogger.createLogger('CategoryEntitlementsComponent')]
})
export class CategoryEntitlementsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('manageUsersPopup') manageUsersPopup: PopupWidgetComponent;
  public _defaultPermissionLevelOptions: { value: number, label: string }[] = [];
  public _vmcPermissions = VMCPermissions;

  public _membersCount: { loading: boolean, value: number, hasError?: boolean } = { loading: true, value: 0, hasError : false };
  constructor(public _widgetService: CategoryEntitlementsWidget,
              private _appLocalization: AppLocalization,
              private _permissionsService: VMCPermissionsService,
              private _browserService: BrowserService,
              private _logger: VidiunLogger) {
  }

  ngOnInit() {
    this._widgetService.attachForm();

    this._widgetService.data$
        .pipe(cancelOnDestroy(this))
        .subscribe(data =>
        {
            this._membersCount = { loading: !data, value: data ? data.membersCount : 0, hasError: false };
        });

    this._defaultPermissionLevelOptions = [{
      value: VidiunCategoryUserPermissionLevel.member,
      label: this._appLocalization.get('applications.content.categoryDetails.entitlements.defaultPermissionLevel.member')
    }, {
      value: VidiunCategoryUserPermissionLevel.contributor,
      label: this._appLocalization.get('applications.content.categoryDetails.entitlements.defaultPermissionLevel.contributor')
    }, {
      value: VidiunCategoryUserPermissionLevel.moderator,
      label: this._appLocalization.get('applications.content.categoryDetails.entitlements.defaultPermissionLevel.moderator')
    }, {
      value: VidiunCategoryUserPermissionLevel.manager,
      label: this._appLocalization.get('applications.content.categoryDetails.entitlements.defaultPermissionLevel.manager')
    }];
  }

  ngAfterViewInit() {
      this.manageUsersPopup.state$
          .pipe(cancelOnDestroy(this))
          .skip(1)
          .subscribe(data => {
                  if (data.state === PopupWidgetStates.Close) {
                      this._membersCount.loading = true;
                      this._membersCount.hasError = false;
                      this._widgetService.fetchUpdatedMembersCount()
                          .pipe(cancelOnDestroy(this))
                          .subscribe(
                              value =>
                              {
                                  this._membersCount.loading = false;
                                  this._membersCount.value = value;
                              },
                              error =>
                              {
                                  this._membersCount.loading = false;
                                  this._membersCount.hasError = true;
                              }
                          )
                  }
              }
          );
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }

  get _contentPrivacyOptions() {
    return VidiunPrivacyType;
  }

  get _categoryListingOptions() {
    return VidiunAppearInListType;
  }

  get _contentPublishPermissionsOptions() {
    return VidiunContributionPolicyType;
  }

  // owner changed
  onOwnerChanged(owner: VidiunUser): void {
    // reset the form to have the new user in the textbox
    this._widgetService.entitlementsForm.patchValue({ owner });
    this._widgetService.setDirty();
  }

  public _toggleInherit({originalEvent, checked}: { originalEvent: Event, checked: boolean }) {
      this._logger.info(`handle toggle inherit action by user`, { checked });
    const affectedControls =
      [this._widgetService.entitlementsForm.get('defaultPermissionLevel'),
       this._widgetService.entitlementsForm.get('owner')];

    affectedControls.forEach(ctrl => {
      if (checked === false) {
        ctrl.enable();
      } else {
        ctrl.disable();
      }
    });

    this._widgetService.setDirty();
  }


  public mananageUsersPermissions() {
      this._logger.info(`handle open manage users permission popup action by user`);
    if (this._widgetService.entitlementsForm.get('inheritUsersPermissions').value === this._widgetService.inheritUsersPermissionsOriginalValue) {
      this.manageUsersPopup.open();
    } else {
        this._logger.info(`user cannot manage users permissions, show alert, abort action`);
      this._browserService.alert(
        {
          header: this._appLocalization
            .get('applications.content.categoryDetails.entitlements.manageUsersPermissionsEditMessage.title'),
          message: this._appLocalization
            .get('applications.content.categoryDetails.entitlements.manageUsersPermissionsEditMessage.description'),
          accept: () => {
              this._logger.info(`user dismissed alert`);
          }
        });
    }
  }
}
