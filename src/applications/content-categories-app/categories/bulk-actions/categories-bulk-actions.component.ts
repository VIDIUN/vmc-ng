import {
  CategoriesBulkAddTagsService,
  CategoriesBulkChangeCategoryListingService,
  CategoriesBulkChangeContentPrivacyService,
  CategoriesBulkChangeContributionPolicyService,
  CategoriesBulkChangeOwnerService,
  CategoriesBulkDeleteService,
  CategoriesBulkRemoveTagsService
} from './services';
import {CategoriesBulkActionBaseService} from './services/categories-bulk-action-base.service';
import {MenuItem} from 'primeng/primeng';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {VidiunCategory} from 'vidiun-ngx-client';
import {PopupWidgetComponent} from '@vidiun-ng/vidiun-ui';
import {BrowserService} from 'app-shared/vmc-shell';
import {subApplicationsConfig} from 'config/sub-applications';
import {VidiunUser} from 'vidiun-ngx-client';
import {PrivacyMode} from './components/bulk-change-content-privacy/bulk-change-content-privacy.component';
import {VidiunPrivacyType} from 'vidiun-ngx-client';
import {VidiunAppearInListType} from 'vidiun-ngx-client';
import {AppearInListType} from './components/bulk-change-category-listing/bulk-change-category-listing.component';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import {VidiunContributionPolicyType} from 'vidiun-ngx-client';
import {CategoriesUtilsService} from "../../categories-utils.service";
import {CategoriesStatusMonitorService} from 'app-shared/content-shared/categories-status/categories-status-monitor.service';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';

@Component({
  selector: 'vCategoriesBulkActions',
  templateUrl: './categories-bulk-actions.component.html',
  styleUrls: ['./categories-bulk-actions.component.scss'],
    providers: [VidiunLogger.createLogger('CategoriesBulkActionsComponent')]
})
export class CategoriesBulkActionsComponent implements OnInit, OnDestroy {
  private _selectedCateogoriesWithPrivacyContext: VidiunCategory[] = [];

  public _bulkActionsMenu: MenuItem[] = [];
  public _vmcPermissions = VMCPermissions;
  public _bulkAction = '';

  @Input() selectedCategories: VidiunCategory[];

  @Output() onBulkChange = new EventEmitter<{ reload: boolean}>();

  @ViewChild('bulkActionsPopup') public bulkActionsPopup: PopupWidgetComponent;


  constructor(private _appLocalization: AppLocalization,
              private _permissionsService: VMCPermissionsService,
              private _browserService: BrowserService,
              private _bulkAddTagsService: CategoriesBulkAddTagsService,
              private _bulkRemoveTagsService: CategoriesBulkRemoveTagsService,
              private _bulkChangeOwnerService: CategoriesBulkChangeOwnerService,
              private _bulkDeleteService: CategoriesBulkDeleteService,
              private _bulkChangeContentPrivacyService: CategoriesBulkChangeContentPrivacyService,
              private _bulkChangeCategoryListingService: CategoriesBulkChangeCategoryListingService,
              private _bulkChangeContributionPolicyService: CategoriesBulkChangeContributionPolicyService,
              private _categoriesUtilsService: CategoriesUtilsService,
              private _categoriesStatusMonitorService: CategoriesStatusMonitorService,
              private _logger: VidiunLogger) {
  }

  ngOnInit() {
    this._bulkActionsMenu = this.getBulkActionItems();
  }

  ngOnDestroy() {

  }

  private _filterPrivacyContext(): { hadNoPrivacyContext: boolean } {
    this._selectedCateogoriesWithPrivacyContext = [];
    const selectedCategoriesLength = this.selectedCategories.length;
    this._selectedCateogoriesWithPrivacyContext = [...this.selectedCategories.filter(category => !!category.privacyContexts)];
    const hadNoPrivacyContext = this._selectedCateogoriesWithPrivacyContext.length !== selectedCategoriesLength;

    return { hadNoPrivacyContext };
  }

