import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { DatabaseUsersService } from '../../services/database-users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css'
})
export class LoadingComponent implements OnInit{
  db = inject(DatabaseUsersService)
  auth = inject(AuthService);
  router = inject(Router);

  ngOnInit() {
    if(this.auth.usuario_actual === null) {
      this.router.navigateByUrl("login");
      return;
    } 

    const userEmail = this.auth.usuario_actual.email;
    if(!userEmail) {
      this.router.navigateByUrl("login");
      return;
    } else {
      this.cargando(userEmail);
    }
  }

  async cargando(email: string) {
    const intervalo = setInterval(async () => {
      const user = await this.db.listarUsuariosPorEmail(email);
      if(user && user[0].perfil === "Especialista") {
        this.router.navigateByUrl("estado");
      } else if(user) {
        this.router.navigateByUrl("home");
      }
      clearInterval(intervalo);
    }, 1000)
  }
}
