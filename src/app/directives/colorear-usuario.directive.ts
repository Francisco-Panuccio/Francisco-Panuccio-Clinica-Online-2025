import { Directive, ElementRef, Input, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appColorearUsuario]'
})
export class ColorearUsuarioDirective {
  @Input("appColorearUsuario") tipoUsuario: string = "";

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["tipoUsuario"]) {
      this.colorear();
    }
  }

  private colorear(): void {
    let color: string;

    switch (this.tipoUsuario.toLowerCase()) {
      case "paciente":
        color = "var(--correct2-color)";
        break;
      case "especialista":
        color = "var(--quaternary3-color)";
        break;
      case "administrador":
        color = "var(--tertiary3-color)";
        break;
      default:
        color = "transparent";
    }

    this.renderer.setStyle(this.el.nativeElement, 'background-color', color);
  }
}
