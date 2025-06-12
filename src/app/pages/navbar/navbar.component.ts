import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { DatabaseUsersService } from '../../services/database-users.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
  auth = inject(AuthService);
  db = inject(DatabaseUsersService);

  isMenuOpen: boolean = false;
  perfil!: string;
  perfilCargado: boolean = false;

  async ngOnInit() {
    const usuario = await this.auth.getUsuarioActual();
    try {
      if(usuario) {
        const email = usuario.email;
        const user = await this.db.listarUsuariosPorEmail(email!);
        if(user) {
          this.perfil = user[0].perfil;
        }
      }
    } catch(error) {
      console.log(error);
    } finally {
      this.perfilCargado = true;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  salir() {
    this.auth.cerrarSesion();
  }
}
