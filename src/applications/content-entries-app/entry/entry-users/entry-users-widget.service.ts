import { Injectable, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs';
import {
    VidiunClient,
    VidiunFilterPager,
    VidiunMediaEntry,
    VidiunMultiRequest,
    VidiunMultiResponse,
    VidiunResponse,
    VidiunUser,
    VidiunUserFilter,
    UserGetAction,
    UserListAction
} from 'vidiun-ngx-client';

import 'rxjs/add/observable/forkJoin';
import { EntryWidget } from '../entry-widget';
import { async } from 'rxjs/scheduler/async';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { ContentEntryViewSections } from 'app-shared/vmc-shared/vmc-views/details-views/content-entry-view.service';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { cancelOnDestroy } from '@vidiun-ng/vidiun-common';

@Injectable()
export class EntryUsersWidget extends EntryWidget implements OnDestroy
{

    public _creator: string = "";
	public _owner: VidiunUser = null;

	public usersForm : FormGroup;

	constructor(private _formBuilder: FormBuilder,
              private _vidiunServerClient: VidiunClient,
              private _permissionsService: VMCPermissionsService,
                logger: VidiunLogger)
    {
        super(ContentEntryViewSections.Users, logger);
	    this._buildForm();
    }
	private _buildForm() : void{
		this.usersForm = this._formBuilder.group({
			owners : null,
			editors: [],
			publishers: [],
			viewers: [],
		});

		Observable.merge(this.usersForm.valueChanges,
			this.usersForm.statusChanges)
            .observeOn(async) // using async scheduler so the form group status/dirty mode will be synchornized
            .pipe(cancelOnDestroy(this))
            .subscribe(
				() => {
					super.updateState({
						isValid: this.usersForm.status !== 'INVALID',
						isDirty: this.usersForm.dirty
					});
				}
			);
	}

	protected onDataSaving(data: VidiunMediaEntry, request: VidiunMultiRequest){
		if (this.usersForm.dirty){
			// save owner
			if (this._owner && this._owner.id) {
				data.userId = this._owner.id;
			}
			// save editors
			const editors: VidiunUser[] = this.usersForm.value.editors;

			if (editors && editors.length){
				let entitledUsersEdit = '';
				editors.forEach(editor => {
					entitledUsersEdit += editor.id + ",";
				});
				entitledUsersEdit = entitledUsersEdit.substring(0, entitledUsersEdit.length-1); // remove last comma
				data.entitledUsersEdit = entitledUsersEdit;
			}else{
				data.entitledUsersEdit = null;
			}
			// save publishers
			const publishers: VidiunUser[] = this.usersForm.value.publishers;
			if (publishers && publishers.length){
				let entitledUsersPublish = '';
				publishers.forEach(publisher => {
					entitledUsersPublish += publisher.id + ",";
				});
				entitledUsersPublish = entitledUsersPublish.substring(0, entitledUsersPublish.length-1); // remove last comma
				data.entitledUsersPublish = entitledUsersPublish;
			}else{
				data.entitledUsersPublish = null;
			}

            // save viewers
            const viewers: VidiunUser[] = this.usersForm.value.viewers;
            if (viewers && viewers.length) {
                data.entitledUsersView = viewers.map(({ id }) => id).join(',');
            } else {
                data.entitledUsersView = null;
            }
		}
	}
    /**
     * Do some cleanups if needed once the section is removed
     */
    protected onReset()
    {
	    this._creator = "";
	    this._owner = null;
	    this.usersForm.reset({
		    owners: [],
		    editors: [],
		    publishers: []
	    });
    }

    protected onActivate(firstTimeActivating: boolean) {

	    super._showLoader();

	    let actions : Observable<void>[] = [];

	    if (!this._permissionsService.hasPermission(VMCPermissions.CONTENT_MANAGE_ENTRY_USERS)) {
        this.usersForm.disable({ emitEvent: false });
      }

        if (!this.data.creatorId && !this.data.userId) {
            this._creator = '';
            this._owner = new VidiunUser({ screenName: '' });
        } else {
            const getUserActions = [];
            // if creatorId and userId is the same make single call to reduce number of calls
            if (this.data.creatorId && this.data.userId && this.data.creatorId === this.data.userId) {
                getUserActions.push(new UserGetAction({ userId: this.data.creatorId }));
            } else { // otherwise call for each user separately
                if (this.data.creatorId) {
                    getUserActions.push(new UserGetAction({ userId: this.data.creatorId }));
                }

                if (this.data.userId) {
                    getUserActions.push(new UserGetAction({ userId: this.data.userId }));
                }
            }

            const fetchUsersData$ = this._vidiunServerClient.multiRequest(new VidiunMultiRequest(...getUserActions))
                .pipe(cancelOnDestroy(this, this.widgetReset$))
                .map((responses: VidiunMultiResponse) => {
                    if (responses.hasErrors()) {
                        this._creator = this.data.creatorId;
                        this._owner = new VidiunUser({ screenName: this.data.userId });
                    } else {
                        const creatorResponse = responses.find((item: VidiunResponse<VidiunUser>) => item.result.id === this.data.creatorId);
                        const ownerResponse = responses.find((item: VidiunResponse<VidiunUser>) => item.result.id === this.data.userId);

                        this._creator = creatorResponse
                            ? (creatorResponse.result.screenName ? creatorResponse.result.screenName : creatorResponse.result.id)
                            : this.data.creatorId;

                        this._owner = ownerResponse ? ownerResponse.result : new VidiunUser({ screenName: this.data.userId });
                    }

                    return undefined;
                });
            actions.push(fetchUsersData$);
        }

	    if (this.data.entitledUsersEdit && this.data.entitledUsersEdit.length) {
		    const entitledUsersEdit = this.data.entitledUsersEdit.split(",");
		    const request = new VidiunMultiRequest();
		    entitledUsersEdit.forEach(entitledUser=>{
			    request.requests.push(new UserGetAction({userId: entitledUser}));
		    });

		    const fetchEditorsData$ = this._vidiunServerClient.multiRequest(request)
			    .pipe(cancelOnDestroy(this, this.widgetReset$))
                .map(
                    responses => {
                        const editors = responses.map((response, index) => {
                            if (response.error) {
                                const userId = entitledUsersEdit[index];
                                return new VidiunUser({ id: userId, screenName: userId });
                            }
                            return response.result;
                        });
                        this.usersForm.patchValue({ editors });
                        return undefined;
                    }
                );

		    actions.push(fetchEditorsData$);
	    }

	    if (this.data.entitledUsersPublish && this.data.entitledUsersPublish.length) {
		    const entitledUsersPublish = this.data.entitledUsersPublish.split(",");
		    const request = new VidiunMultiRequest();
		    entitledUsersPublish.forEach(entitledUser=>{
			    request.requests.push(new UserGetAction({userId: entitledUser}));
		    });

		    const fetchPublishersData$ = this._vidiunServerClient.multiRequest(request)
			    .pipe(cancelOnDestroy(this, this.widgetReset$))
                .map(
                    responses => {
                        const publishers = responses.map((response, index) => {
                            if (response.error) {
                                const userId = entitledUsersPublish[index];
                                return new VidiunUser({ id: userId, screenName: userId });
                            }
                            return response.result;
                        });
                        this.usersForm.patchValue({ publishers });
                        return undefined;
                    }
                );

		    actions.push(fetchPublishersData$);
	    }

        if (this.data.entitledUsersView && this.data.entitledUsersView.length) {
            const entitledUsersView = this.data.entitledUsersView.split(',');
            const getViewersActions = entitledUsersView.map(userId => new UserGetAction({ userId }));

            const fetchPublishersData$ = this._vidiunServerClient.multiRequest(new VidiunMultiRequest(...getViewersActions))
                .pipe(cancelOnDestroy(this, this.widgetReset$))
                .map(
                    responses => {
                        const viewers = responses.map((response, index) => {
                            if (response.error) {
                                const userId = entitledUsersView[index];
                                return new VidiunUser({ id: userId, screenName: userId });
                            }
                            return response.result;
                        });
                        this.usersForm.patchValue({ viewers });

                        return undefined;
                    }
                );

            actions.push(fetchPublishersData$);
        }

	    return Observable.forkJoin(actions)
		    .map(responses => {
			    super._hideLoader();
			    return {failed : false};
		    })
		    .catch((error, caught) =>
		    {
		        console.warn(error);
			    super._hideLoader();
			    super._showActivationError();

			    return Observable.of({failed : true, error});
		    });

    }

	public searchUsers(text : string)
	{
		return Observable.create(
			observer => {
				const requestSubscription: ISubscription = this._vidiunServerClient.request(
					new UserListAction(
						{
							filter: new VidiunUserFilter({
								idOrScreenNameStartsWith : text
							}),
							pager: new VidiunFilterPager({
								pageIndex : 0,
								pageSize : 30
							})
						}
					)
				)
				.pipe(cancelOnDestroy(this, this.widgetReset$))
				.subscribe(
					result =>
					{
						observer.next(result.objects);
						observer.complete();
					},
					err =>
					{
						observer.error(err);
					}
				);

				return () =>
				{
					console.log("entryUsersHandler.searchOwners(): cancelled");
					requestSubscription.unsubscribe();
				}
			});
	}

	public saveOwner(): void{
		this._owner = this.usersForm.value.owners[0];
	}

    ngOnDestroy()
    {

    }

}
