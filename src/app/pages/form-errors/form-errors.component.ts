import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-errors',
  imports: [],
  templateUrl: './form-errors.component.html',
  styleUrl: './form-errors.component.css'
})
export class FormErrorsComponent {
  @Input() control!: AbstractControl | null;

  mensajesDeError() {
    if (!this.control || !this.control.errors) return [];

    const errores = this.control.errors;
    let retorno = "Error Desconocido";

    if (errores['required']) retorno = ("Campo Obligatorio");
    if (errores['minlength']) retorno = (`Mínimo ${errores['minlength'].requiredLength} Caracteres`);
    if (errores['maxlength']) retorno = (`Máximo ${errores['maxlength'].requiredLength} Caracteres`);
    if (errores['edadInvalida']) retorno = ("Válido de 18 años a 110 años");
    if (errores['patternstring']) retorno = ("Requiere Formato Alfabético");
    if (errores['pattern']) retorno = ("Requiere Formato Numérico");
    if (errores['patterndni']) retorno = ("Requiere Formato DNI");
    if (errores['email']) retorno = ("Requiere Formato de Email");
    if (errores['fotoUnica']) retorno = ("Requiere Una Única Foto");
    if (errores['fotoDoble']) retorno = ("Requiere Dos Fotos");

    return retorno;
  }
}
