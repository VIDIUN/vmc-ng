import { CategoriesService } from '../categories/categories.service';
import {Host, Injectable, OnDestroy} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { Observable, Subject, BehaviorSubject, Unsubscribable } from 'rxjs';

import {VidiunClient, VidiunMultiRequest, VidiunObjectBaseFactory} from 'vidiun-ngx-client';
import {VidiunCategory} from 'vidiun-ngx-client';
import {CategoryGetAction} from 'vidiun-ngx-client';
import {CategoryUpdateAction} from 'vidiun-ngx-client';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import {CategoryWidgetsManager} from './category-widgets-manager';
import {OnDataSavingReasons} from '@vidiun-ng/vidiun-ui';
import {BrowserService} from 'app-shared/vmc-shell/providers/browser.service';
import {PageExitVerificationService} from 'app-shared/vmc-shell/page-exit-verification';
import {AppEventsService} from 'app-shared/vmc-shared';
import { CategoriesGraphUpdatedEvent } from 'app-shared/vmc-shared/app-events/categories-graph-updated/categories-graph-updated';
import { CategoriesStatusMonitorService } from 'app-shared/content-shared/categories-status/categories-status-monitor.service';
import { CategoryDeleteAction } from 'vidiun-ngx-client';
import { CategoryListAction } from 'vidiun-ngx-client';
import { VidiunCategoryFilter } from 'vidiun-ngx-client';
import { ContentCategoryViewSections, ContentCategoryViewService } from 'app-shared/vmc-shared/vmc-views/details-views';
import { ContentCategoriesMainViewService } from 'app-shared/vmc-shared/vmc-views';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { modulesConfig } from 'config/modules';

export enum ActionTypes {
  CategoryLoading,
  CategoryLoaded,
  CategoryLoadingFailed,
  CategorySaving,
  CategoryPrepareSavingFailed,
  CategorySavingFailed,
  CategoryDataIsInvalid,
  ActiveSectionBusy
}

export enum NotificationTypes {
    ViewEntered
}

declare interface StatusArgs {
  action: ActionTypes;
  error?: Error;
}

@Injectable()
export class CategoryService implements OnDestroy {
    private _notifications = new Subject<{ type: NotificationTypes, error?: Error }>();
    public notifications$ = this._notifications.asObservable();
    private _loadCategorySubscription: Unsubscribable;
    private _state = new BehaviorSubject<StatusArgs>({action: ActionTypes.CategoryLoading, error: null});

    private _saveCategoryInvoked = false;
    public state$ = this._state.asObservable();
    private _categoryIsDirty: boolean;
    private _pageExitVerificationToken: string;
    private _subcategoriesMoved = false;

    public get categoryIsDirty(): boolean {
        return this._categoryIsDirty;
    }

    private _category: BehaviorSubject<VidiunCategory> = new BehaviorSubject<VidiunCategory>(null);
    public category$ = this._category.asObservable();
    private _categoryId: number;

    public get categoryId(): number {
        return this._categoryId;
    }

    public get category(): VidiunCategory {
        return this._category.getValue();
    }

    public notifyChangesInCategory(): void{
    	this._saveCategoryInvoked = true;
	}
    constructor(private _vidiunServerClient: VidiunClient,
                private _router: Router,
                private _browserService: BrowserService,
                private _categoriesStore: CategoriesService,
                @Host() private _widgetsManager: CategoryWidgetsManager,
                private _categoryRoute: ActivatedRoute,
                private _appLocalization: AppLocalization,
                private _appEvents: AppEventsService,
                private _pageExitVerificationService: PageExitVerificationService,
                appEvents: AppEventsService,
                private _contentCategoryView: ContentCategoryViewService,
                private _contentCategoriesMainViewService: ContentCategoriesMainViewService,
                private _categoriesStatusMonitorService: CategoriesStatusMonitorService,
                private _logger: VidiunLogger) {

        this._logger = _logger.subLogger('CategoryService');

        this._widgetsManager.categoryStore = this;

        this._mapSections();

        this._onSectionsStateChanges();
        this._onRouterEvents();
    }

