import {Component, Input, OnInit, AfterViewInit, OnDestroy, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder} from '@angular/forms';
import {ISubscription} from 'rxjs/Subscription';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import {AppAuthentication, BrowserService} from 'app-shared/vmc-shell';
import {PopupWidgetComponent, PopupWidgetStates} from '@vidiun-ng/vidiun-ui';
import {VidiunClient} from 'vidiun-ngx-client';
import {PartnerListPartnersForUserAction} from 'vidiun-ngx-client';
import {VidiunPartnerFilter} from 'vidiun-ngx-client';
import {VidiunPartnerStatus} from 'vidiun-ngx-client';
import { Observable } from 'rxjs';
import {AreaBlockerMessage} from '@vidiun-ng/vidiun-ui';
import { VidiunFilterPager } from 'vidiun-ngx-client';

@Component({
  selector: 'vChangeAccount',
  templateUrl: './change-account.component.html',
  styleUrls: ['./change-account.component.scss']
})
export class ChangeAccountComponent implements OnInit {

  @Input() parentPopupWidget: PopupWidgetComponent;

  public partners: { 'id': number, 'name': string }[];
  public changeAccountForm: FormGroup;
  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;
  public _currentPartnerId: number;

  constructor(private _fb: FormBuilder,
              private _appLocalization: AppLocalization,
              private _vidiunServerClient: VidiunClient,
              private _userAuthentication: AppAuthentication) {
  }

  ngOnInit() {
    this._currentPartnerId = this._userAuthentication.appUser.partnerId;
    this._createForm();
    this.loadAvailablePartners();
  }

  private loadAvailablePartners() {
    this._isBusy = true;
    this.getAvailablePartners()
      .subscribe(partners => {
          this.partners = partners;
          this._isBusy = false;
          this._blockerMessage = null;
        },
        error => {
          this._blockerMessage = new AreaBlockerMessage(
            {
              message: this._appLocalization.get('app.changeAccount.errors.loadPartners'),
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this.loadAvailablePartners();
                  }
                }
              ]
            }
          );
        });
  }

  public _saveAndClose(): void {
    const account = this.changeAccountForm.get('account').value; // pass selected account
    // this.parentPopupWidget.close(account);
    this._isBusy = true;
    this._userAuthentication.switchPartnerId(account)
      .subscribe(() => {
          this._isBusy = false;
          this._blockerMessage = null;
        },
        error => {
          this._blockerMessage = new AreaBlockerMessage({
            message: error.message,
            buttons: [{
              label: this._appLocalization.get('app.common.ok'),
              action: () => {
                this._isBusy = false;
                this._blockerMessage = null;
              }
            }]
          });
        });
  }


  private _createForm(): void {
    this.changeAccountForm = this._fb.group({
      account: this._userAuthentication.appUser.partnerId,
    });
  }

  private getAvailablePartners(): Observable<{ 'id': number, 'name': string }[]> {
    const pager: VidiunFilterPager = new VidiunFilterPager({pageSize: 500});
    const filter = new VidiunPartnerFilter({
      statusEqual: VidiunPartnerStatus.active
    });

    return this._vidiunServerClient.request(new PartnerListPartnersForUserAction({
      partnerFilter: filter,
        pager: pager
    }))
      .map(data => {
        return data.objects.map(partner => ({'id': partner.id, 'name': partner.name}))
      });
  }
}

