import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { DatabaseUsersService } from '../../services/database-users.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { Especialista } from '../../classes/especialista';
import { TurnoService } from '../../services/turno.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EstadoTurnoPipe } from '../../pipes/estado-turno.pipe';
import { FormatoHoraPipe } from '../../pipes/formato-hora.pipe';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FormErrorsComponent } from '../form-errors/form-errors.component';
import { SoloNumerosDirective } from '../../directives/solo-numeros.directive';

@Component({
  selector: 'app-mis-turnos',
  imports: [NavbarComponent, FormsModule, EstadoTurnoPipe, FormatoHoraPipe, DatePipe, ReactiveFormsModule, FormErrorsComponent, SoloNumerosDirective, TitleCasePipe],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.css'
})
export class MisTurnosComponent implements OnInit{
  auth = inject(AuthService);
  db = inject(DatabaseUsersService);
  turnoService = inject(TurnoService);

  cargando: boolean = true;
  perfil!: string;
  id_especialista!: string;
  id_paciente!: string;
  turnosTotales: any[] = [];
  turnos: any[] = [];
  turnosFiltrados : any[] = [];

  filtro: string = "";
  placeholder: string = "";
  verComentarioBool: {[id_turno: number]: boolean} = {};
  atencionCalificada: boolean = false;
  completarEncuesta: {[id_turno: number]: boolean} = {};
  mostrarComentario: {[id_turno: number]: boolean} = {};
  comentario_value: {[id_turno: number]: string} = {};
  eleccionPendiente: {[id_turno: number]: string} = {};

  datosAdicionales: {clave: string, valor: string}[] = [];

  async ngOnInit() {
    const usuario = await this.auth.getUsuarioActual();
    try {
      if(usuario) {
      const email = usuario.email;
      const user = await this.db.listarUsuariosPorEmail(email!);

      if(user) {
        this.perfil = user[0].perfil;

        if(user[0] instanceof Especialista) {
          this.id_especialista = String(user[0].id_especialista);
          this.turnosTotales = await this.turnoService.listarTurnosEspecialista(this.id_especialista);

          for(const turno of this.turnosTotales) {
            this.verComentarioBool[turno.id_turno] = false;
            const paciente = ((await this.db.listarUsuariosPorIdPaciente(turno.id_paciente))[0]);
            const turnoUser = {
              id_turno: turno.id_turno,
              fecha: turno.fecha,
              hora: turno.hora,
              pacienteApellido: paciente.apellido,
              especialidad: turno.especialidad,
              estado: turno.estado,
              comentario_paciente: turno.comentario_paciente,
              comentario_especialista: turno.comentario_especialista,
              historia_clinica: turno.historia_clinica
            }
            this.turnos.push(turnoUser);
            this.turnosFiltrados.push(turnoUser);
          }
        
        } else {
          this.id_paciente = String(user[0].id_paciente);
          this.turnosTotales = await this.turnoService.listarTurnosPaciente(this.id_paciente);

          for(const turno of this.turnosTotales) {
            this.verComentarioBool[turno.id_turno] = false;
            this.completarEncuesta[turno.id_turno] = false;
            const especialista = ((await this.db.listarUsuariosPorIdEspecialista(turno.id_especialista))[0]);
            const turnoUser = {
              id_turno: turno.id_turno,
              fecha: turno.fecha,
              hora: turno.hora,
              especialistaApellido: especialista.apellido,
              especialidad: turno.especialidad,
              estado: turno.estado,
              comentario_paciente: turno.comentario_paciente,
              comentario_especialista: turno.comentario_especialista,
              encuesta: turno.encuesta,
              historia_clinica: turno.historia_clinica
            }
            this.turnos.push(turnoUser);
            this.turnosFiltrados.push(turnoUser);
          }
        }
      } else {
        this.perfil = "Error";
    }
    } else {
      this.perfil = "Error";
    }
    } finally {
      this.cargando = false;
    }
  }