    private _onSectionsStateChanges() {
        this._widgetsManager.widgetsState$
            .pipe(cancelOnDestroy(this))
            .debounce(() => Observable.timer(500))
            .subscribe(
                sectionsState => {
                    const newDirtyState = Object.keys(sectionsState).reduce((result, sectionName) => result || sectionsState[sectionName].isDirty, false);

                    if (this._categoryIsDirty !== newDirtyState) {
                        console.log(`category store: update category is dirty state to ${newDirtyState}`);
                        this._categoryIsDirty = newDirtyState;
                        this._updatePageExitVerification();
                    }
                }
            );
    }

    private _updatePageExitVerification() {
        if (this._categoryIsDirty) {
            this._pageExitVerificationToken = this._pageExitVerificationService.add();
        } else {
        	if (this._pageExitVerificationToken) {
                this._pageExitVerificationService.remove(this._pageExitVerificationToken);
            }
            this._pageExitVerificationToken = null;
        }
    }

    ngOnDestroy() {
        this._loadCategorySubscription && this._loadCategorySubscription.unsubscribe();
        this._state.complete();
        this._category.complete();

        if (this._pageExitVerificationToken) {
            this._pageExitVerificationService.remove(this._pageExitVerificationToken);
        }

        if (this._saveCategoryInvoked) {
            this._categoriesStore.reload();
        }
    }

    private _mapSections(): void {
        if (!this._categoryRoute || !this._categoryRoute.snapshot.data.categoryRoute) {
            throw new Error('this service can be injected from component that is associated to the category route');
        }
    }


	private _onRouterEvents(): void {
		this._router.events
			.pipe(cancelOnDestroy(this))
			.filter(
			event => event instanceof NavigationEnd)
.subscribe(
                event => {
					// we must defer the loadCategory to the next event cycle loop to allow components
					// to init them-selves when entering this module directly.
					setTimeout(() => {
						const currentCategoryId = this._categoryRoute.snapshot.params.id;
                        const category = this._category.getValue();
                        if (!category || (category && category.id.toString() !== currentCategoryId)) {
                          this._loadCategory(currentCategoryId);
                        } else {
                            this._notifications.next({ type: NotificationTypes.ViewEntered });
                        }
					});
				});
			}

  private _checkReferenceId(newCategory: VidiunCategory): Observable<boolean> {
    if (!newCategory.referenceId ||
		((newCategory.referenceId || null) === (this.category.referenceId || null))
	) {
      return Observable.of(true);
    }

    return Observable.create(observer => {
      this._vidiunServerClient
        .request(new CategoryListAction({
          filter: new VidiunCategoryFilter({ referenceIdEqual: newCategory.referenceId })
        }))
        .subscribe(
          response => {
            if (Array.isArray(response.objects) && response.objects.length) {
              const message = this._appLocalization.get(
                'applications.content.categoryDetails.referenceIdInUse',
                [
                  newCategory.referenceId,
                  response.objects.map(({ fullName, id }) => `- ${fullName} (ID:${id})`).join('\n')
                ]
              );
              this._browserService.confirm({
                message,
                accept: () => {
                  observer.next(true);
                  observer.complete();
                },
                reject: () => {
                  observer.next(false);
                  observer.complete();
                }
              })
            } else {
              observer.next(true);
              observer.complete();
            }
          },
          error => {
            this._state.next({ action: ActionTypes.CategoryPrepareSavingFailed });
            observer.next(false);
          });
    });
  }

    private _shouldRedirectToMetadata(category: VidiunCategory): boolean {
        return (!category.directSubCategoriesCount || category.directSubCategoriesCount > modulesConfig.contentShared.categories.subCategoriesLimit)
          && this._categoryRoute.snapshot.firstChild.url[0].path === 'subcategories';
    }

