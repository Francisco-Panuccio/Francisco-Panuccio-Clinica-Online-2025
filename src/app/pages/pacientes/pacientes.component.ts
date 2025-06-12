import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { TurnoService } from '../../services/turno.service';
import { DatabaseUsersService } from '../../services/database-users.service';
import { Especialista } from '../../classes/especialista';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FormatoHoraPipe } from '../../pipes/formato-hora.pipe';
import { EstadoTurnoPipe } from '../../pipes/estado-turno.pipe';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-pacientes',
  imports: [NavbarComponent, TitleCasePipe, FormatoHoraPipe, DatePipe, EstadoTurnoPipe],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.css'
})
export class PacientesComponent implements OnInit{
  auth = inject(AuthService);
  db = inject(DatabaseUsersService);
  turnosDB = inject(TurnoService);
  storage = inject(StorageService);

  cargando: boolean = true;
  idEspecialista: number | undefined = undefined;
  idPaciente: number | undefined = undefined;
  turnosEspecialista: any[] = [];
  pacienteActualID: number = 0;
  pacientes: any[] = [];
  pacientesSet = new Set<number>();
  dataExpandida: Set<number> = new Set();
  turnosPorPaciente: Record<number, any[]> = {};
  habilitarDataExtra: number | null = null;

  fotosPacientes: Record<string, string> = {};
  fotoPerfilDefault: string = "images/turno/foto_perfil_default.png";

  async ngOnInit() {
    const usuario = await this.auth.getUsuarioActual();
    try {
      if(usuario) {
        const email = usuario.email;
        const user = await this.db.listarUsuariosPorEmail(email!);
        if(user && user[0] instanceof Especialista) {
          this.idEspecialista = user[0].id_especialista;
          this.turnosEspecialista = await this.turnosDB.listarTurnosEspecialista(String(this.idEspecialista));

          for(const turno of this.turnosEspecialista) {
            const paciente = await this.db.listarUsuariosPorIdPaciente(turno.id_paciente);
            
            if (!this.pacientesSet.has(turno.id_paciente)) {
              this.pacientesSet.add(turno.id_paciente);
              this.pacientes.push(paciente[0]);
            }
          }

          this.cargarImagenesPacientes();
      }  } 
    } finally {
      this.cargando = false;
    }
  }

  mostrarData(idPaciente: any) {
    if(this.dataExpandida.has(idPaciente)) {
      this.dataExpandida.delete(idPaciente);
    } else {
      this.dataExpandida.add(idPaciente);
      const turnos = this.turnosEspecialista.filter(t => t.id_paciente === idPaciente);
      this.turnosPorPaciente[idPaciente] = turnos;
    }
  }

  habilitarData(idPaciente: any) {
    if (this.habilitarDataExtra === idPaciente) {
      this.habilitarDataExtra = null;
      this.pacienteActualID = 0;
    } else {
      this.habilitarDataExtra = idPaciente;
      this.pacienteActualID = idPaciente;
    }
  }

  async cargarImagenesPacientes() {
    for(const paciente of this.pacientes) {
      try {
        const urls = await this.storage.listarArchivosPorEmail(paciente.email);
        if(urls.length > 0) {
          this.fotosPacientes[paciente.email] = urls[0];
        } else {
          this.fotosPacientes[paciente.email] = this.fotoPerfilDefault;
        }
      } catch {
        this.fotosPacientes[paciente.email] = this.fotoPerfilDefault;
      }
    }
  }
}
