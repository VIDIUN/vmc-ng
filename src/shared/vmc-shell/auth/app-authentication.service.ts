import {Injectable, Optional, Inject} from '@angular/core';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import {VidiunClient, VidiunMultiRequest, VidiunRequestOptions} from 'vidiun-ngx-client';
import {UserLoginByLoginIdAction} from 'vidiun-ngx-client';
import {UserGetByLoginIdAction} from 'vidiun-ngx-client';
import {UserGetAction} from 'vidiun-ngx-client';
import {PartnerGetInfoAction} from 'vidiun-ngx-client';
import {PermissionListAction} from 'vidiun-ngx-client';
import {VidiunResponseProfileType} from 'vidiun-ngx-client';
import {VidiunDetachedResponseProfile} from 'vidiun-ngx-client';
import {VidiunPermissionFilter} from 'vidiun-ngx-client';
import {VidiunPermissionListResponse} from 'vidiun-ngx-client';
import {VidiunUserRole} from 'vidiun-ngx-client';
import {VidiunFilterPager} from 'vidiun-ngx-client';
import {VidiunPermissionStatus} from 'vidiun-ngx-client';
import {UserRoleGetAction} from 'vidiun-ngx-client';
import * as Immutable from 'seamless-immutable';
import {AppUser} from './app-user';
import {UserResetPasswordAction} from 'vidiun-ngx-client';
import {AdminUserUpdatePasswordAction} from 'vidiun-ngx-client';
import { PageExitVerificationService } from 'app-shared/vmc-shell/page-exit-verification/page-exit-verification.service';
import { UserLoginStatusEvent } from 'app-shared/vmc-shared/events';
import { VidiunPartner } from 'vidiun-ngx-client';
import { VidiunUser } from 'vidiun-ngx-client';
import { AppEventsService } from 'app-shared/vmc-shared/app-events';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { serverConfig } from 'config/server';
import { BrowserService } from 'app-shared/vmc-shell/providers/browser.service';
import { UserLoginByVsAction } from 'vidiun-ngx-client';
import { VmcServerPolls } from '../../vmc-shared/server-polls';
import { HttpClient } from '@angular/common/http';
import { buildBaseUri } from 'config/server';
import { VmcMainViewsService } from 'app-shared/vmc-shared/vmc-views/vmc-main-views.service';
import { vmcAppConfig } from '../../../vmc-app/vmc-app-config';



const vsSessionStorageKey = 'auth.login.vs';
import { AdminUserSetInitialPasswordAction } from 'vidiun-ngx-client';
import { RestorePasswordViewService } from 'app-shared/vmc-shared/vmc-views/details-views/restore-password-view.service';
import { switchMap, map } from 'rxjs/operators';
import { of as ObservableOf } from 'rxjs';

export interface UpdatePasswordPayload {
    email: string;
    password: string;
    newEmail: string;
    newPassword: string;
}

export interface LoginError {
    message: string;
    custom: boolean;
    passwordExpired?: boolean;
    closedForBeta?: boolean;
    code?: string;
}

export interface LoginResponse {
    success: boolean;
    error: LoginError;
}

export interface AppAuthenticationEvents {
    onUserLoggedIn: (appUser: Immutable.ImmutableObject<AppUser>) => Observable<void>;
    onUserLoggedOut: () => void;
}
export enum AutomaticLoginErrorReasons {
    closedForBeta
};

@Injectable()
export class AppAuthentication {

    private _automaticLoginErrorReason: AutomaticLoginErrorReasons = null;

    public get automaticLoginErrorReason(): AutomaticLoginErrorReasons {
        return this._automaticLoginErrorReason;
    }

    private _defaultUrl: string;
    private _automaticLogin: {  vs: string, persistCredentials: boolean } = { vs: null, persistCredentials: false };
    private _logger: VidiunLogger;
    private _appUser: Immutable.ImmutableObject<AppUser> = null;
    private _autoLoginAttempted = false;

