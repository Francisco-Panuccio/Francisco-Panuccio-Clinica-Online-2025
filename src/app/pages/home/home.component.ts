import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from "../navbar/navbar.component";
import { DatabaseUsersService } from '../../services/database-users.service';

@Component({
  selector: 'app-home',
  imports: [NavbarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  auth = inject(AuthService);
  db = inject(DatabaseUsersService);
  
  indice = 0;
  animando = false;
  direccionAnimacion: 'izq' | 'der' | null = null;
  imagenes!: string[];
  perfil!: string;
  nombre!: string;
  cargando: boolean = true;

  async ngOnInit() {
    this.imagenes = ["images/home/medicos.jpg"];
    this.precargaDeImagenes();

    const usuario = await this.auth.getUsuarioActual();

    if(usuario) {
      const email = usuario.email;
      try {
        const user = await this.db.listarUsuariosPorEmail(email!);
        if(user) {
          this.perfil = user[0].perfil;
          this.nombre = user[0].nombre;
        } else {
          this.perfil = "Usuario";
          this.nombre = "NN";
        }
      } finally {
        this.cargando = false;
      }
    } else {
      this.perfil = "";
      this.nombre = "";
      this.cargando = false;
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
      "images/home/medicos.jpg",
      "images/home/medicos_2.jpg",
      "images/home/medicos_3.jpg",
      "images/home/medicos_4.jpg",
      "images/home/medicos_5.jpg",
    ]

    await Promise.all(this.imagenes.map(src => cargarImagen(src)));
  }

  moverCarrusel(direccion: number) {
    if (this.animando) return;
    this.animando = true;
    this.direccionAnimacion = direccion === -1 ? 'izq' : 'der';
    this.indice += direccion;
    if(this.indice < 0) this.indice = this.imagenes.length - 1;
    if(this.indice >= this.imagenes.length) this.indice = 0;
  }

  animacionTerminada() {
    this.animando = false;
    this.direccionAnimacion = null;
  } 
}
