import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Menu, MenuItem } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { KalturaConversionProfileWithAsset } from '../transcoding-profiles-store/base-transcoding-profiles-store.service';

@Component({
  selector: 'k-transcoding-profiles-table',
  templateUrl: './transcoding-profiles-table.component.html',
  styleUrls: ['./transcoding-profiles-table.component.scss']
})
export class TranscodingProfilesTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() set profiles(data: KalturaConversionProfileWithAsset[]) {
    if (!this._deferredLoading) {
      this._profiles = [];
      this._cdRef.detectChanges();
      this._profiles = data;
      this._cdRef.detectChanges();
    } else {
      this._deferredProfiles = data;
    }
  }

  @Input() selectedProfiles: KalturaConversionProfileWithAsset[] = [];

  @Output() selectedProfilesChange = new EventEmitter<KalturaConversionProfileWithAsset[]>();
  @Output() actionSelected = new EventEmitter<{ action: string, profile: KalturaConversionProfileWithAsset }>();

  @ViewChild('actionsmenu') private _actionsMenu: Menu;

  public _profiles = [];
  public _emptyMessage = '';
  public _items: MenuItem[];
  public _deferredLoading = true;
  public _deferredProfiles = [];
  public _actionsMenuProfileId: number;
  public rowTrackBy: Function = (index: number, item: any) => item.id;

  constructor(private _appLocalization: AppLocalization,
              private _cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this._emptyMessage = this._appLocalization.get('applications.content.table.noResults');
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid.
      // This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(() => {
        this._deferredLoading = false;
        this._profiles = this._deferredProfiles;
        this._deferredProfiles = null;
      }, 0);
    }
  }

  ngOnDestroy() {
    this._actionsMenu.hide();
  }

  private _buildMenu(profile: KalturaConversionProfileWithAsset): void {
    this._items = [
      {
        label: this._appLocalization.get('applications.settings.transcoding.setAsDefault'),
        command: () => this._onActionSelected('setAsDefault', profile)
      },
      {
        label: this._appLocalization.get('applications.settings.transcoding.edit'),
        command: () => this._onActionSelected('edit', profile)
      },
      {
        label: this._appLocalization.get('applications.settings.transcoding.delete'),
        styleClass: 'kTranscodingProfileDeleteAction',
        command: () => this._onActionSelected('delete', profile)
      }
    ];
  }

  public _openActionsMenu(event: any, profile: KalturaConversionProfileWithAsset): void {
    if (this._actionsMenu) {
      this._actionsMenu.toggle(event);
      if (this._actionsMenuProfileId !== profile.id) {
        this._buildMenu(profile);
        this._actionsMenuProfileId = profile.id;
        this._actionsMenu.show(event);
      }
    }
  }

  public _onActionSelected(action: string, profile: KalturaConversionProfileWithAsset): void {
    this.actionSelected.emit({ action, profile });
  }

  public _onSelectionChange(event): void {
    this.selectedProfilesChange.emit(event);
  }

}