    public get defaultUrl(): string {
        return this._defaultUrl;
    }

    constructor(private vidiunServerClient: VidiunClient,
                private _browserService: BrowserService,
                private _pageExitVerificationService: PageExitVerificationService,
                logger: VidiunLogger,
                private _serverPolls: VmcServerPolls,
                private _permissionsService: VMCPermissionsService,
                private _http: HttpClient,
                private _appEvents: AppEventsService,
                private _location: Location,
                private _vmcViewsManager: VmcMainViewsService,
                private _restorePasswordView: RestorePasswordViewService) {
        this._logger = logger.subLogger('AppAuthentication');
    }

    private _getLoginErrorMessage({error}): LoginError {
        const message = (error ? error.message : null) || 'Failed to load partner information';
        const code = error ? error.code : null;
        const custom = true;
        const errors = {
            'USER_NOT_FOUND': 'app.login.error.badCredentials',
            'USER_WRONG_PASSWORD': 'app.login.error.badCredentials',
            'ADMIN_VUSER_NOT_FOUND': 'app.login.error.userNotFound',
            'PASSWORD_STRUCTURE_INVALID': 'app.login.error.invalidStructure',
            'PASSWORD_ALREADY_USED': 'app.login.error.alreadyUsed',
            'NEW_PASSWORD_HASH_KEY_INVALID': 'app.login.error.newPasswordHashKeyInvalid',
            'NEW_PASSWORD_HASH_KEY_EXPIRED': 'app.login.error.newPasswordHashKeyExpired',
            'ADMIN_VUSER_WRONG_OLD_PASSWORD': 'app.login.error.wrongOldPassword',
            'WRONG_OLD_PASSWORD': 'app.login.error.wrongOldPassword',
            'INVALID_FIELD_VALUE': 'app.login.error.invalidField',
            'USER_FORBIDDEN_FOR_BETA': 'app.login.error.userForbiddenForBeta'
        };

        if (code === 'PASSWORD_EXPIRED') {
            return {
                message: '',
                custom: false,
                passwordExpired: true,
                code
            };
        }

        if (code in errors) {
            return {
                message: errors[code],
                custom: false,
                code
            };
        }

        return {message, custom, code};
    }

    get appUser(): Immutable.ImmutableObject<AppUser> {
        return this._appUser;
    }

    validateResetPasswordHash(hash: string): Observable<string> {
        if (!serverConfig.vidiunServer.resetPasswordUri) {
            this._logger.warn(`resetPasswordUri was not provided by configuration, abort request`);
            return Observable.of('RESET_URI_NOT_DEFINED');
        }

        const url = serverConfig.vidiunServer.resetPasswordUri.replace('{hash}', hash);

        this._logger.debug(`check if provided hash is valid`, { hash, url });

        return this._http.get(url, { responseType: 'json' })
            .map(res => res['errorCode'])
            .catch((e) => {
                this._logger.error('Failed to check if provided hash is valid', e);
                throw Error('Failed to check if provided hash is valid');
            });
    }

    resetPassword(email: string): Observable<void> {
        if (!this.isLogged()) {
            return this.vidiunServerClient.request(new UserResetPasswordAction({email}));
        } else {
            return Observable.throw(new Error('cannot reset password, user is logged'));
        }
    }

    updatePassword(payload: UpdatePasswordPayload): Observable<{ email: string, password: string }> {
        return this.vidiunServerClient.request(new AdminUserUpdatePasswordAction(payload))
            .catch(error => Observable.throw(this._getLoginErrorMessage({error})));
    }

    setInitalPassword(payload: { newPassword: string, hashKey: string }): Observable<void> {
        return this.vidiunServerClient.request(new AdminUserSetInitialPasswordAction(payload))
            .catch(error => Observable.throw(this._getLoginErrorMessage({error})));
    }

