import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseUsersService } from '../../services/database-users.service';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { LogsService } from '../../services/logs.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  auth = inject(AuthService);
  router = inject(Router);
  db = inject(DatabaseUsersService);
  storage = inject(StorageService);
  logsDB = inject(LogsService);

  isPasswordVisible: boolean = false;
  menuOpen: boolean = false;
  menuVisible: boolean = false;
  iSesion: boolean = false;
  estado: any;
  email: string = "";
  clave: string = "";

  admin: string = "";
  especialistaUno: string = "";
  especialistaDos: string = "";
  pacienteUno: string = "";
  pacienteDos: string = "";
  pacienteTres: string = "";

  async ngOnInit() {
    this.admin = (await this.storage.listarArchivosPorEmail("franciscopanuccio@hotmail.com"))[0];
    this.especialistaUno = (await this.storage.listarArchivosPorEmail("brian@gmail.com"))[0];
    this.especialistaDos = (await this.storage.listarArchivosPorEmail("nicole@gmail.com"))[0];
    this.pacienteUno = (await this.storage.listarArchivosPorEmail("gustavo@gmail.com"))[0];
    this.pacienteDos = (await this.storage.listarArchivosPorEmail("fernando@gmail.com"))[0];
    this.pacienteTres = (await this.storage.listarArchivosPorEmail("julian@gmail.com"))[0];
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleMenu() {
    const fabBtn = document.querySelector(".fab-btn");
    if(!fabBtn) return;

    if(!this.menuOpen) {
      fabBtn.classList.remove('closing');
      fabBtn.classList.add('active');
      this.menuVisible = true;
      this.menuOpen = true;
    } else {
      fabBtn.classList.remove('active');
      fabBtn.classList.add('closing');
      this.menuOpen = false;

      setTimeout(() => {
      this.menuVisible = false;
      }, 400);
    }

    const onAnimationEnd = () => {
      fabBtn.classList.remove('closing');
      fabBtn.removeEventListener('animationend', onAnimationEnd);
    };
    fabBtn.addEventListener('animationend', onAnimationEnd);
  }

  loguearse(correo:string, contraseña:string) {
    this.auth.iniciarSesion(correo, contraseña).then(async ({ data, error }) => {
      if(data.user === null){
        this.iSesion = true;
      } else {
        const user = await this.db.listarUsuariosPorEmail(correo);
        if(user && "estado" in user[0]) {
          this.estado = user[0].estado;

          if(this.estado === "Pendiente" || this.estado === "Inhabilitado") {
            localStorage.setItem("estado_email", correo);
            this.router.navigateByUrl("estado");
            return;
          }
        }
        this.logsDB.crearLog(correo);
        this.router.navigateByUrl("home");
      }
    });
  }
}
