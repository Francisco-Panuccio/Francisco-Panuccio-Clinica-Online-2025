import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appSoloNumeros]'
})
export class SoloNumerosDirective {
  constructor(private control: NgControl) { }

  @HostListener("input", ["$event"])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let valor = input.value;

    valor = valor.replace(/[^0-9]/g, "");
    valor = valor.replace(/^0+/, "");

    let numero: number | null = null;
    if(valor !== "") {
      numero = parseInt(valor, 10);
    } 

    if(numero !== null && numero >= 1 && numero <= 10) {
      this.control.control?.setValue(numero, {emitEvent: false});
    } else if(valor === "") {
      this.control.control?.setValue(null, {emitEvent: false});
    } else {
      this.control.control?.setValue(null, {emitEvent: false});
    }
  }
}
