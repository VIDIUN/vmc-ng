import {Injectable} from '@angular/core';
import {CategoryWidget} from '../category-widget';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';

@Injectable()
export class CategoryDetailsWidget extends CategoryWidget {
  constructor(logger: VidiunLogger) {
    super('categoryDetails', logger);
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {
  }
}
