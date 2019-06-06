import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'vPrimeTableSortTransform' })
export class PrimeTableSortTransformPipe implements PipeTransform {
  transform(value: boolean): string | boolean {
    return value ? 'custom' : false;
  }
}