    login(loginId: string, password: string): Observable<LoginResponse> {

        const expiry = vmcAppConfig.vidiunServer.expiry;
        let privileges = vmcAppConfig.vidiunServer.privileges || '';

        if (serverConfig.vidiunServer.defaultPrivileges) {
            privileges += `${privileges ? ',' : ''}${serverConfig.vidiunServer.defaultPrivileges}`;
        }

        this._automaticLoginErrorReason = null;
        this._browserService.removeFromSessionStorage(vsSessionStorageKey);  // clear session storage

        const request = new VidiunMultiRequest(
            new UserLoginByLoginIdAction(
                {
                    loginId,
                    password,

                    expiry: expiry,
                    privileges: privileges
                }),
            new UserGetByLoginIdAction({loginId})
                .setRequestOptions(
                    new VidiunRequestOptions({})
                        .setDependency(['vs', 0])
                ),
            new PartnerGetInfoAction({}).setRequestOptions(
                new VidiunRequestOptions({})
                    .setDependency(['vs', 0])
                    .setDependency(['id', 1, 'partnerId'])
            ),
            new UserRoleGetAction({userRoleId: 0})
                .setRequestOptions(
                    new VidiunRequestOptions({})
                        .setDependency(['vs', 0])
                )
                .setDependency(['userRoleId', 1, 'roleIds']),
            new PermissionListAction({
                filter: new VidiunPermissionFilter({
                    statusEqual: VidiunPermissionStatus.active,
                    typeIn: '2,3'
                }),
                pager: new VidiunFilterPager({
                    pageSize: 500
                })
            })
                .setRequestOptions(
                    new VidiunRequestOptions({
                        responseProfile: new VidiunDetachedResponseProfile({
                            type: VidiunResponseProfileType.includeFields,
                            fields: 'name'
                        })
                    })
                        .setDependency(['vs', 0])
                )
        );

        return <any>(this.vidiunServerClient.multiRequest(request)
                .pipe(
                    switchMap(response => {
                        if (!response.hasErrors()) {
                            return this._checkIfPartnerCanAccess(response[2].result)
                                .pipe(map(isPartnerAllowed => ({ response, isPartnerAllowed })));
                        } else {
                            return ObservableOf(true) // errors will be handled by the map function
                                .pipe(map(isPartnerAllowed => ({ response, isPartnerAllowed })));
                        }
                    }),
                    map(
                        ({ response, isPartnerAllowed }) => {
                            if (!response.hasErrors()) {
                                if (isPartnerAllowed) {
                                    this._afterLogin(response[0].result, true, response[1].result, response[2].result, response[3].result, response[4].result);
                                    return { success: true, error: null };
                                } else {
                                    return {
                                        success: false, error: {
                                            message: 'app.login.error.userForbiddenForBeta',
                                            custom: false,
                                            closedForBeta: true
                                        }
                                    };
                                }
                            }

                            return { success: false, error: this._getLoginErrorMessage(response[0]) };
                        }
                    )
                )
        );
    }

    private _checkIfPartnerCanAccess(partner: VidiunPartner): Observable<boolean> {
        if (!serverConfig.vidiunServer.limitAccess){
            return Observable.of(true);
        }
        const serviceUrl = serverConfig.vidiunServer.limitAccess.serviceUrl;

        const url = buildBaseUri(serviceUrl + partner.id);
        this._logger.debug(`check if partner can access the VMC`, {partnerId: partner.id, limitAccess: true, url});

        return this._http.get(url, { responseType: 'json' })
            .map(res => {
                const {isPartnerPartOfBeta: canPartnerAccess} = <any>res;

                this._automaticLoginErrorReason = canPartnerAccess ? null : AutomaticLoginErrorReasons.closedForBeta;
                this._logger.info(`query service to check if partner can access the VMC`, {
                    partnerId: partner.id,
                    canPartnerAccess
                });
                return canPartnerAccess;
            })
            .catch((e) => {
                this._logger.error('Failed to check if partner can access the VMC', e);
                throw Error('Failed to check if partner can access the VMC');
            });
    }

