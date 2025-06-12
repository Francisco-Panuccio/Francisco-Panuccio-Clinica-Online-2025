import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoHora'
})
export class FormatoHoraPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    const [horas, minutos] = String(value).split(":");
    const hora = parseInt(horas, 10);
    const abreviatura = (hora >= 12) ? "pm" : "am";
    return `${horas}:${minutos}${abreviatura}`;
  }

}
