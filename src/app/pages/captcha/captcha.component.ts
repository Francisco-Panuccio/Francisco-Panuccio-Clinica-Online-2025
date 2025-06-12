import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-captcha',
  imports: [FormsModule],
  templateUrl: './captcha.component.html',
  styleUrl: './captcha.component.css'
})
export class CaptchaComponent implements OnInit{
  imagenes: {url: string; valor: string}[] = [];
  captcha: string = "";
  valor_captcha: string = "";
  numero_aleatorio: number = 0;
  ultimo_numero_aleatorio: number = -1;
  url_captcha!: string;
  captcha_cargado: boolean = false;

  async ngOnInit() {
    await this.precargaDeImagenes();
    this.captcha_cargado = true;
    this.eleccionCaptcha();
  }

  obtenerNumeroAleatorio() {
    return Math.floor(Math.random() * 5);
  }

  eleccionCaptcha() {
    this.captcha_cargado = false;

    let nuevo_numero_aleatorio = this.obtenerNumeroAleatorio();
    while(nuevo_numero_aleatorio === this.ultimo_numero_aleatorio && this.imagenes.length > 1) {
      nuevo_numero_aleatorio = this.obtenerNumeroAleatorio();
    }

    this.numero_aleatorio = nuevo_numero_aleatorio;
    this.ultimo_numero_aleatorio = nuevo_numero_aleatorio;

    this.url_captcha = this.imagenes[this.numero_aleatorio].url;
    this.captcha = this.imagenes[this.numero_aleatorio].valor;

    setTimeout(() => {
      this.captcha_cargado = true;
    }, 500)
  }

  resolverCaptcha() {
    this.valor_captcha = String(this.valor_captcha).toLowerCase();

    if(this.valor_captcha === this.captcha) {
      return true;
    } else {
      this.eleccionCaptcha();
      this.valor_captcha = "";
      return false;
    }
  }

  async precargaDeImagenes() {
    const cargarImagen = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve();
        img.onerror = () => reject();
      });
    };

    this.imagenes = [
      {url: "images/captcha/captcha1.jpg", valor: "morning"},
      {url: "images/captcha/captcha2.jpg", valor: "inquiry"},
      {url: "images/captcha/captcha3.jpg", valor: "overlooks"},
      {url: "images/captcha/captcha4.jpg", valor: "tumbling"},
      {url: "images/captcha/captcha5.jpg", valor: "centuries"},
    ]

    await Promise.all(this.imagenes.map(src => cargarImagen(src.url)));
  }
}
