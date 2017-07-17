import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate } from '@angular/router';
import { EntryComponent } from './entry.component';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class EntryCanDeactivate implements CanDeactivate<EntryComponent> {
    constructor() {}
    canDeactivate(component: EntryComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot):Observable<boolean> {
        return Observable.create((observer : any) =>
        {
            component.canLeave().subscribe(
                result => {
                    observer.next(result.allowed);
                    observer.complete();
                },
                error => {
                    observer.next(false);
                    observer.complete();
                }
            );
        });
    }
}
