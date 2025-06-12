import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appMostrarEspecialidad]'
})
export class MostrarEspecialidadDirective {
  @Input("appMostrarEspecialidad") texto: string = "";
  tooltip!: HTMLElement;
  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @HostListener("mouseenter")
  onMouseEnter() {
    this.tooltip = this.renderer.createElement("span");
    this.renderer.appendChild(
      this.tooltip,
      this.renderer.createText(this.texto)
    );
    this.renderer.appendChild(document.body, this.tooltip);

    this.renderer.setStyle(this.tooltip, "position", "fixed");
    this.renderer.setStyle(this.tooltip, "text-decoration", "none");
    this.renderer.setStyle(this.tooltip, "background", "var(--secondary-color)");
    this.renderer.setStyle(this.tooltip, "color", "var(--primary-color)");
    this.renderer.setStyle(this.tooltip, "padding", "5px 10px");
    this.renderer.setStyle(this.tooltip, "border-radius", "10px");
    this.renderer.setStyle(this.tooltip, "font-size", "12px");
    this.renderer.setStyle(this.tooltip, "pointer-events", "none");
    this.renderer.setStyle(this.tooltip, "z-index", "1");
  }

  
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.tooltip) {
      this.renderer.setStyle(this.tooltip, 'top', `${event.clientY + 10}px`);
      this.renderer.setStyle(this.tooltip, 'left', `${event.clientX + 10}px`);
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (this.tooltip) {
      this.renderer.removeChild(document.body, this.tooltip);
    }
  }
}
