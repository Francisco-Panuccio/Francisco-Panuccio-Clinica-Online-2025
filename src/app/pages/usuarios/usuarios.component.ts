import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { DatabaseUsersService } from '../../services/database-users.service';
import { Especialista } from '../../classes/especialista';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { FormErrorsComponent } from '../form-errors/form-errors.component';
import { Administrador } from '../../classes/administrador';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { CaptchaComponent } from '../captcha/captcha.component';
import { StorageService } from '../../services/storage.service';
import { FormatoDNIPipe } from '../../pipes/formato-dni.pipe';
import { TurnoService } from '../../services/turno.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule, ReactiveFormsModule, FormErrorsComponent, NavbarComponent, CaptchaComponent, FormatoDNIPipe],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit{
  auth = inject(AuthService);
  db = inject(DatabaseUsersService);
  router = inject(Router);
  storage = inject(StorageService);
  turnosDB = inject(TurnoService);

  usuarios: any = [];
  archivosSeleccionados: File[] = [];
  registrarAdmins: boolean = false; 
  isPasswordVisible: boolean = false;
  usuarioRegistrado: boolean = false;
  cargando: boolean = true;
  captcha_resuelto: boolean = false;
  turnos: any[] = [];
  dataExpandida: Set<number> = new Set();
  pacientes: any[] = [];
  pacientesSet = new Set<number>();
  descargandoExcel: boolean = false;
  
  fotosUsuarios: Record<string, string> = {};
  fotoPerfilDefault: string = "images/turno/foto_perfil_default.png";


  @ViewChild(CaptchaComponent) captchaComponent!: CaptchaComponent;

  formulario = new FormGroup({
    nombre: new FormControl("", {
      validators: [
        this.patternString(),
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.required
      ]
    }),
    apellido: new FormControl("", {
      validators: [
        this.patternString(),
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.required
      ]
    }),
    edad: new FormControl("", {
      validators: [
        Validators.minLength(1),
        Validators.maxLength(3),
        Validators.pattern("^[0-9]+$"),
        this.validarEdad(),
        Validators.required
      ]
    }),
    dni: new FormControl("", {
      validators: [
        this.patternDni(),
        Validators.required
      ]
    }),
    email: new FormControl("", {
      validators: [
        Validators.email,
        Validators.required
      ]
    }),
    contrasena: new FormControl("", {
      validators: [
        Validators.minLength(6),
        Validators.maxLength(20),
        Validators.required
      ]
    }),
    archivo: new FormControl("", {
      validators: [
        Validators.required
      ]
    }),
  })

  patternDni() {
    const regex = /^[0-9]{8}$/;
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && !regex.test(control.value)) {
        return { patterndni: true }
      }
      return null;
    }
  }

  patternString() {
    const regex = /^[\p{L}]+$/u;
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && !regex.test(control.value)) {
        return { patternstring: true }
      }
      return null;
    }
  }

  validarEdad() {
    return (control: AbstractControl): ValidationErrors | null => {
      if(control.value === null || control.value === undefined || isNaN(control.value)) {
        return null;
      }
      const edad = Number(control.value);
      if(edad < 18 || edad > 110) {
        return {edadInvalida: true};
      }
      return null;
    }
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  async ngOnInit() {
    try {
      this.usuarios = await this.db.listarUsuarios();
      this.formulario.controls.email.valueChanges.subscribe(() => {
        this.usuarioRegistrado = false;
      })

      this.turnos = await this.turnosDB.listarTurnos();

      for(const turno of this.turnos) {
        const paciente = await this.db.listarUsuariosPorIdPaciente(turno.id_paciente);
        
        if (!this.pacientesSet.has(turno.id_paciente)) {
          this.pacientesSet.add(turno.id_paciente);
          this.pacientes.push(paciente[0]);
        }
      }

      this.cargarImagenesUsuarios();
    } finally {
      this.cargando = false;
    }
  }

  async habilitacionEspecialista(decision: string, id: number) {
    const especialista = this.usuarios.find((u: { id_especialista: number; }) => u.id_especialista === id);

    const id_usuario = especialista.id;
    const nombre = especialista.nombre;
    const apellido = especialista.apellido;
    const edad = especialista.edad;
    const dni = especialista.dni;
    const email = especialista.email;
    const perfil = especialista.perfil;
    const especialidades = especialista.especialidades;
    const estado = decision;

    const especialistaModificado = new Especialista(nombre, apellido, edad, dni, email, perfil, especialidades, estado, id_usuario);

    const resultado = await this.db.modificarUsuario(especialistaModificado);
    if(resultado) {
      const index = this.usuarios.findIndex((u: { id_especialista: number; }) => u.id_especialista === id);
      if(index !== -1) this.usuarios[index].estado = decision;
    }
  }

  capitalizarDatos(texto: string) {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  }

  onCambioDeArchivo(evento: Event) {
    const input = evento.target as HTMLInputElement;
    if(input.files && input.files.length > 0) {
      this.archivosSeleccionados = Array.from(input.files);
    }
  }

  mostrarData(idUsuario: any) {
    if(this.dataExpandida.has(idUsuario)) {
      this.dataExpandida.delete(idUsuario);
    } else {
      this.dataExpandida.add(idUsuario);
    }
  }
  
  async cargarImagenesUsuarios() {
    for(const usuario of this.usuarios) {
      try {
        const urls = await this.storage.listarArchivosPorEmail(usuario.email);
        if(urls.length > 0) {
          this.fotosUsuarios[usuario.email] = urls[0];
        } else {
          this.fotosUsuarios[usuario.email] = this.fotoPerfilDefault;
        }
      } catch {
        this.fotosUsuarios[usuario.email] = this.fotoPerfilDefault;
      }
    }
  }

  registrarAdmin() {
    const nombre = this.capitalizarDatos(this.formulario.controls.nombre.value!);
    const apellido = this.capitalizarDatos(this.formulario.controls.apellido.value!);
    const edad = this.formulario.controls.edad.value!;
    const dni = this.formulario.controls.dni.value!;
    const email = this.formulario.controls.email.value!.toLowerCase();
    const contraseña = this.formulario.controls.contrasena.value!;
    const perfil = "Administrador";
    let fotos: string[] = [];

    if(this.archivosSeleccionados.length !== 1) {
      this.formulario.controls.archivo.setErrors({fotoUnica: true});
      return;
    }

    this.captcha_resuelto = this.captchaComponent.resolverCaptcha();
    if(!this.captcha_resuelto) {return;}

    this.auth.crearCuenta(email, contraseña).then(async ({ data, error }) => {
      if (!(data.user && data.session)) {
        this.usuarioRegistrado = true;
        return;
      }

      const user = await this.storage.guardarArchivos(email, this.archivosSeleccionados);
      fotos = user.fotos;
      
      const nuevoAdministrador = new Administrador(nombre, apellido, Number(edad), Number(dni), email, perfil, undefined, undefined, fotos);
      this.db.crearUsuario(nuevoAdministrador).then(() => {
        this.db.listarUsuarios().then((usuariosActualizados) => {
          this.usuarios = usuariosActualizados;
          this.formulario.reset();
          this.registrarAdmins = false;
        })
      });
    })
  }

  async descargarExcel(usuarioSeleccionado: any) {
    if(this.descargandoExcel) return;
    this.descargandoExcel = true;

    try {
      const base = {
        Nombre: usuarioSeleccionado.nombre,
        Apellido: usuarioSeleccionado.apellido,
        Perfil: usuarioSeleccionado.perfil
      }
  
      const turnosUsuario = this.turnos.filter(t => t.id_paciente === usuarioSeleccionado.id_paciente);
      for(const turno of turnosUsuario) {
        const especialista = await this.db.listarUsuariosPorIdEspecialista(Number(turno.id_especialista));
        turno.nombreCompletoEspecialista = `${especialista[0].nombre} ${especialista[0].apellido}`;
      }
  
      const datosTurnos = turnosUsuario.map(turno => ({
        Fecha: turno.fecha,
        Hora: turno.hora,
        Especialidad: turno.especialidad,
        Especialista: turno.nombreCompletoEspecialista,
        Estado: turno.estado,
        Altura: turno.historia_clinica?.altura ?? 'No Registrado',
        Peso: turno.historia_clinica?.peso ?? 'No Registrado',
        Temperatura: turno.historia_clinica?.temperatura ?? 'No Registrado',
        Presión: turno.historia_clinica?.presion ?? 'No Registrado',
        DatosAdicionales: (turno.historia_clinica?.datosAdicionales || []).map((dato: any) => `${dato.clave}: ${dato.valor}`).join(', ')
      }));
  
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosTurnos.length ? datosTurnos : [{
        Mensaje: `El usuario ${base.Nombre} ${base.Apellido} de tipo "${base.Perfil}" no tiene turnos registrados`
      }]);
      const workbook: XLSX.WorkBook = {
        Sheets: {"Usuario": worksheet},
        SheetNames: ["Usuario"]
      };
  
      const excelBuffer: any = XLSX.write(workbook, {bookType: "xlsx", type: "array"});
      const blob = new Blob([excelBuffer], {type: "application/octet-stream"});
      FileSaver.saveAs(blob, `Usuario_${base.Nombre}_${base.Apellido}.xlsx`);
    } catch(error) {
      console.log("Error en la Descarga del Excel: " + error);
    } finally {
      this.descargandoExcel = false;
    }
  }
}
