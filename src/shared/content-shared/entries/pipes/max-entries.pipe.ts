import { Pipe, PipeTransform } from '@angular/core';
import { globalConfig } from 'config/global';


@Pipe({ name: 'vMaxEntries' })
export class MaxEntriesPipe implements PipeTransform {
  constructor() {
  }

  transform(value: number): number {
    const maxEntries = globalConfig.client.views.tables.maxItems;
    return value > maxEntries ? maxEntries : value;
  }
}
