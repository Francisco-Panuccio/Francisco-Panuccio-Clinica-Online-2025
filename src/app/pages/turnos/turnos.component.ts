import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { TurnoService } from '../../services/turno.service';
import { DatabaseUsersService } from '../../services/database-users.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { FormatoHoraPipe } from '../../pipes/formato-hora.pipe';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { EstadoTurnoPipe } from '../../pipes/estado-turno.pipe';

@Component({
  selector: 'app-turnos',
  imports: [NavbarComponent, FormsModule, FormatoHoraPipe, DatePipe, EstadoTurnoPipe, TitleCasePipe],
  templateUrl: './turnos.component.html',
  styleUrl: './turnos.component.css'
})
export class TurnosComponent implements OnInit{
  auth = inject(AuthService);
  db = inject(DatabaseUsersService);
  turnoService = inject(TurnoService);

  cargando: boolean = true;
  turnosTotales: any[] = [];
  turnos: any[] = [];
  turnosFiltrados : any[] = [];

  filtro: string = "";
  verComentarioBool: boolean = false;
  mostrarComentario: {[id_turno: number]: boolean} = {};
  comentario_value: {[id_turno: number]: string} = {};
  eleccionPendiente: {[id_turno: number]: string} = {};

  async ngOnInit() {
    try {
      this.turnosTotales = await this.turnoService.listarTurnos();

      for(const turno of this.turnosTotales) {
        const especialista = ((await this.db.listarUsuariosPorIdEspecialista(turno.id_especialista))[0]);
        const turnoUser = {
          id_turno: turno.id_turno,
          fecha: turno.fecha,
          hora: turno.hora,
          especialistaApellido: especialista.apellido,
          especialidad: turno.especialidad,
          estado: turno.estado,
          comentario_especialista: turno.comentario_especialista,
          comentario_paciente: turno.comentario_paciente
        }
        this.turnos.push(turnoUser);
        this.turnosFiltrados.push(turnoUser);
      }
    } finally {
      this.cargando = false;
    }
  }

  filtrarTurnos() {
    const filtrado = this.filtro.trim().toLowerCase();
    this.turnos = this.turnosFiltrados.filter(t => t.especialistaApellido.toLowerCase().includes(filtrado) || t.especialidad.toLowerCase().includes(filtrado));
  }

  mostrarComentarioPara(turno: any, eleccion: string) {
    this.mostrarComentario[turno.id_turno] = true;
    this.eleccionPendiente[turno.id_turno] = eleccion;
    this.comentario_value[turno.id_turno] = "";
  }

  async enviarComentario(turno: any) {
    const texto = this.comentario_value[turno.id_turno];
    const nuevoEstado = this.eleccionPendiente[turno.id_turno];

    if(!texto || !nuevoEstado) return;

    const turnoModificado = {
      idTurno: turno.id_turno,
      fecha: turno.fecha,
      hora: turno.hora,
      especialidad: turno.especialidad,
      estado: nuevoEstado,
      comentario_especialista: texto,
      comentario_paciente: turno.comentario_paciente
    }

    const modificacion = await this.turnoService.modificarTurno(turnoModificado);

    if(modificacion) {
      turno.estado = nuevoEstado;
      turno.comentario_especialista = texto;
      this.mostrarComentario[turno.id_turno] = false;
      this.eleccionPendiente[turno.id_turno] = "";
    }
  }

  verComentario() {
    this.verComentarioBool = !this.verComentarioBool;
  }
}
