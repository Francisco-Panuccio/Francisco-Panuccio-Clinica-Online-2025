import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoTurno'
})
export class EstadoTurnoPipe implements PipeTransform {

  transform(value: string, color?: string): unknown {
    if (!value) return color || 'black';

    switch (value.toLowerCase()) {
      case 'rechazado':
      case 'cancelado':
        return 'var(--error-color)';
      case 'pendiente':
        return '#b8860b';
      case 'realizado':
        return 'gray';
      case 'aceptado':
        return 'var(--correct-color)';
      default:
        return color || 'black';
    }
  }

}