	private _transmitSaveRequest(newCategory: VidiunCategory) {
		this._state.next({ action: ActionTypes.CategorySaving });

		const request = new VidiunMultiRequest(
			new CategoryUpdateAction({
				id: this.categoryId,
				category: newCategory
			})
		);



		this._widgetsManager.notifyDataSaving(newCategory, request, this.category)
			.pipe(cancelOnDestroy(this))
      .pipe(tag('block-shell'))
			.flatMap(
			(response) => {
				if (response.ready) {
					this._saveCategoryInvoked = true;

                    const userModifiedName = this.category.name !== newCategory.name;

					return this._checkReferenceId(newCategory)
            .switchMap(proceedSaveRequest => {
              if (proceedSaveRequest) {
                return this._vidiunServerClient.multiRequest(request)
                  .pipe(tag('block-shell'))
                  .map(
                    categorySavedResponse => {

                      if (userModifiedName || this._subcategoriesMoved) {
                          this._subcategoriesMoved = false;
                        this._appEvents.publish(new CategoriesGraphUpdatedEvent());
                      }


                      // if categories were deleted during the save operation (sub-categories window) - invoke immediate polling of categories status
                      const deletedCategories = request.requests.find((req, index) => {
                        return (req instanceof CategoryDeleteAction && !categorySavedResponse[index].error)
                      });
                      if (deletedCategories) {
                        this._categoriesStatusMonitorService.updateCategoriesStatus();
                      }

                      if (categorySavedResponse.hasErrors()) {
                        this._state.next({ action: ActionTypes.CategorySavingFailed });
                      } else {
                        this._loadCategory(this.categoryId);
                      }

                      return Observable.empty();
                    }
                  )
              } else {
                return Observable.empty();
              }
            });
				}
				else {
					switch (response.reason) {
						case OnDataSavingReasons.validationErrors:
							this._state.next({ action: ActionTypes.CategoryDataIsInvalid });
							break;
						case OnDataSavingReasons.attachedWidgetBusy:
							this._state.next({ action: ActionTypes.ActiveSectionBusy });
							break;
						case OnDataSavingReasons.buildRequestFailure:
							this._state.next({ action: ActionTypes.CategoryPrepareSavingFailed });
							break;
					}

					return Observable.empty();
				}
			}
			)
			.subscribe(
			response => {
				// do nothing - the service state is modified inside the map functions.
			},
			error => {
				// should not reach-frame here, this is a fallback plan.
				this._state.next({ action: ActionTypes.CategorySavingFailed });
			}
			);
	}
	public saveCategory(): void {

		const newCategory = VidiunObjectBaseFactory.createObject(this.category);

		if (newCategory && newCategory instanceof VidiunCategory) {
			this._transmitSaveRequest(newCategory)
		} else {
			console.error(new Error(`Failed to create a new instance of the category type '${this.category ? typeof this.category : 'n/a'}`));
			this._state.next({ action: ActionTypes.CategoryPrepareSavingFailed });
		}
	}

	public reloadCategory(): void {
		if (this.categoryId) {
		    this._logger.info(`handle reload category action by user`, { categoryId: this.categoryId });
			this._loadCategory(this.categoryId);
		}
	}

