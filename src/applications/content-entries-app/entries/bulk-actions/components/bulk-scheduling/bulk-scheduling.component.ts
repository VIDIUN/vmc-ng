import { Component, OnInit, OnDestroy, AfterViewInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';

import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { BrowserService } from 'app-shared/kmc-shell';
import { AreaBlockerMessage, AreaBlockerMessageButton } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

function datesValidation(checkRequired: boolean = false): ValidatorFn {
  return (c: AbstractControl): {[key: string]: boolean} | null => {
    const startDate = c.get('startDate').value;
    const endDate = c.get('endDate').value;
    const scheduling = c.get('scheduling').value;
    const enableEndDate = c.get('enableEndDate').value;
    if (checkRequired && scheduling === "scheduled"){
      if (!startDate) {
        return { 'noStartDate': true };
      }
      if (enableEndDate && !endDate){
        return { 'noEndDate': true };
      }
    }

    if (scheduling === "scheduled" && startDate && endDate && startDate > endDate){
      return { 'endDateBeforeStartDate': true };
    }

    return null;
  }
}


@Component({
  selector: 'kBulkScheduling',
  templateUrl: './bulk-scheduling.component.html',
  styleUrls: ['./bulk-scheduling.component.scss']
})
export class BulkScheduling implements OnInit, OnDestroy, AfterViewInit {

  @Input() parentPopupWidget: PopupWidgetComponent;

  public _loading = false;
  public _sectionBlockerMessage: AreaBlockerMessage;


  public schedulingForm: FormGroup;
  public _enableSave: boolean = false;

  private _parentPopupStateChangeSubscribe : ISubscription;
  private _confirmClose: boolean = true;

  constructor(private _appLocalization: AppLocalization, private _fb: FormBuilder, private _browserService: BrowserService) {
    this.createForm();
  }


  ngOnInit() {
    this.setValidators(false);
  }

  ngAfterViewInit(){
    if (this.parentPopupWidget) {
      this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$
        .subscribe(event => {
          if (event.state === PopupWidgetStates.Open) {
            this._confirmClose = true;
          }
          if (event.state === PopupWidgetStates.BeforeClose) {
            if (event.context && event.context.allowClose){
              if (this.schedulingForm.dirty && this._confirmClose){
                event.context.allowClose = false;
                this._browserService.confirm(
                  {
                    header: this._appLocalization.get('applications.content.entryDetails.captions.cancelEdit'),
                    message: this._appLocalization.get('applications.content.entryDetails.captions.discard'),
                    accept: () => {
                      this._confirmClose = false;
                      this.parentPopupWidget.close();
                    }
                  }
                );
              }
            }
          }
        });
    }
  }

  ngOnDestroy(){
    this._parentPopupStateChangeSubscribe.unsubscribe();
  }


  private createForm(): void{
    this.schedulingForm = this._fb.group({
      scheduling: 'anytime',
      startDate: {value: '', disabled: true},
      endDate: {value: '', disabled: true},
      enableEndDate: false
    }, { validator: datesValidation(false) });
    this.schedulingForm.get('scheduling').valueChanges
      .cancelOnDestroy(this)
      .subscribe(
        value => {
          if (value === "anytime"){
            this.schedulingForm.get('startDate').disable();
            this.schedulingForm.get('endDate').disable();
            this.schedulingForm.get('enableEndDate').disable();
          }else{
            this.schedulingForm.get('startDate').enable();
            this.schedulingForm.get('enableEndDate').enable();
            if (this.schedulingForm.get('enableEndDate').value){
              this.schedulingForm.get('endDate').enable();
            }

          }
        }
      );
    this.schedulingForm.get('enableEndDate').valueChanges
      .cancelOnDestroy(this)
      .subscribe(
        value => {
          if (value){
            this.schedulingForm.get('endDate').enable();
          }else{

            this.schedulingForm.get('endDate').disable();
          }
        }
      );

    Observable.merge(this.schedulingForm.valueChanges,
      this.schedulingForm.statusChanges)
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this._enableSave = this.schedulingForm.status === 'VALID';
        }
      );
  }

  private setValidators(checkRequired: boolean){
    this.schedulingForm.clearValidators();
    this.schedulingForm.setValidators(datesValidation(checkRequired));
    this.schedulingForm.updateValueAndValidity();
  }

  public _clearDates(){
    this.schedulingForm.patchValue({
      startDate: '',
      endDate: ''
    });
    this.setValidators(true);
  }

  public _apply(){
    this._confirmClose = false;
    alert("apply");
    this.parentPopupWidget.close();
  }
}

