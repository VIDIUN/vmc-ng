import {Pipe, PipeTransform} from '@angular/core';
import {SortDirection} from '../feeds/feeds.service';


@Pipe({name: 'kPrimeTableSortDirection'})
export class PrimeTableSortDirectionPipe implements PipeTransform {
  constructor() {
  }

  transform(value: SortDirection): number {
    switch (value) {
      case SortDirection.Asc:
        return 1;
      case SortDirection.Desc:
        return -1;
    }
  }
}
