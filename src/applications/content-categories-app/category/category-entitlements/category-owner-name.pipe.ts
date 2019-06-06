import {Pipe, PipeTransform} from '@angular/core';
import {VidiunUser} from 'vidiun-ngx-client';

@Pipe({ name: 'vCategoryOwnerName' })
export class CategoryOwnerNamePipe implements PipeTransform {
  constructor() {
  }

  transform(value: VidiunUser): string {
    return value.email || value.id;
  }
}
