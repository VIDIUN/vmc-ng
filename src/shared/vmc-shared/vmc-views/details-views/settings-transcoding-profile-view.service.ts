import { Injectable } from '@angular/core';
import { VMCPermissionsService } from '../../vmc-permissions';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { DetailsViewMetadata, VmcDetailsViewBaseService } from 'app-shared/vmc-shared/vmc-views/vmc-details-view-base.service';
import { BrowserService } from 'app-shared/vmc-shell/providers/browser.service';
import { VidiunConversionProfile } from 'vidiun-ngx-client';
import { VidiunConversionProfileAssetParams } from 'vidiun-ngx-client';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { Title } from '@angular/platform-browser';
import { ContextualHelpService } from 'app-shared/vmc-shared/contextual-help/contextual-help.service';

export interface VidiunConversionProfileWithAsset extends VidiunConversionProfile {
    assets?: VidiunConversionProfileAssetParams[];
}

export enum SettingsTranscodingProfileViewSections {
    Metadata = 'Metadata',
    Flavors = 'Flavors',
    ResolveFromActivatedRoute = 'ResolveFromActivatedRoute'
}

export interface SettingsTranscodingProfileViewArgs {
    profile: VidiunConversionProfileWithAsset;
    section: SettingsTranscodingProfileViewSections;
    activatedRoute?: ActivatedRoute;
}


@Injectable()
export class SettingsTranscodingProfileViewService extends VmcDetailsViewBaseService<SettingsTranscodingProfileViewArgs> {

    constructor(private _appPermissions: VMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _router: Router,
                _browserService: BrowserService,
                _logger: VidiunLogger,
                _titleService: Title,
                _contextualHelpService: ContextualHelpService) {
        super(_logger.subLogger('SettingsTranscodingProfileViewService'), _browserService, _titleService, _contextualHelpService);
    }

    getViewMetadata(args: SettingsTranscodingProfileViewArgs): DetailsViewMetadata {
        const mainTitle = this._appLocalization.get('app.titles.settingsTranscodingPageTitle');
        const profileId = args.profile.id;
        const section = args.section === SettingsTranscodingProfileViewSections.ResolveFromActivatedRoute ? this._getSectionFromActivatedRoute(args.activatedRoute) : args.section;
        const sectionTitle = this._appLocalization.get(`applications.settings.transcoding.sections.${section.toLowerCase()}`);
        return {
            title: `${mainTitle} > ${profileId} > ${sectionTitle}`,
            viewKey: `settings-transcoding-profile-${section.toLowerCase()}`
        };
    }

    isAvailable(args: SettingsTranscodingProfileViewArgs): boolean {
        const section = args.section === SettingsTranscodingProfileViewSections.ResolveFromActivatedRoute ? this._getSectionFromActivatedRoute(args.activatedRoute) : args.section;
        this._logger.info(`handle isAvailable action by user`, { profileId: args.profile.id, section });
        return this._isSectionEnabled(section, args.profile);
    }

    private _getSectionFromActivatedRoute(activatedRoute: ActivatedRoute): SettingsTranscodingProfileViewSections {
        let result = null;

        if (activatedRoute) {
            try {
                const sectionToken = activatedRoute.snapshot.firstChild.url[0].path;
                switch (sectionToken) {
                    case 'flavors':
                        result = SettingsTranscodingProfileViewSections.Flavors;
                        break;
                    case 'metadata':
                        result = SettingsTranscodingProfileViewSections.Metadata;
                        break;
                    default:
                        break;
                }

                this._logger.debug(`sectionToken mapped to section`, { section: result, sectionToken });
            } catch (e) {
                this._logger.error(`failed to resolve section from activated route`);
            }
        }

        return result;
    }

    private _getSectionRouteToken(section?: SettingsTranscodingProfileViewSections): string {
        let result;

        switch (section) {
            case SettingsTranscodingProfileViewSections.Flavors:
                result = 'flavors';
                break;
            case SettingsTranscodingProfileViewSections.Metadata:
            default:
                result = 'metadata';
                break;
        }

        this._logger.debug(`section mapped to token`, { section, token: result });

        return result;
    }

    private _isSectionEnabled(section: SettingsTranscodingProfileViewSections, profile: VidiunConversionProfileWithAsset): boolean {
        let result = false;
        switch (section) {
            case SettingsTranscodingProfileViewSections.Flavors:
            case SettingsTranscodingProfileViewSections.Metadata:
                result = true;
                break;
            default:
                break;
        }

        this._logger.debug(`availability result`, { result });

        return result;
    }

    protected _open(args: SettingsTranscodingProfileViewArgs): Observable<boolean> {
        const sectionToken = this._getSectionRouteToken(args.section);
        this._logger.info('handle open transcoding profile view request by the user', { profileId: args.profile.id, sectionToken });
        return Observable.fromPromise(this._router.navigateByUrl(`/settings/transcoding/profile/${args.profile.id}/${sectionToken}`));
    }
}
