import { VidiunLogger } from '@vidiun-ng/vidiun-logger';

export abstract class VmcComponentViewBaseService<TArgs> {

    protected constructor(protected _logger: VidiunLogger) {
    }

    abstract isAvailable(args: TArgs): boolean;
}