  getBulkActionItems(): MenuItem[] {
    const items = [
      { id: 'changeCategoryOwner',
        label: this._appLocalization.get('applications.content.categories.bActions.changeCategoryOwner'),
        command: () => { this.openBulkActionWindow('changeOwner', 500, 280) } },
      { id: 'changeContributionPolicy',
        label: this._appLocalization.get('applications.content.categories.bActions.changeContributionPolicy'),
        command: () => { this.openBulkActionWindow('changeContributionPolicy', 586, 314) } },
      { id: 'changeCategoryListing',
        label: this._appLocalization.get('applications.content.categories.bActions.changeCategoryListing'),
        command: () => { this.openBulkActionWindow('changeCategoryListing', 586, 314) } },
      { id: 'changeContentPrivacy',
        label: this._appLocalization.get('applications.content.categories.bActions.changeContentPrivacy'),
        command: () => { this.openBulkActionWindow('changeContentPrivacy', 586, 352) } },
      { id: 'moveCategories',
        label: this._appLocalization.get('applications.content.categories.bActions.moveCategories'),
        command: () => { this._moveCategories() } },
      {
        id: 'addRemoveTags',
        label: this._appLocalization.get('applications.content.categories.bActions.addRemoveTags'), items: [
        { label: this._appLocalization.get('applications.content.categories.bActions.addTags'),
          command: () => { this.openBulkActionWindow('addTags', 500, 500) } },
        { label: this._appLocalization.get('applications.content.categories.bActions.removeTags'),
          command: () => { this.openBulkActionWindow('removeTags', 500, 500) } }]
      }
    ];

    this._permissionsService.filterList(
      <{ id: string }[]>items,
      {
        'changeContentPrivacy': VMCPermissions.CONTENT_MANAGE_CATEGORY_USERS,
        'changeContributionPolicy': VMCPermissions.CONTENT_MANAGE_CATEGORY_USERS,
        'changeCategoryListing': VMCPermissions.CONTENT_MANAGE_CATEGORY_USERS,
        'changeCategoryOwner': VMCPermissions.CONTENT_MANAGE_CATEGORY_USERS
      });

    return items;
  }

