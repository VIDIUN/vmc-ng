import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { EntriesListComponent } from 'app-shared/content-shared/entries/entries-list/entries-list.component';
import { EntriesFilters, EntriesStore, SortDirection } from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { EntriesTableColumns } from 'app-shared/content-shared/entries/entries-table/entries-table.component';
import { KalturaPlayableEntryOrderBy } from 'kaltura-ngx-client/api/types/KalturaPlayableEntryOrderBy';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { subApplicationsConfig } from 'config/sub-applications';
import { PlaylistRuleParserService } from './playlist-rule-parser.service';
import { BrowserService } from 'app-shared/kmc-shell';
import { KalturaEntryModerationStatus } from 'kaltura-ngx-client/api/types/KalturaEntryModerationStatus';
import { KalturaEntryStatus } from 'kaltura-ngx-client/api/types/KalturaEntryStatus';
import { PlaylistRule } from './playlist-rule.interface';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui/area-blocker/area-blocker-message';

@Component({
  selector: 'kPlaylistRule',
  templateUrl: './playlist-rule.component.html',
  styleUrls: ['./playlist-rule.component.scss'],
  providers: [PlaylistRuleParserService]
})
export class PlaylistRuleComponent implements OnInit {
  @Input() rule: PlaylistRule;

  @ViewChild(EntriesListComponent) public _entriesList: EntriesListComponent;

  @Output() onClosePopupWidget = new EventEmitter<void>();
  @Output() onSaveRule = new EventEmitter<PlaylistRule>();

  public _blockerMessage: AreaBlockerMessage;
  public _title: string;
  public _saveBtnLabel: string;
  public _nameRequiredError = false;
  public _enforcedFilters: Partial<EntriesFilters> = {
    'moderationStatuses': [
      KalturaEntryModerationStatus.pendingModeration.toString(),
      KalturaEntryModerationStatus.approved.toString(),
      KalturaEntryModerationStatus.flaggedForReview.toString(),
      KalturaEntryModerationStatus.autoApproved.toString()
    ],
    'ingestionStatuses': [
      KalturaEntryStatus.preconvert.toString(),
      KalturaEntryStatus.ready.toString()
    ],
    'accessControlProfiles': [],
    'timeScheduling': []
  };

  public _columns: EntriesTableColumns = {
    thumbnailUrl: { width: '100px' },
    name: {},
    id: { width: '100px' },
    mediaType: { width: '80px', align: 'center' },
    createdAt: { width: '140px' },
    duration: { width: '104px' },
    plays: { width: '100px' }
  };

  public _orderByOptions = [
    {
      value: KalturaPlayableEntryOrderBy.playsDesc,
      label: this._appLocalization.get('applications.content.playlistDetails.content.orderBy.mostPlayed')
    },
    {
      value: KalturaPlayableEntryOrderBy.recentDesc,
      label: this._appLocalization.get('applications.content.playlistDetails.content.orderBy.mostRecent')
    },
    {
      value: KalturaPlayableEntryOrderBy.rankDesc,
      label: this._appLocalization.get('applications.content.playlistDetails.content.orderBy.highestRated')
    },
    {
      value: KalturaPlayableEntryOrderBy.nameAsc,
      label: this._appLocalization.get('applications.content.playlistDetails.content.orderBy.entryName')
    }
  ];

  public _resultsLimit = subApplicationsConfig.modules.contentPlaylists.ruleBasedTotalResults;
  public _ruleName = '';
  public _orderBy = KalturaPlayableEntryOrderBy.playsDesc; // default

  constructor(public _entriesStore: EntriesStore,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization,
              private _playlistRuleParser: PlaylistRuleParserService) {
    this._entriesStore.paginationCacheToken = 'entries-list';
  }

  ngOnInit() {
    this._prepare();
  }

  private _prepare(): void {
    if (this.rule) {
      this._resultsLimit = this.rule.limit;
      this._ruleName = this.rule.name;
      this._orderBy = this.rule.orderBy;

      this._title = this._appLocalization.get('applications.content.playlists.updateRule');
      this._saveBtnLabel = this._appLocalization.get('applications.content.playlists.save');
      this._applyFilters(this.rule);
    } else {
      this._title = this._appLocalization.get('applications.content.playlists.addRule');
      this._saveBtnLabel = this._appLocalization.get('applications.content.playlists.addToPlaylist');

      this._entriesStore.resetFilters();
    }
  }

  private _applyFilters(playlist: PlaylistRule): void {
    this._playlistRuleParser.toEntriesFilters(playlist)
      .filter(Boolean)
      .subscribe(
        filters => {
          this._entriesStore.filter(filters);
        },
        error => {
          this._blockerMessage = this._createErrorMessage(error.message, () => this._applyFilters(playlist));
        });
  }

  private _createErrorMessage(message: string, retryFn: Function): AreaBlockerMessage {
    return new AreaBlockerMessage({
      message,
      buttons: [
        {
          label: this._appLocalization.get('app.common.retry'),
          action: () => {
            this._blockerMessage = null;
            retryFn();
          }
        },
        {
          label: this._appLocalization.get('app.common.ok'),
          action: () => {
            this._blockerMessage = null;
          }
        },
      ]
    });
  }

  public _save(): void {
    const ruleName = (this._ruleName || '').trim();

    if (ruleName) {
      this._playlistRuleParser.toPlaylistRule({
        name: ruleName,
        limit: this._resultsLimit,
        orderBy: this._orderBy,
        rule: this.rule
      }).subscribe(
        updatedRule => {
          this.onSaveRule.emit(updatedRule);
          this.onClosePopupWidget.emit();
        },
        error => {
          this._blockerMessage = this._createErrorMessage(error.message, () => this._save());
        });
    } else {
      this._nameRequiredError = true;
      this._browserService.alert({
        header: this._appLocalization.get('applications.content.playlistDetails.errors.invalidInput'),
        message: this._appLocalization.get('applications.content.playlistDetails.errors.nameRequired')
      });
    }
  }

  public _onOrderByChange(): void {
    const orderBy = this._orderBy.toString();
    const sortDirection = orderBy.charAt(0) === '-' ? SortDirection.Desc : SortDirection.Asc;
    const sortBy = orderBy.substring(1);

    this._entriesStore.filter({ sortBy, sortDirection });
  }

  public _applyResultsLimit(): void {
    this._entriesStore.filter({ limits: this._resultsLimit });
  }
}
