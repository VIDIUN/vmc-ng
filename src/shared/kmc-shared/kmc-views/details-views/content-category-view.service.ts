import { Injectable } from '@angular/core';
import { VMCPermissions, VMCPermissionsService } from '../../vmc-permissions';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { DetailsViewMetadata, VmcDetailsViewBaseService } from 'app-shared/vmc-shared/vmc-views/vmc-details-view-base.service';
import { BrowserService } from 'app-shared/vmc-shell/providers/browser.service';
import { VidiunCategory } from 'vidiun-ngx-client';
import { modulesConfig } from 'config/modules';
import { VidiunClient } from 'vidiun-ngx-client';
import { CategoryGetAction } from 'vidiun-ngx-client';
import { VidiunResponseProfileType } from 'vidiun-ngx-client';
import { VidiunDetachedResponseProfile } from 'vidiun-ngx-client';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { Title } from '@angular/platform-browser';
import { ContextualHelpService } from 'app-shared/vmc-shared/contextual-help/contextual-help.service';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

export enum ContentCategoryViewSections {
    Metadata = 'Metadata',
    Entitlements = 'Entitlements',
    SubCategories = 'SubCategories',
    ResolveFromActivatedRoute = 'ResolveFromActivatedRoute'
}

export interface ContentCategoryViewArgs {
    category: VidiunCategory;
    section: ContentCategoryViewSections;
    activatedRoute?: ActivatedRoute;
    ignoreWarningTag?: boolean;
}

@Injectable()
export class ContentCategoryViewService extends VmcDetailsViewBaseService<ContentCategoryViewArgs> {

    constructor(private _appPermissions: VMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _vidiunClient: VidiunClient,
                private _router: Router,
                _browserService: BrowserService,
                _title: Title,
                _logger: VidiunLogger,
                _contextualHelpService: ContextualHelpService) {
        super(_logger.subLogger('ContentCategoryViewService'), _browserService, _title, _contextualHelpService);
    }

    getViewMetadata(args: ContentCategoryViewArgs): DetailsViewMetadata {
        const mainTitle = this._appLocalization.get('app.titles.contentCategoriesPageTitle');
        const categoryId = args.category.id;
        const section = args.section === ContentCategoryViewSections.ResolveFromActivatedRoute ? this._getSectionFromActivatedRoute(args.activatedRoute) : args.section;
        const sectionTitle = this._appLocalization.get(`applications.content.categoryDetails.sections.${section.toLowerCase()}`);
        return {
            title: `${mainTitle} > ${categoryId} > ${sectionTitle}`,
            viewKey: `content-category-${section.toLowerCase()}`
        };
    }

    isAvailable(args: ContentCategoryViewArgs): boolean {
        const section = args.section === ContentCategoryViewSections.ResolveFromActivatedRoute ? this._getSectionFromActivatedRoute(args.activatedRoute) : args.section;
        this._logger.info(`handle isAvailable action by user`, { categoryId: args.category.id, resolvedSection: section, sectionByUser: args.section });
        return this._isSectionEnabled(section, args.category);
    }

    private _getSectionFromActivatedRoute(activatedRoute: ActivatedRoute): ContentCategoryViewSections {
        let result = null;

        if (activatedRoute) {
            try {
                const sectionToken = activatedRoute.snapshot.firstChild.url[0].path;
                switch (sectionToken) {
                    case 'subcategories':
                        result = ContentCategoryViewSections.SubCategories;
                        break;
                    case 'entitlements':
                        result = ContentCategoryViewSections.Entitlements;
                        break;
                    case 'metadata':
                        result = ContentCategoryViewSections.Metadata;
                        break;
                    default:
                        break;
                }

                this._logger.debug(`resolve section from activated route`, {section: result, sectionToken});
            } catch (e) {
                this._logger.error(`failed to resolve section from activated route`);
            }
        }

        return result;
    }

    private _getSectionRouteToken(section?: ContentCategoryViewSections): string {
        let result;

        switch (section) {
            case ContentCategoryViewSections.SubCategories:
                result = 'subcategories';
                break;
            case ContentCategoryViewSections.Entitlements:
                result = 'entitlements';
                break;
            case ContentCategoryViewSections.Metadata:
            default:
                result = 'metadata';
                break;
        }

        this._logger.debug(`section mapped to token`, { section, token: result });

        return result;
    }

