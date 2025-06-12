import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DatabaseUsersService } from '../../services/database-users.service';
import { TurnoService } from '../../services/turno.service';
import { FormErrorsComponent } from '../form-errors/form-errors.component';
import { Router } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { FormatoHoraPipe } from '../../pipes/formato-hora.pipe';
import { MostrarEspecialidadDirective } from '../../directives/mostrar-especialidad.directive';

@Component({
  selector: 'app-solicitar-turno',
  imports: [NavbarComponent, FormsModule, ReactiveFormsModule, FormErrorsComponent, DatePipe, FormatoHoraPipe, MostrarEspecialidadDirective, TitleCasePipe],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css'
})
export class SolicitarTurnoComponent implements OnInit{
  auth = inject(AuthService);
  db = inject(DatabaseUsersService);
  router = inject(Router);
  turnosDB = inject(TurnoService);
  storage = inject(StorageService);

  especialidades: {especialidad: string, foto: string}[] = [];
  todosLosEspecialistas: any[] = [];
  especialistas: {id: number, nombreCompleto: string, email: string, fotoPerfil: string}[] = [];
  fotosEspecialistas: Record<string, string> = {};
  pacientes: {id: number, nombreCompleto: string}[] = [];
  usuarios: any = [];
  perfil!: string;
  pacienteId!: string;
  fechasDisponibles: string[] = [];
  horariosDisponibles: string[] = [];
  turnosTomados: any[] = [];
  cargando: boolean = true;
  cargaDeFechas: boolean = false;
  cargaDeHoras: boolean = false;

  fotoEspecialidadDefault: string = "images/turno/especialidad_default.png";
  fotoPerfilDefault: string = "images/turno/foto_perfil_default.png";

  formulario = new FormGroup({
    especialidad: new FormControl("", {
      validators: [Validators.required]
    }),
    especialista: new FormControl(0, {
      validators: [Validators.required]
    }),
    paciente: new FormControl("", {
      validators: [Validators.required]
    }),
    fecha: new FormControl("", {
      validators: [Validators.required]
    }),
    hora: new FormControl("", {
      validators: [Validators.required]
    }),
  });

  async ngOnInit() {
    const usuario = await this.auth.getUsuarioActual();
    try {
      if(usuario) {
        const email = usuario.email;
        const user = await this.db.listarUsuariosPorEmail(email!);
        this.perfil = user[0].perfil;
        if(this.perfil === "Paciente") {
          this.pacienteId = String((user[0] as any).id_paciente);
        }
      }

      if (this.perfil !== "Administrador") {
        this.formulario.controls.paciente.clearValidators();
        this.formulario.controls.paciente.updateValueAndValidity();
      }

      this.usuarios = await this.db.listarUsuarios();
    
      const especialidadesMap = new Map<string, {especialidad: string, foto: string}>();
      const pacientesMap = new Map<number, {id: number, nombreCompleto: string}>();

      this.usuarios.forEach((e: any)  => {
        if(e.perfil === "Especialista") {
          e.especialidades.forEach((el: any) => {
            if(!especialidadesMap.has(el)) {
              especialidadesMap.set(el, {especialidad: el.toLowerCase(), foto: `images/turno/${el.toLowerCase()}.png`});
            }
          });
        } else if (e.perfil === "Paciente") {
          pacientesMap.set(e.id_paciente, {id: e.id_paciente, nombreCompleto: `${e.nombre} ${e.apellido}`});
        }
      });

      this.especialidades = Array.from(especialidadesMap.values()).sort((a, b) => a.especialidad.localeCompare(b.especialidad));
      this.todosLosEspecialistas = this.usuarios.filter((u: any) => u.perfil === "Especialista" && u.estado === "Habilitado");
      this.filtrarEspecialistasPorEspecialidad(this.formulario.controls.especialidad.value!);

      this.pacientes = Array.from(pacientesMap.values()).sort((a, b) =>
        a.nombreCompleto.localeCompare(b.nombreCompleto));

      this.formulario.controls.especialidad.valueChanges.subscribe((especialidad) => {
        this.filtrarEspecialistasPorEspecialidad(especialidad!);
        this.resetearCampos(['especialista', 'fecha', 'hora']);
        this.fechasDisponibles = [];
        this.horariosDisponibles = [];
      });

      this.formulario.controls.especialista.valueChanges.subscribe(async especialistaId => {
        if(especialistaId && especialistaId !== 0) {
          await this.seleccionarEspecialista(especialistaId);
          this.resetearCampos(['fecha', 'hora']);
          this.horariosDisponibles = [];
        } else {
          this.resetearCampos(['fecha', 'hora']);
          this.fechasDisponibles = [];
          this.horariosDisponibles = [];
        }
      });

      this.formulario.controls.fecha.valueChanges.subscribe(fecha => {
        if(fecha) {
          this.resetearCampos(['hora']);
          this.obtenerHorariosDisponibles(fecha!);
        } else {
          this.horariosDisponibles = [];
        }
      })
    } finally {
      this.cargando = false;
    }
  }