    private _afterLogin(vs: string, storeCredentialsInSessionStorage: boolean, user: VidiunUser, partner: VidiunPartner, userRole: VidiunUserRole, permissionList: VidiunPermissionListResponse): void {

        if (storeCredentialsInSessionStorage) {
            this._browserService.setInSessionStorage(vsSessionStorageKey, vs);  // save vs in session storage
        }

        const partnerPermissionList = permissionList.objects.map(item => item.name);
        const userRolePermissionList = userRole.permissionNames.split(',');
        this._permissionsService.load(userRolePermissionList, partnerPermissionList);

        const appUser: Immutable.ImmutableObject<AppUser> = Immutable({
            vs,
            id: user.id,
            partnerId: user.partnerId,
            fullName: user.fullName,
            firstName: user.firstName,
            lastName: user.lastName,
            isAccountOwner: user.isAccountOwner,
            createdAt: user.createdAt,
            partnerInfo: {
                partnerId: user.partnerId,
                name: partner.name,
                partnerPackage: partner.partnerPackage,
                landingPage: partner.landingPage,
                adultContent: partner.adultContent,
                publisherEnvironmentType: partner.publisherEnvironmentType,
                publishersQuota: partner.publishersQuota
            }
        });

        this._vmcViewsManager.rebuildMenu();
        this.vidiunServerClient.setDefaultRequestOptions({
            vs: appUser.vs
        });
        window['vmcng'] = {vs};

        this._appUser = appUser;
        this._appEvents.publish(new UserLoginStatusEvent(true));

        this._serverPolls.forcePolling();
    }

    isLogged() {
        return !!this._appUser;
    }


    private _clearSessionCredentials(): void {
        this._logger.debug(`clear previous stored credentials in session storage if found`);
        this._browserService.removeFromSessionStorage(vsSessionStorageKey);
    }

    logout() {
        this._logger.info('handle logout request by the user');
        this._clearSessionCredentials();
        this._logout();
    }

    private _loginByVS(loginToken: string, storeCredentialsInSessionStorage): Observable<boolean> {
        return Observable.create((observer: any) => {
            if (!this.isLogged()) {
                if (loginToken) {
                    const requests = [
                        new UserGetAction({})
                            .setRequestOptions({
                                vs: loginToken
                            }),
                        new PartnerGetInfoAction({})
                            .setRequestOptions({
                                vs: loginToken
                            })
                            .setDependency(['id', 0, 'partnerId']),
                        new UserRoleGetAction({ userRoleId: 0})
                            .setRequestOptions({
                                vs: loginToken
                            })
                            .setDependency(['userRoleId', 0, 'roleIds']),
                        new PermissionListAction({
                            filter: new VidiunPermissionFilter({
                                statusEqual: VidiunPermissionStatus.active,
                                typeIn: '2,3'
                            }),
                            pager: new VidiunFilterPager({
                                pageSize: 500
                            })
                        })
                            .setRequestOptions({
                                vs: loginToken,
                                responseProfile: new VidiunDetachedResponseProfile({
                                    type: VidiunResponseProfileType.includeFields,
                                    fields: 'name'
                                })
                            })
                    ];

                    this.vidiunServerClient.multiRequest(requests)
                        .pipe(
                            switchMap(
                                response => {
                                    const result = !response.hasErrors()
                                        ? this._checkIfPartnerCanAccess(response[1].result)
                                        : ObservableOf(true);

                                    return result.pipe(map(isPartnerAllowed => ({ response, isPartnerAllowed })));
                                })
                        )
                        .subscribe(
                            ({ response, isPartnerAllowed }) => {
                                if (!response.hasErrors() && isPartnerAllowed) {
                                    this._afterLogin(loginToken, storeCredentialsInSessionStorage, response[0].result, response[1].result, response[2].result, response[3].result);
                                    observer.next(true);
                                    observer.complete();
                                    return;
                                }

                                observer.next(false);
                                observer.complete();
                            },
                            () => {
                                observer.next(false);
                                observer.complete();
                            }
                        );
                } else {
                    observer.next(false);


                    observer.complete();
                }
            }
        });
    }