  filtrarTurnos() {
    const filtrado = this.filtro.trim().toLowerCase();

    this.turnos = this.turnosFiltrados.filter(t => {
      const historial = t.historia_clinica;

      const hayHistorial = historial ? (
        historial.altura?.toLowerCase().includes(filtrado) ||
        historial.peso?.toLowerCase().includes(filtrado) ||
        historial.temperatura?.toLowerCase().includes(filtrado) ||
        historial.presion?.toLowerCase().includes(filtrado)
      ) : false;

      const hayDatosAdicionales = historial?.datosAdicionales?.some((dato: any) =>
        dato.clave?.toLowerCase().includes(filtrado) ||
        dato.valor?.toLowerCase().includes(filtrado)
      ) ?? false;

      if(this.perfil === "Especialista") {
        return (t.pacienteApellido.toLowerCase().includes(filtrado) ||
                t.especialidad.toLowerCase().includes(filtrado) ||
                hayHistorial ||
                hayDatosAdicionales
        );
      } else {
        return (t.especialistaApellido.toLowerCase().includes(filtrado) ||
                t.especialidad.toLowerCase().includes(filtrado) ||
                hayHistorial ||
                hayDatosAdicionales
        );
      }
    });
  }

  mostrarComentarioPara(turno: any, eleccion: string) {
    this.mostrarComentario[turno.id_turno] = true;
    this.eleccionPendiente[turno.id_turno] = eleccion;
    this.comentario_value[turno.id_turno] = "";
    if(eleccion === "Realizado") {
      this.placeholder = "Escriba su comentario aquí...";
    } else if(eleccion === "Rechazado") {
      this.placeholder = "Escriba los motivos del rechazo del turno aquí...";
    } else if(eleccion === "Cancelado") {
      this.placeholder = "Escriba los motivos de la cancelación del turno aquí...";
    }
  }

  async aceptarTurno(turno: any) {
      const turnoModificado = {
      idTurno: turno.id_turno,
      fecha: turno.fecha,
      hora: turno.hora,
      especialidad: turno.especialidad,
      estado: "Aceptado",
      comentario_especialista: "",
      comentario_paciente: ""
    }

    const modificacion = await this.turnoService.modificarTurno(turnoModificado);

    if(modificacion) {
      turno.estado = "Aceptado";
    }
  }

  async enviarComentario(turno: any, paciente?: string) {
    if(paciente === "Paciente") {
      const texto_paciente = this.comentario_value[turno.id_turno];
      const nuevoEstado = this.eleccionPendiente[turno.id_turno];

      if(!texto_paciente || !nuevoEstado) return;

      const turnoModificado = {
        idTurno: turno.id_turno,
        fecha: turno.fecha,
        hora: turno.hora,
        especialidad: turno.especialidad,
        estado: nuevoEstado,
        comentario_especialista: turno.comentario_especialista,
        comentario_paciente: texto_paciente
      }

      const modificacion = await this.turnoService.modificarTurno(turnoModificado);

      if(modificacion) {
        turno.estado = nuevoEstado;
        turno.comentario_paciente = texto_paciente;
        this.mostrarComentario[turno.id_turno] = false;
        this.eleccionPendiente[turno.id_turno] = "";
      }

    } else {
      const texto_especialista = this.comentario_value[turno.id_turno];
      const nuevoEstado = this.eleccionPendiente[turno.id_turno];

      if(!texto_especialista || !nuevoEstado) return;

      const turnoModificado = {
        idTurno: turno.id_turno,
        fecha: turno.fecha,
        hora: turno.hora,
        especialidad: turno.especialidad,
        estado: nuevoEstado,
        comentario_especialista: texto_especialista,
        comentario_paciente: turno.comentario_paciente
      }

      const modificacion = await this.turnoService.modificarTurno(turnoModificado);

      if(modificacion) {
        turno.estado = nuevoEstado;
        turno.comentario_especialista = texto_especialista;
        this.mostrarComentario[turno.id_turno] = false;
        this.eleccionPendiente[turno.id_turno] = "";
      }
    }
  }

