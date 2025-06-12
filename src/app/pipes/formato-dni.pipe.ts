import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoDNI'
})
export class FormatoDNIPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    let dni = String(value);
    return `${dni.slice(0,2)}.${dni.slice(2,5)}.${dni.slice(5)}`;
  }

}