    public setAutomaticLoginCredentials(vs: string, persistCredentials = false) {
        this._automaticLogin.vs = vs;
        this._automaticLogin.persistCredentials = persistCredentials;
    }


    public restorePassword(hash: string): void {
        this._clearSessionCredentials();

        if (this._restorePasswordView.isAvailable({hash})) {
            this._restorePasswordView.open({hash});
        } else {

            this._logger.warn(`restore password view is not available, redirect to default view`, {
                restorePasswordHash: hash
            });
            this._browserService.navigateToDefault();
        }
    }

    public loginAutomatically(defaultUrl: string): Observable<boolean> {
        if (this._autoLoginAttempted || this.isLogged()) {
            return ObservableOf(this.isLogged());
        }

        this._autoLoginAttempted = true;
        const vsFromApp = this._automaticLogin.vs;
        if (vsFromApp) {
            this._logger.info(`try to login automatically with VS provided explicitly by the app`);
            this._clearSessionCredentials();
            return this._loginByVS(vsFromApp, this._automaticLogin.persistCredentials);
        }

        const forbiddenUrls = ['/error', '/actions', '/login'];
        const url = typeof defaultUrl === 'string' ? defaultUrl.trim() : '';
        const allowedUrl = url !== '/' && forbiddenUrls.filter(forbiddenUrl => url.indexOf(forbiddenUrl) !== -1).length === 0;
        if (allowedUrl) {
            this._defaultUrl = url;
            this._logger.info(`set default url to ${url}`);
        }

        const vsFromSession = this._browserService.getFromSessionStorage(vsSessionStorageKey);  // get vs from session storage;

        if (vsFromSession) {
            this._logger.info(`try to login automatically with VS stored in session storage`);
            return this._loginByVS(vsFromSession, true);
        }

        this._logger.debug(`ignore automatic login logic as no session vs found `);
        return Observable.of(false);
    }

    public switchPartnerId(partnerId: number): Observable<void> {
        return Observable.create((observer: any) => {
            return this.vidiunServerClient.request(new UserLoginByVsAction({requestedPartnerId: partnerId}))
                .subscribe(
                    result => {
                        this._logger.info(`switch partner account`, { partnerId });
                        this._browserService.setInSessionStorage(vsSessionStorageKey, result.vs);
                        this._forceReload();

                        // DEVELOPER NOTICE: observer next/complete not implemented by design
                        // (since we are breaking the stream by reloading the page)
                    },
                    error => {
                        observer.error(error);
                    }
                );
        });
    }

    public reload() {
        this._logger.info(` reload of browser`, { forceReload: false });
        document.location.reload(false);
    }

    private _forceReload() {
        const baseUrl = this._location.prepareExternalUrl('');

        if (baseUrl) {
            this._logger.info(`redirect the user to base url`, { url: baseUrl });
            this._logout(false);
            window.location.href = baseUrl;
        } else {
            this._logger.info(`reload browser page`, { url: baseUrl });
            document.location.reload(true);
        }
    }

    private _logout(reloadPage = true) {
        this._logger.info(`log out user from the application`, { forceReload: reloadPage });
        this.vidiunServerClient.setDefaultRequestOptions({});
        this._permissionsService.flushPermissions();
        delete window['vmcng'];
        this._appUser = null;
        this._appEvents.publish(new UserLoginStatusEvent(false));
        this._pageExitVerificationService.removeAll();
        if (reloadPage) {
            this._logger.info(`force reload of browser`);
            this._forceReload();
        }
    }

    public _updateNameManually(firstName: string, lastName: string, fullName: string): void {
        if (this._appUser) {
            this._appUser = this._appUser.merge(
                {
                    firstName: firstName,
                    lastName: lastName,
                    fullName: fullName
                });
        }
    }
}
