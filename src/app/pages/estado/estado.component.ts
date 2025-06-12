import { Component, inject, OnInit } from '@angular/core';
import { DatabaseUsersService } from '../../services/database-users.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-estado',
  imports: [],
  templateUrl: './estado.component.html',
  styleUrl: './estado.component.css'
})
export class EstadoComponent implements OnInit{
  auth = inject(AuthService);
  db = inject(DatabaseUsersService);

  estado: any;
   
  async ngOnInit() {
    const email = localStorage.getItem("estado_email");
    if(email) {
      const user = await this.db.listarUsuariosPorEmail(email);
      if(user && "estado" in user[0]) {
        this.estado = user[0].estado;
        await this.auth.cerrarSesionInhabilitada();
      }
    }
    localStorage.removeItem("estado_email");
  }
}
