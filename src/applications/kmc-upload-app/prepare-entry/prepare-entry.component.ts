import { Component, OnDestroy, ViewChild } from '@angular/core';
import {VidiunMediaType} from 'vidiun-ngx-client';
import {PopupWidgetComponent} from '@vidiun-ng/vidiun-ui';
import {DraftEntry, PrepareEntryService} from './prepare-entry.service';
import {BrowserService} from 'app-shared/vmc-shell';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import { VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions/vmc-permissions.service';
import { VMCPermissions } from 'app-shared/vmc-shared/vmc-permissions';
import { ContentEntryViewSections, ContentEntryViewService } from 'app-shared/vmc-shared/vmc-views/details-views';
import {AppLocalization} from '@vidiun-ng/mc-shared';

@Component({
  selector: 'vPrepareEntry',
  templateUrl: './prepare-entry.component.html',
  styleUrls: ['./prepare-entry.component.scss'],
  providers: [PrepareEntryService]
})
export class PrepareEntryComponent implements OnDestroy {
  public _selectedMediaType: VidiunMediaType;
  @ViewChild('transcodingProfileSelectMenu') transcodingProfileSelectMenu: PopupWidgetComponent;

  constructor(private _prepareEntryService: PrepareEntryService,
              private _permissionsService: VMCPermissionsService,
              private _contentEntryViewService: ContentEntryViewService,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
  }

  ngOnDestroy() {
  }

  public prepareEntry(vidiunMediaType: VidiunMediaType) {
    this._selectedMediaType = vidiunMediaType;
    const transcodingProfileSettingPermission = this._permissionsService.hasPermission(VMCPermissions.FEATURE_DRAFT_ENTRY_CONV_PROF_SELECTION);
    if (transcodingProfileSettingPermission) {
      this.transcodingProfileSelectMenu.open();
    } else {
        this._loadEntry({profileId: null});
    }
  }


  public _loadEntry(selectedProfile: { profileId?: number }) {

    /// passing profileId null will cause to create with default profileId
    this._prepareEntryService.createDraftEntry(this._selectedMediaType, selectedProfile.profileId)
        .pipe(tag('block-shell'))
      .subscribe((draftEntry: DraftEntry) => {
            this._contentEntryViewService.openById(draftEntry.id, ContentEntryViewSections.Metadata, true, true);
        },
        error => {
          this._browserService.alert({
              header: this._appLocalization.get('app.common.error'),
            message: error.message
          });
        });
  }
}
