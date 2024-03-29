import { Observable } from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Injectable, OnDestroy} from '@angular/core';
import {CategoryWidget} from '../category-widget';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import {CategoryService} from '../category.service';
import {VidiunClient, VidiunMultiRequest} from 'vidiun-ngx-client';
import {VidiunCategory} from 'vidiun-ngx-client';
import {CategoryGetAction} from 'vidiun-ngx-client';
import {VidiunInheritanceType} from 'vidiun-ngx-client';
import {VidiunNullableBoolean} from 'vidiun-ngx-client';
import {VidiunUser} from 'vidiun-ngx-client';
import {UserGetAction} from 'vidiun-ngx-client';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { ContentCategoryViewSections } from 'app-shared/vmc-shared/vmc-views/details-views';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

@Injectable()
export class CategoryEntitlementsWidget extends CategoryWidget implements OnDestroy {

  public entitlementsForm: FormGroup;
  public parentCategory: VidiunCategory = null;

  public inheritUsersPermissionsOriginalValue: boolean;

  constructor(private _vidiunClient: VidiunClient,
              private _formBuilder: FormBuilder,
              private _appLocalization: AppLocalization,
              private _permissionsService: VMCPermissionsService,
              private _categoryService: CategoryService,
              logger: VidiunLogger) {
    super(ContentCategoryViewSections.Entitlements, logger);

    this._buildForm();
  }

  public fetchUpdatedMembersCount(): Observable<number> {
      if (this.data) {
          return this._vidiunClient.request(
              new CategoryGetAction({id: this.data.id})
          ).pipe(cancelOnDestroy(this, this.widgetReset$))
              .map(value => {
                  return value.membersCount;
              });
      } else {
          return Observable.throw(new Error('missing data'));
      }
  }

  protected onActivate(firstTimeActivating: boolean): Observable<{ failed: boolean }> {
    if (!this._permissionsService.hasPermission(VMCPermissions.CONTENT_MANAGE_CATEGORY_USERS)) {
	    this.entitlementsForm.disable({emitEvent: false});
    }

    super._showLoader();

    return this._fetchAdditionalData()
      .pipe(cancelOnDestroy(this, this.widgetReset$))
      .map(({owner, parentCategory}) => {
        super._hideLoader();
        this.parentCategory = parentCategory || null;
        this._resetFormData(owner);
        this._monitorFormChanges();
        return {failed: false};
      })
      .catch(error => {
        super._hideLoader();
        super._showActivationError();
        return Observable.of({failed: true, error});
      });
  }


  private _fetchAdditionalData(): Observable<{owner: VidiunUser, parentCategory?: VidiunCategory}> {

      const multiRequest = new VidiunMultiRequest();
      if (this.data.owner) {
          multiRequest.requests.push(
              new UserGetAction({userId: this.data.owner})
          );
      }

      if (this.data.parentId > 0) {
          multiRequest.requests.push(new CategoryGetAction({
              id: this.data.parentId
          }));
      }

      if (multiRequest.requests.length) {
          return this._vidiunClient.multiRequest(multiRequest)
              .map(
                  data => {
                      if (data.hasErrors()) {
                          // check for missing user error, in which case we can continue
                          let missingUserError = false;
                          data.forEach(response => {
                              if (response.error && response.error.code === "INVALID_USER_ID") {
                                  missingUserError = true;
                                  super._showUserError();
                              }
                          });
                          if (!missingUserError) {
                              throw new Error('error occurred in action \'_fetchAdditionalData\'');
                          }
                      }

                      let owner: VidiunUser = null;
                      let parentCategory = null;
                      data.forEach(response => {
                          if (response.result instanceof VidiunCategory) {
                              parentCategory = response.result;
                          } else if (response.result instanceof VidiunUser) {
                              owner = response.result;
                          }
                      });
                      return {owner, parentCategory};
                  });
      }else
      {
          return Observable.of({ owner: null, parentCategory: null});
      }
  }

  private _buildForm(): void {
    this.entitlementsForm = this._formBuilder.group({
      contentPrivacy: null,
      categoryListing: null,
      contentPublishPermissions: null,
      moderateContent: null,
      inheritUsersPermissions: null, // no
      defaultPermissionLevel: {value: null},
      owner: null,
      permittedUsers: []
    });
  }

  private _monitorFormChanges() {
    Observable.merge(this.entitlementsForm.valueChanges, this.entitlementsForm.statusChanges)
      .pipe(cancelOnDestroy(this, this.widgetReset$))
      .subscribe(
        () => {
          const isValid = this.entitlementsForm.status !== 'INVALID';
          const isDirty = this.entitlementsForm.dirty;
          if (this.isDirty !== isDirty || this.isValid !== isValid) {
            super.updateState({
              isValid: isValid,
              isDirty: isDirty
            });
          }
        }
      );
  }

  public setDirty() {
    super.updateState({
      isDirty: true
    });
  }

  private _resetFormData(owner: VidiunUser) {

      const hasCanModifyPermission = this._permissionsService.hasPermission(VMCPermissions.CONTENT_MANAGE_CATEGORY_USERS);

    this.inheritUsersPermissionsOriginalValue = this.parentCategory && this.data.inheritanceType === VidiunInheritanceType.inherit;
    this.entitlementsForm.reset(
      {
        contentPrivacy: this.data.privacy,
        categoryListing: this.data.appearInList,
        contentPublishPermissions: this.data.contributionPolicy,
        moderateContent: this.data.moderation === VidiunNullableBoolean.trueValue,
        inheritUsersPermissions: this.inheritUsersPermissionsOriginalValue,
        defaultPermissionLevel: {
          value: this.data.defaultPermissionLevel,
          disabled: !hasCanModifyPermission || this.inheritUsersPermissionsOriginalValue
        },
        owner: {
          value: owner,
          disabled: !hasCanModifyPermission || this.inheritUsersPermissionsOriginalValue
        },
        permittedUsers: []
      }
    );
  }


  protected onDataSaving(newData: VidiunCategory, request: VidiunMultiRequest): void {

    if (!this.entitlementsForm.valid) {
      throw new Error('Cannot perform save operation since the entitlement form is invalid');
    }

    const metadataFormValue = this.entitlementsForm.value;
    // save Entitlements Form
    newData.privacy = metadataFormValue.contentPrivacy;
    newData.appearInList = metadataFormValue.categoryListing;
    newData.contributionPolicy = metadataFormValue.contentPublishPermissions;
    newData.moderation = metadataFormValue.moderateContent !== true ? VidiunNullableBoolean.falseValue : VidiunNullableBoolean.trueValue;
    newData.inheritanceType = metadataFormValue.inheritUsersPermissions ? VidiunInheritanceType.inherit : VidiunInheritanceType.manual;
    if (!metadataFormValue.inheritUsersPermissions) {
      newData.defaultPermissionLevel = metadataFormValue.defaultPermissionLevel;

      if (metadataFormValue.owner) {
          newData.owner = metadataFormValue.owner.id;
      }
    }
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset() {
    this.entitlementsForm.reset({});
    this.parentCategory = null;
  }

  onValidate(wasActivated: boolean): Observable<{ isValid: boolean }> {
    return Observable.create(observer => {
      this.entitlementsForm.updateValueAndValidity();
      const isValid = this.entitlementsForm.valid;
      observer.next({isValid});
      observer.complete();
    });
  }



  ngOnDestroy() {
  }

  public openCategory(category: VidiunCategory): void {
    if (category && category.id) {
      this._categoryService.openCategory(category);
    }
  }
}


