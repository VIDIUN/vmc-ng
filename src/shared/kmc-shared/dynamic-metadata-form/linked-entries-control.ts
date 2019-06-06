import { DynamicFormControlBase, DynamicFormControlArgs } from '@vidiun-ng/vidiun-ui';

export interface LinkedEntriesControlArgs extends DynamicFormControlArgs<any>
{
    allowMultipleEntries : boolean;
}

export class LinkedEntriesControl extends DynamicFormControlBase<any> {
    get controlType()
    {
        return 'LinkedEntriesComponent';
    }

    allowMultipleEntries : boolean;

    constructor(options: LinkedEntriesControlArgs) {
        super(options);
        this.allowMultipleEntries = options.allowMultipleEntries;
    }
}