	private _loadCategory(id: number): void {
        const categoryLoadedHandler = (category) => {
            this._category.next(category);
            this._notifications.next({ type: NotificationTypes.ViewEntered });

            if (this._contentCategoryView.isAvailable({
                category,
                activatedRoute: this._categoryRoute,
                section: ContentCategoryViewSections.ResolveFromActivatedRoute
            })) {
                this._loadCategorySubscription = null;

                const dataLoadedResult = this._widgetsManager.notifyDataLoaded(category, { isNewData: false });

                if (dataLoadedResult.errors.length) {
                    this._state.next({
                        action: ActionTypes.CategoryLoadingFailed,
                        error: new Error(`one of the widgets failed while handling data loaded event`)
                    });
                } else {
                    this._state.next({ action: ActionTypes.CategoryLoaded });
                }
            }
        };

		if (this._loadCategorySubscription) {
			this._loadCategorySubscription.unsubscribe();
			this._loadCategorySubscription = null;
		}

		this._categoryId = id;
		this._categoryIsDirty = false;
		this._updatePageExitVerification();
        this._subcategoriesMoved = false;

		this._state.next({ action: ActionTypes.CategoryLoading });
		this._widgetsManager.notifyDataLoading(id);

		this._logger.info(`handle load category request`, { id });

		if (!id) {
		    this._logger.info(`no id was provided abort loading`);
      return this._state.next({action: ActionTypes.CategoryLoadingFailed, error: new Error('Missing categoryId')});
    }this._loadCategorySubscription = this._vidiunServerClient
      .request(new CategoryGetAction({id}))
			.pipe(cancelOnDestroy(this))
			.subscribe(category => {
                this._logger.info(`handle successful loading of category data`);
                if (this._shouldRedirectToMetadata(category)) {
                    this._logger.info(`category children were removed redirect to metadata section`);
                    this._contentCategoryView
                        .open$({ category, section: ContentCategoryViewSections.Metadata })
                        .subscribe(result => {
                            if (result) {
                                categoryLoadedHandler(category);
                            } else {
                                this._browserService.handleUnpermittedAction(true);
                            }
                        });
                } else {
                    categoryLoadedHandler(category);
                }
            },
			error => {
                this._logger.warn(`handle failed loading of category data`, { errorMessage: error.message });
				this._loadCategorySubscription = null;this._state.next({ action: ActionTypes.CategoryLoadingFailed, error });
}
			);

	}

	public openSection(section: ContentCategoryViewSections): void {
        this._logger.info(`handle open section action by user`, { section, categoryId: this.categoryId });
		this._contentCategoryView.open({ section, category: this.category, ignoreWarningTag: true });
	}

	public canLeaveWithoutSaving(): Observable<{ allowed: boolean }> {
		return Observable.create(observer => {
			if (this._categoryIsDirty) {
				this._browserService.confirm(
					{
						header: this._appLocalization.get('applications.content.categoryDetails.cancelEdit'),
						message: this._appLocalization.get('applications.content.categoryDetails.discard'),
						accept: () => {
                            this._subcategoriesMoved = false;
                            this._categoryIsDirty = false;
							observer.next({ allowed: true });
							observer.complete();
						},
						reject: () => {
							observer.next({ allowed: false });
							observer.complete();
						}
					}
				)
			} else {
				observer.next({ allowed: true });
				observer.complete();
			}
		});
	}

    public openCategory(category: VidiunCategory | number) {
        const categoryId = category instanceof VidiunCategory ? category.id : category;

        this._logger.info(`handle open category action`, { categoryId });

        if (this.categoryId !== categoryId) {
            this.canLeaveWithoutSaving()
                .filter(({ allowed }) => allowed)
                .pipe(cancelOnDestroy(this))
                .subscribe(() => {
                    if (category instanceof VidiunCategory) {
                        this._contentCategoryView.open({ category, section: ContentCategoryViewSections.Metadata });
                    } else {
                        this._contentCategoryView.openById(category, ContentCategoryViewSections.Metadata);
                    }
                });
        }
    }

	public returnToCategories(force = false) {
        this._logger.info(`handle return to categories list`, { updatePageExitVerification: force });

    	if (force)
	    {
		    this._categoryIsDirty = false;
		    this._updatePageExitVerification();
	    }

        this._contentCategoriesMainViewService.open();
	}

    public notifySubcategoriesMoved(): void {
        this._subcategoriesMoved = true;
    }
}