  async seleccionarEspecialista(id: number) {
    this.cargaDeFechas = true;
    this.fechasDisponibles = [];

    try {
      this.turnosTomados = await this.turnosDB.listarTurnosEspecialista(String(id));
      const especialista = this.todosLosEspecialistas.find(e => e.id_especialista === id);

      if(especialista) {
        const dias = this.obtenerDiasDisponibles(especialista).filter(dia => {
          const turnosEnElDia = this.turnosTomados.filter(t => t.fecha === dia);
          return turnosEnElDia.length < (especialista.horas_laborables?.length || 8);
        });
        this.fechasDisponibles = dias;
      }
    } catch(error) {
      this.fechasDisponibles = [];
    } finally {
      this.cargaDeFechas = false;
    }
  }

  filtrarEspecialistasPorEspecialidad(especialidad: string) {
    if (!especialidad) {
      this.especialistas = [];
      return;
    }

    this.especialistas = this.todosLosEspecialistas
    .filter((especialista: any) => especialista.especialidades
    .some((e: string) => e.toLowerCase() === especialidad.toLowerCase()))
    .map((e: any) => ({
      id: e.id_especialista,
      nombreCompleto: `${e.nombre} ${e.apellido}`,
      email: e.email,
      fotoPerfil: this.fotoPerfilDefault
    }))
    .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));

    this.cargarImagenesEspecialistas();

    const especialistaActualId = String(this.formulario.controls.especialista.value);
    const validez = this.especialistas.some(e => String(e.id) === String(especialistaActualId));
    if (!validez) {
      this.resetearCampos(['especialista']);
    }
  }

  async cargarImagenesEspecialistas() {
    for(const esp of this.especialistas) {
      try {
        const urls = await this.storage.listarArchivosPorEmail(esp.email);
        if(urls.length > 0) {
          this.fotosEspecialistas[esp.email] = urls[0];
        } else {
          this.fotosEspecialistas[esp.email] = this.fotoPerfilDefault;
        }
      } catch {
        this.fotosEspecialistas[esp.email] = this.fotoPerfilDefault;
      }
    }
  }

  obtenerDiasDisponibles(especialista: any) {
    const fechas = [];
    const fechaActual = new Date();
    const diasDisponibles = especialista.dias_laborables || [];

    for(let i = 0; i <= 15; i++) {
      const fecha = new Date(fechaActual);
      fecha.setDate(fecha.getDate() + i);

      const diaSemana = fecha.toLocaleDateString("es-Es", {weekday: "long"}).toLowerCase();
      if(diasDisponibles.map((d:any) => d.toLowerCase()).includes(diaSemana)) {
        fechas.push(fecha.toISOString().slice(0,10));
      }
    }

    return fechas;
  }

  obtenerHorariosDisponibles(fechaConsulta: string) {
    this.cargaDeHoras = true;

    const especialistaId = this.formulario.controls.especialista.value;
    if(!especialistaId || especialistaId === 0) {
      this.horariosDisponibles = [];
      this.cargaDeHoras = false;
      return;
    }

    const especialista = this.todosLosEspecialistas.find(e => e.id_especialista === especialistaId);
    if(!especialistaId) {
      this.horariosDisponibles = [];
      this.cargaDeHoras = false;
      return;
    };

    const turnosElegidos = this.turnosTomados
    .filter(t => t.fecha === fechaConsulta && String(t.id_especialista) === String(especialistaId))
    .map(t => t.hora);

    const horasDisponibels = especialista.horas_laborables || [];
    this.horariosDisponibles = horasDisponibels.filter((hora: any) => !turnosElegidos.includes(hora));
    this.cargaDeHoras = false;
  }

  resetearCampos(campos: (keyof typeof this.formulario.controls)[]) {
    campos.forEach(campo => {
      let valorReset: any = "";
      if (campo === "especialista") valorReset = 0;
      this.formulario.controls[campo].setValue(valorReset);
    });
  }

  async solicitarTurno() {
    if(this.perfil === "Administrador") {
      this.pacienteId = (this.formulario.controls.paciente.value)!;
    }

    const turno = {
      id_especialista: String(this.formulario.controls.especialista.value!),
      id_paciente: this.pacienteId,
      fecha: this.formulario.controls.fecha.value!,
      hora: this.formulario.controls.hora.value!,
      especialidad: this.formulario.controls.especialidad.value!,
      estado: "Pendiente",
      comentario_especialista: "",
      comentario_paciente: ""
    }

    try {
      await this.turnosDB.crearTurno(turno);
      const destino = this.perfil === "Administrador" ? "turnos" : "mis-turnos";
      this.router.navigateByUrl(destino);
    } catch(error) {
      console.log("Error con la Solicitud del Turno: ", error);
    }
  }
}