  verComentario(idTurno: number) {
    this.verComentarioBool[idTurno] = !this.verComentarioBool[idTurno];
  }

  encuesta = new FormGroup({
    atencion: new FormControl("", {
      validators: [Validators.required]
    }),
    plataforma: new FormControl("", {
      validators: [Validators.required]
    }),
    tardanza: new FormControl("", {
      validators: [Validators.required]
    }),
  })

  mostrarEncuesta(idTurno: number) {
    this.completarEncuesta[idTurno] = true;
  }

  async enviarEncuesta(turno: any) {
    const idTurno = Number(turno.id_turno);
    const atencion = String(this.encuesta.controls.atencion.value);
    const plataforma = String(this.encuesta.controls.plataforma.value);
    const tardanza = String(this.encuesta.controls.tardanza.value);

    const encuesta = [atencion, plataforma, tardanza];

    const respuesta = await this.turnoService.implementarEncuesta(idTurno, encuesta);

    if(respuesta) {
      turno.encuesta = encuesta;
      this.completarEncuesta[idTurno] = false;
    }
  }

    datosClinicos = new FormGroup({
    altura: new FormControl("", {
      validators: [
        Validators.minLength(2),
        Validators.pattern("^[0-9]+$"),
        Validators.required
      ],
    }),
    peso: new FormControl("", {
      validators: [
        Validators.pattern("^[0-9]+$"),
        Validators.required
      ]
    }),
    temperatura: new FormControl("", {
      validators: [
        Validators.minLength(2),
        Validators.pattern("^[0-9]+(\\.[0-9]+)?$"),
        Validators.required
      ]
    }),
    presion: new FormControl("", {
      validators: [
        Validators.pattern("^[0-9]+$"),
        Validators.required
      ]
    }),
  })

  agregarDatoAdicional() {
    if(this.datosAdicionales.length < 3) {
      this.datosAdicionales.push({clave: "", valor: ""});
    }
  }

  eliminarDatoAdicional(dato: any) {
    this.datosAdicionales.splice(dato, 1);
  }

  eliminarCaracteresEspeciales(texto: string) {
    const textoSinCaracteresEspeciales = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return textoSinCaracteresEspeciales.replace(/[^a-zA-Z0-9 ñÑ]/g, "");
  }

  async enviarDatosClinicos(turno: any) {
    const datosAdicionalesFiltrados = this.datosAdicionales.
    filter(dato => dato.clave.trim() !== "" && dato.valor.trim() !== "")
    .map(dato => ({clave: this.eliminarCaracteresEspeciales(dato.clave.trim().toLowerCase()), valor: this.eliminarCaracteresEspeciales(dato.valor.trim().toLowerCase())}));

    const datoTemporal: Record<string, string> = {};
    for(const dato of datosAdicionalesFiltrados) {
      datoTemporal[dato.clave] = dato.valor;
    }

    const datosSinDuplicados = Object.entries(datoTemporal).map(([clave, valor]) => ({clave, valor}));

    const historiaClinica = {
      altura: String(this.datosClinicos.controls.altura.value).trim().toLowerCase(),
      peso: String(this.datosClinicos.controls.peso.value).trim().toLowerCase(),
      temperatura: String(this.datosClinicos.controls.temperatura.value).trim().toLowerCase(),
      presion: String(this.datosClinicos.controls.presion.value).trim().toLowerCase(),
      datosAdicionales: datosSinDuplicados
    }

    const guardado = await this.turnoService.agregarHistorialClinico(turno.id_turno, historiaClinica);

    if(guardado) {
      turno.historia_clinica = historiaClinica;
      this.datosClinicos.reset();
      this.datosAdicionales = [];
    }
  }
}