    private _isSectionEnabled(section: ContentCategoryViewSections, category: VidiunCategory): boolean {
        if (!section) {
            this._logger.debug('missing target section, reject request');
            return false;
        }

        const availableByData = this._isAvailableByData(section, category);
        const availableByPermission = this._isAvailableByPermission(section);

        this._logger.debug('check if section is enabled', { availableByData, availableByPermission });
        return availableByData && availableByPermission;
    }

    private _isAvailableByData(section: ContentCategoryViewSections, category: VidiunCategory): boolean {
        this._logger.debug(`check section availability by data for category`, { categoryId: category.id, section });
        let result = false;
        switch (section) {
            case ContentCategoryViewSections.Metadata:
                result = true;
                break;
            case ContentCategoryViewSections.Entitlements:
                result = category.privacyContexts && typeof(category.privacyContexts) !== 'undefined';
                break;
            case ContentCategoryViewSections.SubCategories:
                result = category.directSubCategoriesCount > 0 &&
                    category.directSubCategoriesCount <= modulesConfig.contentShared.categories.subCategoriesLimit;
                break;
            default:
                break;
        }

        this._logger.debug(`availability by data result`, { result });

        return result;
    }

    private _isAvailableByPermission(section: ContentCategoryViewSections): boolean {
        this._logger.debug(`check section availability by permissions`, { section });
        let result = false;
        switch (section) {
            case ContentCategoryViewSections.Entitlements:
                result = this._appPermissions.hasPermission(VMCPermissions.FEATURE_ENTITLEMENT);
                break;
            case ContentCategoryViewSections.SubCategories:
                result = true;
                break;
            case ContentCategoryViewSections.Metadata:
                // metadata section is always available to the user.
                // if you need to change this you will need to resolve at runtime
                // the default section to open
                result = true;
                break;
            default:
                break;
        }

        this._logger.debug(`availability by permission result`, { result });

        return result;
    }


    protected _open(args: ContentCategoryViewArgs): Observable<boolean> {
        this._logger.info('handle open category view request by the user', { categoryId: args.category.id });
        const navigate = (): Observable<boolean> => {
            const sectionToken = this._getSectionRouteToken(args.section);
            return Observable.fromPromise(this._router.navigateByUrl(`/content/categories/category/${args.category.id}/${sectionToken}`));
    };
        // show category edit warning if needed
        if (!args.ignoreWarningTag && args.category.tags && args.category.tags.indexOf('__EditWarning') > -1) {
            this._logger.info(`category has '__EditWarning' tag, show confirmation`);
            return Observable.create(observer => {
                this._browserService.confirm(
                    {
                        header: this._appLocalization.get('applications.content.categories.editCategory'),
                        message: this._appLocalization.get('applications.content.categories.editWithEditWarningTags'),
                        accept: () => {
                            this._logger.info(`user confirmed, proceed navigation`);
                            navigate().subscribe(observer);
                        },
                        reject: () => {
                            this._logger.info(`user didn't confirm, abort navigation`);
                            observer.next(false);
                            observer.complete();
                        }
                    }
                );
            });
        } else {
            return navigate();
        }
    }

    public openById(categoryId: number, section: ContentCategoryViewSections): void {
        this._logger.info('handle open category view by id request by the user, load category data', {categoryId});
        const categoryGetAction = new CategoryGetAction({id: categoryId})
            .setRequestOptions({
                responseProfile: new VidiunDetachedResponseProfile({
                    type: VidiunResponseProfileType.includeFields,
                    fields: 'id,tags,privacyContexts,directSubCategoriesCount'
                })
            });

        this._vidiunClient
            .request(categoryGetAction)
            .pipe(tag('block-shell'))
            .subscribe(
                (category) => {
                    this.open({category, section});
                },
                (error) => {
                    this._logger.info(`handle failed request, show alert, abort navigation`);
                    this._browserService.alert({
                        header: this._appLocalization.get('app.common.error'),
                        message: error.message
                    });
                }
            );
    }
}