  openBulkActionWindow(action: string, popupWidth: number, popupHeight: number) {
      this._logger.info(`handle open bulk action window`, { action, popupWidth, popupHeight });

    if (this._categoriesUtilsService.hasEditWarnings(this.selectedCategories)) {
        this._logger.info(`category has edit warning tag, show confirmation`);
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.categories.editCategory'),
          message: this._appLocalization.get('applications.content.categories.editWithEditWarningTags'),
          accept: () => {
              this._logger.info(`user confirmed, proceed action`);
            // use timeout to allow data binding of popup dimensions to update before opening the popup
            setTimeout(() => {
              this._bulkAction = action;
              // override the width and height of the popup
              this.bulkActionsPopup.popupWidth = popupWidth;
              this.bulkActionsPopup.popupHeight = popupHeight;
              this.bulkActionsPopup.open();
            }, 0);
          },
            reject: () => {
                this._logger.info(`user didn't confirm, abort action`);
            }
        }
      );
    } else {
      // use timeout to allow data binding of popup dimensions to update before opening the popup
      setTimeout(() => {
        this._bulkAction = action;
        this.bulkActionsPopup.popupWidth = popupWidth;
        this.bulkActionsPopup.popupHeight = popupHeight;
        this.bulkActionsPopup.open();
      }, 0);
    }

  }

  // add tags changed
  onAddTagsChanged(tags: string[]): void {
      this._logger.info(`handle add tags action`, { tags });
    this.executeService(this.selectedCategories, this._bulkAddTagsService, tags);
  }

  // remove tags changed
  onRemoveTagsChanged(tags: string[]): void {
      this._logger.info(`handle remove tags action`, { tags });
    this.executeService(this.selectedCategories, this._bulkRemoveTagsService, tags);
  }

  // owner changed
  onOwnerChanged(owners: VidiunUser[]): void {

    const executeAction = () => {
      if (this._selectedCateogoriesWithPrivacyContext.length && owners && owners.length) {
          this._logger.info(`handle owner changed action`, () => ({ owners: owners.map(owner => owner.id) }));
        this.executeService(this._selectedCateogoriesWithPrivacyContext, this._bulkChangeOwnerService, owners[0]);
      }
    };

    const { hadNoPrivacyContext } = this._filterPrivacyContext();
    if (hadNoPrivacyContext) {
        this._logger.info(`categories without privacy context detected, show alert`);
      this._browserService.alert({
          header: this._appLocalization.get('app.common.attention'),
        message: this._appLocalization.get('applications.content.categories.bActions.noPrivacyContext'),
        accept: () => {
            this._logger.info(`user confirmed, proceed action`);
            executeAction();
        }
      });
    } else {
      executeAction();
    }
  }

  // change content privacy
  onChangeContentPrivacyChanged(privacyMode: PrivacyMode): void {
      this._logger.info(`handle change content privacy action`, { privacyMode });
    let privacyType: VidiunPrivacyType;
    switch (true) {
      case privacyMode === PrivacyMode.NoRestriction:
        privacyType = VidiunPrivacyType.all;
        break;
      case privacyMode === PrivacyMode.Private:
        privacyType = VidiunPrivacyType.membersOnly;
        break;
      case privacyMode === PrivacyMode.RequiresAuthentication:
        privacyType = VidiunPrivacyType.authenticatedUsers;
        break;
      default:
        break;
    }

    const executeAction = () => {
      if (this._selectedCateogoriesWithPrivacyContext.length) {
        this.executeService(this._selectedCateogoriesWithPrivacyContext, this._bulkChangeContentPrivacyService, privacyType);
      }
    };

    const { hadNoPrivacyContext } = this._filterPrivacyContext();
    if (hadNoPrivacyContext) {
        this._logger.info(`categories without privacy context detected, show alert`);
      this._browserService.alert({
          header: this._appLocalization.get('app.common.attention'),
        message: this._appLocalization.get('applications.content.categories.bActions.noPrivacyContext'),
        accept: () => {
            this._logger.info(`user confirmed, proceed action`);
            executeAction();
        }
      });
    } else {
      executeAction();
    }
  }

  // change category listing
  onChangeCategoryListingChanged(appearInList: AppearInListType): void {
      this._logger.info(`handle change category listing action`, { appearInList });
    let appearInListType: VidiunAppearInListType;
    if (appearInList === AppearInListType.NoRestriction) {
      appearInListType = VidiunAppearInListType.partnerOnly;
    } else if (appearInList === AppearInListType.Private) {
      appearInListType = VidiunAppearInListType.categoryMembersOnly;
    }

    const executeAction = () => {
      if (this._selectedCateogoriesWithPrivacyContext.length) {
        this.executeService(this._selectedCateogoriesWithPrivacyContext, this._bulkChangeCategoryListingService, appearInListType);
      }
    };

    const { hadNoPrivacyContext } = this._filterPrivacyContext();
    if (hadNoPrivacyContext) {
        this._logger.info(`categories without privacy context detected, show alert`);
      this._browserService.alert({
          header: this._appLocalization.get('app.common.attention'),
        message: this._appLocalization.get('applications.content.categories.bActions.noPrivacyContext'),
        accept: () => {
            this._logger.info(`user confirmed, proceed action`);
            executeAction();
        }
      });
    } else {
      executeAction();
    }
  }

  // change contribution policy
  onChangeContributionPolicyChanged(policyType: VidiunContributionPolicyType): void {
      this._logger.info(`handle change contribution policy action`, { policyType });
    const executeAction = () => {
      if (this._selectedCateogoriesWithPrivacyContext.length) {
        this.executeService(this._selectedCateogoriesWithPrivacyContext, this._bulkChangeContributionPolicyService, policyType);
      }
    };

    const { hadNoPrivacyContext } = this._filterPrivacyContext();
    if (hadNoPrivacyContext) {
        this._logger.info(`categories without privacy context detected, show alert`);
      this._browserService.alert({
          header: this._appLocalization.get('app.common.attention'),
        message: this._appLocalization.get('applications.content.categories.bActions.noPrivacyContext'),
        accept: () => {
            this._logger.info(`user confirmed, proceed action`);
            executeAction();
        }
      });
    } else {
      executeAction();
    }
  }

  // bulk delete
  public deleteCategories(): void {
      this._logger.info(`handle delete categories action`);

    this._categoriesUtilsService.confirmDeleteMultiple(this.selectedCategories)
      .pipe(cancelOnDestroy(this))
      .subscribe(result => {
        if (result.confirmed) {
            this._logger.info(`handle delete categories request`);
          setTimeout(() => {
            this.executeService(
              this.selectedCategories
                .filter(category =>
                    !category.parentId || !this.selectedCategories.find(({ id }) => id === category.parentId)
                ),
              this._bulkDeleteService,
              {},
              true,
              false,
              () => this._categoriesStatusMonitorService.updateCategoriesStatus()
            );
            // need to use a timeout between multiple confirm dialogues (if more than 50 entries are selected)
          }, 0);
        }
      }, error => {
          this._logger.warn(`handle failed delete categories action`, { errorMessage: error.message });
        this._browserService.alert({
            header: this._appLocalization.get('app.common.attention'),
          message: this._appLocalization.get('applications.content.categoryDetails.subcategories.errors.categoriesCouldNotBeDeleted')
        });
      });
  }

  private _moveCategories(): void {

    if (this.selectedCategories.length > 0) {
      this._logger.info(`handle move categories action`, () => ({ categories: this.selectedCategories.map(category => category.id) }));

      const movingOnlySiblings: boolean = this.selectedCategories.every((category) => {
        return category.parentId === this.selectedCategories[0].parentId;
      });

      if (!movingOnlySiblings) {
          this._logger.info(`parent categories detected, abort action`);
        this._browserService.alert({
            header: this._appLocalization.get('app.common.attention'),
          message: this._appLocalization.get('applications.content.moveCategory.errors.onlySiblingsMoveAllowed')
        });
      } else {
        this.openBulkActionWindow('moveCategories', 586, 600);
      }
    } else {
      this._logger.info('no categories were selected, abort action');
    }
  }

  private hasEditWarnings(): boolean {
    const editWarningsExists: boolean =
      // Find one of the selected categories that has '__EditWarning' in its 'tags' property
      !!this.selectedCategories.find(obj => {
          return (obj.tags && obj.tags.indexOf('__EditWarning') > -1);
        });

    return editWarningsExists;
  }


  private executeService(selectedCategories: VidiunCategory[],
                         service: CategoriesBulkActionBaseService<any>,
                         data: any = {},
                         reloadCategories: boolean = true,
                         confirmChunks: boolean = true,
                         callback?: Function): void {
    this._bulkAction = '';

    const execute = () => {
      service.execute(selectedCategories, data)
        .pipe(tag('block-shell'))
        .subscribe(
        result => {
          if (callback) {
            callback(result);
          }
          this.onBulkChange.emit({ reload: reloadCategories });
        },
        error => {
          this._browserService.alert({
              header: this._appLocalization.get('app.common.attention'),
              message: error.message || this._appLocalization.get('applications.content.bulkActions.errorCategories')
          });
          this.onBulkChange.emit({ reload: reloadCategories });
        }
      );
    };

    if (confirmChunks && selectedCategories.length > subApplicationsConfig.shared.bulkActionsLimit) {
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.bulkActions.note'),
          message: this._appLocalization.get('applications.content.bulkActions.confirmCategories', { '0': this.selectedCategories.length }),
          accept: () => {
            execute();
          }
        }
      );
    } else {
      execute();
    }
  }

}
