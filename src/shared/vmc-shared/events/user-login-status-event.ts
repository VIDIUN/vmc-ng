

import { AppEvent } from 'app-shared/vmc-shared/app-events/app-event';

export class UserLoginStatusEvent extends AppEvent {

    public get isLogged(): boolean {
        return this._isLogged;
    }

    constructor(private _isLogged: boolean) {
        super('User Login Status');
    }

}