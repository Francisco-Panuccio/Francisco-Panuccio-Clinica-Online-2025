import { Component, ElementRef, inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { FormErrorsComponent } from "../form-errors/form-errors.component";
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Paciente } from '../../classes/paciente';
import { Especialista } from '../../classes/especialista';
import { DatabaseUsersService } from '../../services/database-users.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, ReactiveFormsModule, FormErrorsComponent],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit {
  auth = inject(AuthService);
  router = inject(Router);
  db = inject(DatabaseUsersService);
  storage = inject(StorageService);

  usuario!: string;
  isPasswordVisible: boolean = false;
  inputsEsp: string[] = [];
  usuarioRegistrado: boolean = false;
  camposRepetidos: boolean = false;
  visualRegistro: boolean = true;

  archivosSeleccionados: File[] = [];

  @ViewChildren("inputExt") especialidadesInp!: QueryList<ElementRef>;

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
    obra_social: new FormControl("Sin Obra Social"),
    especialidades: new FormControl(""),
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

  agregarEspecialidad() {
    if (this.inputsEsp.length < 2) {
      this.inputsEsp.push("");
    }
  }

  eliminarEspecialidad(index: number) {
    this.inputsEsp.splice(index, 1);
  }

  actualizarEspecialidad(index: number, event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (input) {
      this.inputsEsp[index] = input.value;
    }
  }

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

  actualizarValidadoresDeEspecialidades() {
    const especialidadesControl = this.formulario.controls['especialidades'];
    if (this.usuario === 'Especialista') {
      especialidadesControl.setValidators([
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.required
      ])
    } else {
      especialidadesControl.clearValidators();
    }
    especialidadesControl.updateValueAndValidity();
  }

  quitarTildes(texto: string) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  capitalizarDatos(texto: string) {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  }

  ngOnInit() {
    this.formulario.controls.email.valueChanges.subscribe(() => {
      this.usuarioRegistrado = false;
    })

    this.formulario.controls.especialidades.valueChanges.subscribe(() => {
      this.camposRepetidos = false;
    })
  }

  eleccionRegistro(eleccion: string) {
    if(eleccion === "Paciente") {
      this.usuario = "Paciente";
    } else {
      this.usuario = "Especialista";
    }
    this.visualRegistro = false;
  }

  onCambioDeArchivo(evento: Event) {
    const input = evento.target as HTMLInputElement;
    if(input.files && input.files.length > 0) {
      this.archivosSeleccionados = Array.from(input.files);
    }
  }

  registrarse() {
    const nombre = this.capitalizarDatos(this.formulario.controls.nombre.value!);
    const apellido = this.capitalizarDatos(this.formulario.controls.apellido.value!);
    const edad = this.formulario.controls.edad.value!;
    const dni = this.formulario.controls.dni.value!;
    const email = this.formulario.controls.email.value!.toLowerCase();
    const contraseña = this.formulario.controls.contrasena.value!;
    const perfil = this.usuario;
    let fotos: string[] = [];

    let especialidadesUnicas: Set<string>;

    if (this.usuario === "Especialista") {
      const especialidadPrincipal = this.quitarTildes((this.formulario.controls.especialidades.value!).trim().toLowerCase());
      const especialidadesExtra = this.especialidadesInp.map(i => this.quitarTildes(i.nativeElement.value.trim().toLowerCase()));
      especialidadesExtra.push(especialidadPrincipal);
      especialidadesUnicas = new Set(especialidadesExtra);

      if (especialidadesExtra.length !== especialidadesUnicas.size) {
        this.camposRepetidos = true;
        return;
      }
    }

    if(this.usuario === "Paciente" && this.archivosSeleccionados.length !== 2) {
      this.formulario.controls.archivo.setErrors({fotoDoble: true});
      return;
    }

    if(this.usuario === "Especialista" && this.archivosSeleccionados.length !== 1) {
      this.formulario.controls.archivo.setErrors({fotoUnica: true});
      return;
    }

    this.auth.crearCuenta(email, contraseña).then(async ({ data, error }) => {
      if (!(data.user && data.session)) {
        this.usuarioRegistrado = true;
        return;
      }

      const user = await this.storage.guardarArchivos(email, this.archivosSeleccionados);
      fotos = user.fotos;

      if (this.usuario === "Paciente") {
        const obra_social = this.formulario.controls.obra_social.value!;
        const nuevoPaciente = new Paciente(nombre, apellido, Number(edad), Number(dni), email, perfil, obra_social, undefined, undefined, fotos);
        this.db.crearUsuario(nuevoPaciente);
      } else {
        const especialidades = Array.from(especialidadesUnicas).map(e => e[0].toUpperCase() + e.slice(1));
        const estado = "Pendiente";
        const nuevoEspecialista = new Especialista(nombre, apellido, Number(edad), Number(dni), email, perfil, especialidades, estado, undefined, undefined, fotos);
        localStorage.setItem("estado_email", email);
        this.db.crearUsuario(nuevoEspecialista);
      }
      this.router.navigateByUrl("loading");
    })
  }
}