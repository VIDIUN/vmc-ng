import { Component, OnInit, AfterViewInit, OnDestroy, Input, Output, ViewChild, EventEmitter, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";

import { AppLocalization } from '@vidiun-ng/mc-shared';
import { AreaBlockerMessage } from '@vidiun-ng/vidiun-ui';
import { PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';
import { AppAuthentication, BrowserService } from 'app-shared/vmc-shell';
import { subApplicationsConfig } from 'config/sub-applications';
import { PreviewEmbedService, EmbedConfig } from './preview-and-embed.service';

import { VidiunPlaylist, UiConfListAction } from 'vidiun-ngx-client';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { VidiunUiConfListResponse } from 'vidiun-ngx-client';
import { VidiunUiConf } from 'vidiun-ngx-client';
import { VidiunShortLink } from 'vidiun-ngx-client';
import { VidiunSourceType } from 'vidiun-ngx-client';
import { serverConfig, buildCDNUrl } from 'config/server';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

export type PlayerUIConf = {
    version: number,
    uiConf: VidiunUiConf
}

@Component({
  selector: 'vPreviewEmbedDetails',
  templateUrl: './preview-embed.component.html',
  styleUrls: ['./preview-embed.component.scss'],
  providers: [ PreviewEmbedService ]
})
export class PreviewEmbedDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() closePopup = new EventEmitter();

  @Input() media: VidiunPlaylist | VidiunMediaEntry;

  @ViewChild('previewIframe') previewIframe: ElementRef;

  public _isBusy = false;
  public _blockerMessage: AreaBlockerMessage = null;

  public _players: { label: string, value: PlayerUIConf }[] = [];
  public _playersSortBy: 'name' | 'version' | 'createdAt' | 'updatedAt' = 'updatedAt';
  public _embedTypes: { label: string, value: string }[] = [];

  public _generatedCode = "";
  public _generatedPreviewCode = "";
  public _shortLink = "";
  public _showEmbedParams = true;
  public _showAdvanced = false;
  public _title: string;
  public _embedTypesHelpExists = !!serverConfig.externalLinks.previewAndEmbed && !!serverConfig.externalLinks.previewAndEmbed.embedTypes;
  public _deliveryProtocolsHelpExists = !!serverConfig.externalLinks.previewAndEmbed && !!serverConfig.externalLinks.previewAndEmbed.deliveryProtocols;

  public _previewForm: FormGroup;
  public _selectedPlayerVersion = 2;

  private generator: any;
  private _previewLink = null;

  public get _showEmberCode(): boolean {
    const showForPlaylist = this.media instanceof VidiunPlaylist && this._permissionsService.hasPermission(VMCPermissions.PLAYLIST_EMBED_CODE);
    const showForEntry = this.media instanceof VidiunMediaEntry && this._permissionsService.hasPermission(VMCPermissions.CONTENT_MANAGE_EMBED_CODE);
    return showForEntry || showForPlaylist;
  }

  constructor(private _previewEmbedService: PreviewEmbedService,
              private _appAuthentication: AppAuthentication,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              private _permissionsService: VMCPermissionsService,
              private _fb: FormBuilder) {

  }

  ngOnInit(){
    this._playersSortBy = this._browserService.getFromLocalStorage('previewEmbed.sortBy') || 'updatedAt';
    this.listPlayers();
    this.createForm();
    this.generator = this.getGenerator();
    this._title = this._showEmberCode
      ? this._appLocalization.get('applications.embed.previewShare')
      : this._appLocalization.get('applications.embed.previewInPlayer');
  }

  ngAfterViewInit(){
    this._previewForm.valueChanges.pipe(cancelOnDestroy(this)).subscribe((form) => {
      this._browserService.setInLocalStorage('previewEmbed.embedType', this._previewForm.controls['selectedEmbedType'].value);
      this._browserService.setInLocalStorage('previewEmbed.seo', this._previewForm.controls['seo'].value);
      this._browserService.setInLocalStorage('previewEmbed.secured', this._previewForm.controls['secured'].value);
      if (form && form.selectedPlayer){
          this._selectedPlayerVersion = form.selectedPlayer.version;
      }
      this.setEmbedTypes();
      if (this._selectedPlayerVersion === 2) {
          this._generatedCode = this.generateCode(false);
          this._generatedPreviewCode = this.generateCode(true);
          this.createPreviewLink();
      } else {
          if (this._previewForm.controls['selectedEmbedType'].value === 'thumb'){
              // if coming from a V2 player with thumb embed, change the embed type to dynamic. This will trigger another change that will generate the correct embed code.
              this._previewForm.controls['selectedEmbedType'].setValue('dynamic');
              this._browserService.setInLocalStorage('previewEmbed.embedType', 'dynamic');
          } else {
              this._generatedCode = this.generateV3code(false);
              this._generatedPreviewCode = this.generateV3code(true);
              this.createPreviewLink();
          }
      }
      this.showPreview();
    });
  }

  private listPlayers(){

    const isPlaylist = this.media instanceof VidiunPlaylist;
    this._isBusy = true;
    this._blockerMessage = null;

    this._previewEmbedService.listPlayers(isPlaylist).pipe(cancelOnDestroy(this)).subscribe(
        (res: VidiunUiConfListResponse) => {
          // create players array from returned UICong list. Remove V1 players. Include V3 players (no html5Url, special tag)
          res.objects.filter( (uiConf) => {
              let showPlayer = true;
              if (uiConf.html5Url){
                  showPlayer = uiConf.html5Url.indexOf('html5lib/v1') === -1; // filter out V1 players
              } else {
                  showPlayer = uiConf.tags.indexOf('vidiunPlayerJs') > -1 && this._permissionsService.hasPermission(VMCPermissions.FEATURE_V3_STUDIO_PERMISSION); // show V3 players if user has permissions
              }
              // filter out by tags
              if (uiConf.tags && uiConf.tags.length){
                  const tags = uiConf.tags.split(',');
                  if (tags.indexOf('ott') > -1) {
                      showPlayer = false;
                  }
              }
              return showPlayer;
          }).forEach(uiConf => {
              const version = uiConf.tags.indexOf('vidiunPlayerJs') > -1 ? 3 : 2;
              const playerUIConf: PlayerUIConf = { uiConf, version }
            this._players.push({label: uiConf.name, value: playerUIConf});
          });

          this.sortPlayers(this._playersSortBy);

          // select first player
          if (this._players.length > 0) {
            this._previewForm.patchValue({
              selectedPlayer: this._players[0].value
            });
          }else{
            this._blockerMessage = new AreaBlockerMessage(
                {
                  message: isPlaylist ? this._appLocalization.get("applications.embed.playersErrorPlaylist") : this._appLocalization.get("applications.embed.playersErrorVideo"),
                  buttons: [
                    {
                      label: this._appLocalization.get('app.common.ok'),
                      action: () => {
                        this._blockerMessage = null;
                      }
                    }
                  ]
                }
            );
          }

          this._isBusy = false;
        },
        error => {
          this._isBusy = false;

          this._blockerMessage = new AreaBlockerMessage(
              {
                message: error.message,
                buttons: [
                  {
                    label: this._appLocalization.get('app.common.retry'),
                    action: () => {
                      this.listPlayers();
                    }
                  },
                  {
                    label: this._appLocalization.get('app.common.cancel'),
                    action: () => {
                      this._blockerMessage = null;
                    }
                  }
                ]
              }
          );
        }
    );
  }

  private sortPlayers(sortBy){
    this._players.sort((a,b)=>{
      let val1 = sortBy === 'version' ? a.value.version : a.value.uiConf[sortBy];
      let val2 = sortBy === 'version' ? b.value.version : b.value.uiConf[sortBy];
      if (sortBy === "name" && typeof val1 === "string" && typeof val2 === "string"){
        val1 = val1.toLowerCase();
        val2 = val2.toLowerCase();
      }
      if (val1 < val2)
        return 1;
      if (val1 > val2)
        return -1;
      return 0;
    });
    // refresh dropdown by refrshing the array
    this._players = this._players.slice(0);
  }

  private createForm():void{
    const seo: boolean | null = this._browserService.getFromLocalStorage('previewEmbed.seo');
    const secured: boolean | null = this._browserService.getFromLocalStorage('previewEmbed.secured');
    this._previewForm = this._fb.group({
      selectedPlayer: null,
      selectedEmbedType: this._browserService.getFromLocalStorage('previewEmbed.embedType') || subApplicationsConfig.previewAndEmbedApp.embedType,
      seo: seo !== null ? seo : subApplicationsConfig.previewAndEmbedApp.includeSeoMetadata,
      secured: secured !== null ? secured : subApplicationsConfig.previewAndEmbedApp.secureEmbed
    });
  }

  private setEmbedTypes():void{
    this._embedTypes = [];
    this._embedTypes.push({"label": this._appLocalization.get("applications.embed.embedDynamic"), "value": "dynamic"});
    this._embedTypes.push({"label": this._appLocalization.get("applications.embed.embedIframe"), "value": "iframe"});
    this._embedTypes.push({"label": this._appLocalization.get("applications.embed.embedAuto"), "value": "auto"});
    if (this.media instanceof VidiunMediaEntry && this._selectedPlayerVersion === 2) {
      this._embedTypes.push({"label": this._appLocalization.get("applications.embed.embedThumb"), "value": "thumb"}); // no thumb embed for playlists and v3 players
    }
  }

  /* V3 specific code starts here */

  private generateV3code(isPreview: boolean): string {
      const uiConf = this._previewForm.controls['selectedPlayer'].value.uiConf;
      const embedType = this._previewForm.get('selectedEmbedType').value;
      const vs = this._appAuthentication.appUser.vs;
      let embedConfig: EmbedConfig = {
          embedType,
          vs,
          entryId: this.media.id,
          uiConfId: uiConf.id,
          width: uiConf.width,
          height: uiConf.height,
          pid: this._appAuthentication.appUser.partnerId,
          serverUri: '',
          playerConfig: ''
      }
      let config = '';
      let serverUri = this._previewForm.controls['secured'].value ?  serverConfig.cdnServers.securedServerUri : serverConfig.cdnServers.serverUri;
      if (isPreview){
          // build CDN URL according to current protocol
          serverUri = buildCDNUrl('');
          // pass vs to player for preview only
          if (embedType === 'dynamic'){
              config = `vs: '${vs}',`;
          } else {
              config = `&config[provider]={"vs":"${vs}"}`;
          }
      }
      embedConfig.serverUri = serverUri;
      embedConfig.playerConfig = config;

      return this._previewEmbedService.generateV3EmbedCode(embedConfig);
  }

  /* V3 specific code ends here */

  private getGenerator():any{
    const baseCdnUrl = serverConfig.cdnServers.serverUri.replace("http://","");
    const securedCdnUrl = serverConfig.cdnServers.securedServerUri.replace("https://","");
    // 'vEmbedCodeGenerator' is bundled with the app. Location: assets/js/VidiunEmbedCodeGenerator.min.js
    return new window['vEmbedCodeGenerator']({
      host: baseCdnUrl,
      securedHost: securedCdnUrl,
      partnerId: this._appAuthentication.appUser.partnerId,
      includeVidiunLinks: subApplicationsConfig.previewAndEmbedApp.includeVidiunLinks
    });
  }

  private generateCode(isPreview = false): string{
    this._previewLink = null;
    this._shortLink = "";
    const cacheStr = Math.floor(new Date().getTime() / 1000) + (15 * 60); // start caching in 15 minutes
    const params = {
      protocol: this.getProtocol(isPreview),
      embedType: this._previewForm.controls['selectedEmbedType'].value,
      uiConfId: this._previewForm.controls['selectedPlayer'].value.uiConf.id,
      width: this._previewForm.controls['selectedPlayer'].value.uiConf.width,
      height: this._previewForm.controls['selectedPlayer'].value.uiConf.height,
      entryMeta: this.getMediaMetadata(),
      includeSeoMetadata: this._previewForm.controls['seo'].value,
      playerId: 'vidiun_player_' + cacheStr,
      cacheSt: cacheStr,
      flashVars: this.getEmbedFlashVars(isPreview)
    };
    if (this.media instanceof VidiunMediaEntry){
      params['entryId'] = this.media.id;
    }
    return this.generator.getCode(params);
  }

  private getProtocol(isPreview: boolean){
    // if used for preview player - use host protocol
    if (isPreview){
      return location.protocol.substring(0, location.protocol.length - 1);
    }else{
      return this._previewForm.controls['secured'].value ? 'https' : 'http';
    }
  }

  private getMediaMetadata(): any{
    return {
      "name": this.media.name,
      "description": this.media.description,
      "thumbnailUrl": this.media.thumbnailUrl,
      "duration": this.media.duration,
      "uploadDate": this.media.createdAt.toISOString()
    }
  }

  private getEmbedFlashVars(isPreview: boolean): any{
    let flashVars =  {};
    try {
      if (isPreview) {
        flashVars['vs'] = this._appAuthentication.appUser.vs;
        if (this.media instanceof VidiunMediaEntry) {
          const sourceType = this.media.sourceType.toString();
          const isLive = (sourceType === VidiunSourceType.liveStream.toString() ||
          sourceType === VidiunSourceType.akamaiLive.toString() ||
          sourceType === VidiunSourceType.akamaiUniversalLive.toString() ||
          sourceType === VidiunSourceType.manualLiveStream.toString());
          if (isLive) {
            flashVars['disableEntryRedirect'] = true;
          }
        }
        flashVars['liveAnalytics'] = {
          "plugin": "false",                // prevent loading the liveAnalytics plugin in v2 players
          "relativeTo": "PlayerHolder",     // required to prevent v1 players from getting stuck
          "position": "after",              // required to prevent v1 players from getting stuck
          "loadingPolicy": "onDemand"       // prevent v1 players from trying to load this plugin
        };
        flashVars['vAnalony'] = {
            "plugin": "false",                // prevent loading the vAnalony plugin in v2 players
        };
      }
      if (this.media instanceof VidiunPlaylist) {
        flashVars['playlistAPI.vpl0Id'] = this.media.id;
      }
    } catch (e) {
      console.error("Preview & Embed::Error getting Flashvars: " + e.message);
      flashVars =  {};
    }
    return flashVars;
  }

  private flashVarsToUrl(flashVarsObject: any): string{
      let
          params = '',
          index = 0;
      for( let i in flashVarsObject ){
        var curVal = typeof flashVarsObject[i] == 'object'? JSON.stringify( flashVarsObject[i] ): flashVarsObject[i];

        if (index !== 0) {
            params += '&';
        }

        params+= 'flashvars[' + encodeURIComponent( i ) + ']=' + encodeURIComponent(curVal);

        index++;
      }
      return params;
  }

  private createPreviewLink():void{
      let url = '';
      try {
        url = this.getProtocol(false) + '://' + serverConfig.vidiunServer.uri + '/index.php/extwidget/preview';
        url += '/partner_id/' + this._appAuthentication.appUser.partnerId;
        url += '/uiconf_id/' + this._previewForm.controls['selectedPlayer'].value.uiConf.id;
        if (this.media instanceof VidiunMediaEntry) {
          url += '/entry_id/' + this.media.id;
        }
        url += '/embed/' + this._previewForm.controls['selectedEmbedType'].value;
        if (this._selectedPlayerVersion === 2 ) {
            url += '?' + this.flashVarsToUrl(this.getEmbedFlashVars(false));
        }
        this._previewLink = url;
      } catch (e){
        console.log("could not generate valid URL for short link generation");
      }

      // create short link
      this._previewEmbedService.generateShortLink(url).pipe(cancelOnDestroy(this)).subscribe(
          (res: VidiunShortLink) => {
            this._shortLink = 'http://' + serverConfig.vidiunServer.uri + '/tiny/' + res.id;
          },
          error => {
            console.log("could not generate short link for preview");
          }
      );
  }

  private showPreview(){
    const style = '<style>html, body {margin: 0; padding: 0; width: 100%; height: 100%; } #framePlayerContainer {margin: 0 auto; padding-top: 20px; text-align: center; } object, div { margin: 0 auto; }</style>';
    let newDoc = this.previewIframe.nativeElement.contentDocument;
    newDoc.open();
    newDoc.write('<!doctype html><html><head>' + style + '</head><body><div id="framePlayerContainer">' + this._generatedPreviewCode + '</div></body></html>');
    newDoc.close();
  }

  public copyEmbedCode(el):void{
    this._browserService.copyElementToClipboard(el);
    this._browserService.showGrowlMessage({severity: 'success', detail: this._appLocalization.get('app.common.copySuccess')});
  }

  public toggleEmbedParams():void{
    this._showEmbedParams = !this._showEmbedParams;
  }

  public toggleAdvanced():void{
    this._showAdvanced = !this._showAdvanced;
  }

  public updatePlayersSort(sortBy: string):void{
    this._browserService.setInLocalStorage('previewEmbed.sortBy', sortBy);
    this.sortPlayers(sortBy);
  }

  public openLink(link: 'embedTypes' | 'deliveryProtocols'): void {
    switch (link) {
        case 'embedTypes':
            this._browserService.openLink(serverConfig.externalLinks.previewAndEmbed.embedTypes);
            break;
        case 'deliveryProtocols':
            this._browserService.openLink(serverConfig.externalLinks.previewAndEmbed.deliveryProtocols);
            break;
    }
  }

  public close(): void{
    this.closePopup.emit();
  }

  ngOnDestroy(){}
}
