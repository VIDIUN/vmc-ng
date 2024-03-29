import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { AppAuthentication, AutomaticLoginErrorReasons, BrowserService, LoginError, LoginResponse } from 'app-shared/vmc-shell';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { serverConfig } from 'config/server';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { RestorePasswordViewService } from 'app-shared/vmc-shared/vmc-views/details-views/restore-password-view.service';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

export enum LoginScreens {
  Login,
  ForgotPassword,
  PasswordExpired,
  InvalidLoginHash,
  RestorePassword,
  RestorePasswordInvalidHash
}

@Component({
  selector: 'vVMCLogin',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  public _username: string;
  public _errorMessage: string;
  public _errorCode: string;
  public _inProgress = false;
  public _showLogin = false;
  public _showIEMessage = false;
  public _loginScreens = LoginScreens;
  public _currentScreen = LoginScreens.Login;
  public _passwordReset = false;
  public _signUpLinkExists = !!serverConfig.externalLinks.vidiun && !!serverConfig.externalLinks.vidiun.signUp;
  public _restorePasswordHash: string;
  public _passwordRestored = false;

  // Caution: this is extremely dirty hack, don't do something similar to that
  @HostListener('window:resize')
  onResize() {
    const areaBlocker = <any>document.querySelector('v-area-blocker');
    const content = this._el.nativeElement.querySelector('.vLoginCenter');
    if (content) {
      const windowHeight = window.innerHeight;
      const height = windowHeight <= content.offsetHeight ? 'auto' : '100%';

      this._renderer.setStyle(areaBlocker, 'height', height);
    }
  }

  constructor(private _appAuthentication: AppAuthentication,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              private _el: ElementRef,
              private _renderer: Renderer2,
              private _route: ActivatedRoute,
              private _router: Router,
              private _restorePasswordView: RestorePasswordViewService) {
      this._prepare();
  }

  ngAfterViewInit() {
    this.onResize();
  }

    private _prepare(): void {
        const restorePasswordArgs = this._restorePasswordView.popOpenArgs();
        if (restorePasswordArgs && restorePasswordArgs.hash) {
            this._validateRestorePasswordHash(restorePasswordArgs.hash);
        }
    }

    private _validateRestorePasswordHash(hash: string): void {
        this._appAuthentication.validateResetPasswordHash(hash)
            .pipe(tag('block-shell'))
            .pipe(cancelOnDestroy(this))
            .subscribe(
                (errorCode) => {
                    if (!errorCode) {
                        this._currentScreen = LoginScreens.RestorePassword;
                        this._restorePasswordHash = hash;
                    } else if (errorCode === 'RESET_URI_NOT_DEFINED') {
                        this._browserService.navigateToError();
                    } else {
                        this._currentScreen = LoginScreens.RestorePasswordInvalidHash;
                        this._errorCode = errorCode;
                    }
                },
                error => {
                    this._browserService.confirm({
                        header: this._appLocalization.get('app.error'),
                        message: this._appLocalization.get('app.login.restorePassword.error.failedValidateHash', [error.message]),
                        accept: () => this._validateRestorePasswordHash(hash),
                        reject: () => this._setScreen(LoginScreens.Login)
                    });
                }
            );
    }

  private _makeLoginRequest(username: string, password: string): Observable<LoginResponse> {
    return this._appAuthentication.login(username, password).pipe(cancelOnDestroy(this));
  }

  private _handleLoginResponse(success: boolean, error: LoginError, username: string): void {
    this._errorCode = '';
    this._errorMessage = '';

    if (success) {
        const defaultUrl = this._appAuthentication.defaultUrl;
        if (defaultUrl) {
            this._browserService.navigate(defaultUrl);
        } else {
            this._browserService.navigateToDefault();
        }

      return;
    }

    this._errorCode = error.code;

    if (error.passwordExpired) {
        this._username = username;
        return this._setScreen(LoginScreens.PasswordExpired);
    } else if (error.closedForBeta) {
        this._errorMessage = this._appLocalization.get(error.message);
    } else if (!error.custom) {
        this._errorMessage = this._appLocalization.get(error.message);
    } else {
        this._errorMessage = error.message;
    }
    this._inProgress = false;
  }

    ngOnInit() {
        if (this._appAuthentication.isLogged()) {
            this._browserService.navigateToDefault();
        } else if (typeof document['documentMode'] !== 'undefined' && document['documentMode'] < 11) {
            this._showIEMessage = true;
        } else {
            this._showLogin = true;
            this._username = this._browserService.getFromLocalStorage('login.username');
            this._errorMessage = this._appAuthentication.automaticLoginErrorReason === AutomaticLoginErrorReasons.closedForBeta ? this._appLocalization.get('app.login.error.userForbiddenForBeta')
                : null;
        }
    }

  ngOnDestroy() {
    // for cancelOnDestroy
  }

  public _login({ username, password }: { username: string, password: string }): void {
    this._errorMessage = '';
    this._inProgress = true;

    this._makeLoginRequest(username, password).subscribe(
      ({ success, error }) => {
        this._handleLoginResponse(success, error, username);
      },
      (err) => {
        this._errorCode = err.code;
        this._errorMessage = err.message;
        this._inProgress = false;
      }
    );
  }

  public _rememberMe(username: string): void {
    if (username) {
      this._browserService.setInLocalStorage('login.username', username);
    } else {
      this._browserService.removeFromLocalStorage('login.username');
    }
  }

  public _setScreen(screen: LoginScreens): void {
    this.onResize();

    this._currentScreen = screen;

    this._inProgress = false;
    this._errorCode = '';
    this._errorMessage = '';

    if (screen !== LoginScreens.ForgotPassword) {
      this._passwordReset = false;
    }
  }

  public _forgotPassword(email: string): void {
    this._inProgress = true;

    this._appAuthentication.resetPassword(email)
      .pipe(cancelOnDestroy(this))
      .subscribe(
        () => {
          this._passwordReset = true;
          this._inProgress = false;
        },
        err => {
          this._errorMessage = err;
          this._inProgress = false;
        }
      );
  }

  public _resetPassword({ password, newPassword }: { password: string, newPassword: string }): void {
    const payload = {
      password,
      newPassword,
      email: this._username,
      newEmail: ''
    };

    this._inProgress = true;

    this._appAuthentication.updatePassword(payload)
      .switchMap(({ email, password: userPassword }) => this._makeLoginRequest(email, userPassword))
      .subscribe(
        ({ success, error }) => {
          this._inProgress = false;
          this._handleLoginResponse(success, error, this._username);
        },
        (error: LoginError) => {
          this._inProgress = false;
          this._errorCode = error.code;
          if (!error.custom) {
              this._errorMessage = this._appLocalization.get(error.message);
          } else {
            this._errorMessage = error.message;
          }
        }
      );
  }

  public _signUp(): void {
    this._browserService.openLink(serverConfig.externalLinks.vidiun.signUp, {}, '_self');
  }

  public _restorePassword(payload: {newPassword: string, hashKey: string}): void {
    this._inProgress = true;
    this._appAuthentication.setInitalPassword(payload)
      .subscribe(
        () => {
          this._inProgress = false;
          this._passwordRestored = true;
        },
        err => {
          this._errorMessage = err.message;
          this._errorCode = err.code;
          this._inProgress = false;
        }
      );
  }
}
