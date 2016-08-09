import { Injectable } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs/rx';
import {LocalStorageService, SessionStorageService} from 'ng2-webstorage';
import {KMCConfig} from "./kmc-config.service";

@Injectable()
export class KMCBrowserService {

  constructor(private kmcConfig : KMCConfig, private localStorage :LocalStorageService, private sessionStorage : SessionStorageService )
  {
    this._areaHeight$ = <ReplaySubject<number>>new ReplaySubject(1); // we are using here a replay subject with buffer of 1 so any new subsribers will get the last one.

  }

  private _areaHeight$ : ReplaySubject<number>;

  public getContentAreaHeight() : Observable<number>{
    return this._areaHeight$.asObservable(); // we proxy the subject by a function that returns its observable to prevent others from broadcasting on that subject.
  }

  public setContentAreaHeight(value : number) : void {
    this._areaHeight$.next(value);
  };

  public setInLocalStorage(key : string, value : any) : void{
   this.localStorage.store(key,value);
  }

  public getFromLocalStorage(key : string) : any{
    return this.localStorage.retrieve(key);
  }

  public removeFromLocalStorage(key : string) : any{
    this.localStorage.clear(key);
  }

  public setInSessionStorage(key : string, value : any) : void{
    this.sessionStorage.store(key,value);
  }

  public getFromSessionStorage(key : string) : any{
    return this.sessionStorage.retrieve(key);
  }

  public removeFromSessionStorage(key : string) : any{
    this.sessionStorage.clear(key);
  }

}
