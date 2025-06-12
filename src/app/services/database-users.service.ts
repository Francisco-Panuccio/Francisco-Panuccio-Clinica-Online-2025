import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Usuario } from '../classes/usuario';
import { Paciente } from '../classes/paciente';
import { Especialista } from '../classes/especialista';
import { Administrador } from '../classes/administrador';

@Injectable({
  providedIn: 'root'
})
export class DatabaseUsersService {
  sb = inject(SupabaseService);
  constructor() { }

  async listarUsuarios() {
    const {data, error} = await this.sb.supabase.from("Usuarios").select(`
    id,
    nombre,
    apellido,
    edad,
    dni,
    email,
    perfil,
    Pacientes (
      id_paciente,
      obra_social
    ),
    Especialistas (
      id_especialista,
      especialidades,
      estado,
      dias_laborables,
      horas_laborables
    ),
    Administradores (
      id_administrador
    )`);

    if(error) {
      console.log("Error al Listar Usuarios: ", error);
      return [];
    }
      
    const usuarios = data!.map((u: any) => {
      if (u.perfil === "Paciente" && u.Pacientes) {
        return new Paciente(
          u.nombre,
          u.apellido,
          u.edad,
          u.dni,
          u.email,
          u.perfil,
          u.Pacientes[0].obra_social,
          u.Pacientes[0].id = u.id,
          u.Pacientes[0].id_paciente
        );
      } else if (u.perfil === "Especialista" && u.Especialistas) {
        return new Especialista(
          u.nombre,
          u.apellido,
          u.edad,
          u.dni,
          u.email,
          u.perfil,
          u.Especialistas[0].especialidades,
          u.Especialistas[0].estado,
          u.Especialistas[0].id = u.id,
          u.Especialistas[0].id_especialista,
          u.Especialistas[0].dias_laborables,
          u.Especialistas[0].horas_laborables,
        );
      } else if (u.perfil === "Administrador" && u.Administradores) {
        return new Administrador(
          u.nombre,
          u.apellido,
          u.edad,
          u.dni,
          u.email,
          u.perfil,
          u.Administradores[0].id = u.id,
          u.Administradores[0].id_administrador
        );
      } else {
        console.log("Usuario con Datos Incompletos: ", u);
        return null;
      }
    })

    return usuarios.filter((u): u is Paciente | Especialista => u !== null);
  }

  async listarUsuariosPorEmail(email:string) {
    const {data, error} = await this.sb.supabase.from("Usuarios").select(`
    id,
    nombre,
    apellido,
    edad,
    dni,
    email,
    perfil,
    Pacientes (
      id_paciente,
      obra_social
    ),
    Especialistas (
      id_especialista,
      especialidades,
      estado,
      dias_laborables,
      horas_laborables
    ),
    Administradores (
      id_administrador
    )`).eq("email", email);

    if(error) {
      console.log("Error al Listar Usuarios: ", error);
      return [];
    }
      
    const usuarios = data!.map((u: any) => {
      if (u.perfil === "Paciente" && u.Pacientes) {
        return new Paciente(
          u.nombre,
          u.apellido,
          u.edad,
          u.dni,
          u.email,
          u.perfil,
          u.Pacientes[0].obra_social,
          u.Pacientes[0].id = u.id,
          u.Pacientes[0].id_paciente
        );
      } else if (u.perfil === "Especialista" && u.Especialistas) {
        return new Especialista(
          u.nombre,
          u.apellido,
          u.edad,
          u.dni,
          u.email,
          u.perfil,
          u.Especialistas[0].especialidades,
          u.Especialistas[0].estado,
          u.Especialistas[0].id = u.id,
          u.Especialistas[0].id_especialista,
          u.Especialistas[0].dias_laborables,
          u.Especialistas[0].horas_laborables,
        );
      } else if (u.perfil === "Administrador" && u.Administradores) {
        return new Administrador(
          u.nombre,
          u.apellido,
          u.edad,
          u.dni,
          u.email,
          u.perfil,
          u.Administradores[0].id = u.id,
          u.Administradores[0].id_administrador
        );
      } else {
        console.log("Usuario con Datos Incompletos: ", u);
        return null;
      }
    })

    return usuarios.filter((u): u is Paciente | Especialista => u !== null);
  }

  async listarUsuariosPorIdPaciente(idPaciente: number) {
    const {data: dataPaciente, error: errorPaciente} = await this.sb.supabase.from("Pacientes").select("id_usuario").eq("id_paciente", idPaciente).single();

    if(errorPaciente) {
      console.log("Error al Listar Pacientes: ", errorPaciente);
      return [];
    }
      
    const idUsuario = dataPaciente.id_usuario;

    const {data, error} = await this.sb.supabase.from("Usuarios").select(`
    id,
    nombre,
    apellido,
    edad,
    dni,
    email,
    perfil,
    Pacientes (
      id_paciente,
      obra_social
    )`).eq("id", idUsuario);

    if(error || !data) {
      console.log("Error al Listar Usuarios: ", error);
      return [];
    }

    const usuarios = data!.map((u: any) => {
      if (u.perfil === "Paciente" && u.Pacientes) {
        return new Paciente(
          u.nombre,
          u.apellido,
          u.edad,
          u.dni,
          u.email,
          u.perfil,
          u.Pacientes[0].obra_social,
          u.Pacientes[0].id = u.id,
          u.Pacientes[0].id_paciente
        );
      } else {
        console.log("Usuario con Datos Incompletos: ", u);
        return null;
      }
    })

    return usuarios.filter((u): u is Paciente => u !== null);
  }

  async listarUsuariosPorIdEspecialista(idEspecialista: number) {
    const {data: dataEspecialista, error: errorEspecialista} = await this.sb.supabase.from("Especialistas").select("id_usuario").eq("id_especialista", idEspecialista).single();

    if(errorEspecialista) {
      console.log("Error al Listar Pacientes: ", errorEspecialista);
      return [];
    }
      
    const idUsuario = dataEspecialista.id_usuario;

    const {data, error} = await this.sb.supabase.from("Usuarios").select(`
    id,
    nombre,
    apellido,
    edad,
    dni,
    email,
    perfil,
    Especialistas (
      id_especialista,
      especialidades,
      estado
    )`).eq("id", idUsuario);

    if(error || !data) {
      console.log("Error al Listar Usuarios: ", error);
      return [];
    }

    const usuarios = data!.map((u: any) => {
      if (u.perfil === "Especialista" && u.Especialistas) {
        return new Especialista(
          u.nombre,
          u.apellido,
          u.edad,
          u.dni,
          u.email,
          u.perfil,
          u.Especialistas[0].especialidades,
          u.Especialistas[0].estado,
          u.Especialistas[0].id = u.id,
          u.Especialistas[0].id_especialista
        );
      } else {
        console.log("Usuario con Datos Incompletos: ", u);
        return null;
      }
    })

    return usuarios.filter((u): u is Especialista => u !== null);
  }

  async crearUsuario(usuario: Paciente | Especialista | Administrador) {
    const {data: dataUsuario, error: errorUsuario} = await this.sb.supabase.from("Usuarios").insert([{
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      edad: usuario.edad,
      dni: usuario.dni,
      email: usuario.email,
      perfil: usuario.perfil, 
    }]).select("id").single();

    if(errorUsuario) {
      console.log("Error al Crear Usuario: ", errorUsuario);
      return;
    }

    const id_usuario = dataUsuario.id;

    if(usuario instanceof Paciente) {
      const {error: errorPaciente} = await this.sb.supabase.from("Pacientes").insert([{
        id_usuario: id_usuario,
        obra_social: usuario.obra_social
      }])
    
      if(errorPaciente) {
        console.log("Error al Crear Paciente: ", errorPaciente);
        return;
      }
    }

    if(usuario instanceof Especialista) {
      const {error: errorEspecialista} = await this.sb.supabase.from("Especialistas").insert([{
        id_usuario: id_usuario,
        especialidades: usuario.especialidades,
        estado: usuario.estado
      }])
    
      if(errorEspecialista) {
        console.log("Error al Crear Especialista: ", errorEspecialista);
        return;
      }
    }

    if(usuario instanceof Administrador) {
      const {error: errorAdministrador} = await this.sb.supabase.from("Administradores").insert([{
        id_usuario: id_usuario,
      }])
    
      if(errorAdministrador) {
        console.log("Error al Crear Administrador: ", errorAdministrador);
        return;
      }
    }
  }

  async modificarUsuario(usuario: Paciente | Especialista) {
    const { id, nombre, apellido, edad, dni, email } = usuario;
    const {error: errorUsuario} = await this.sb.supabase.from("Usuarios").update({nombre, apellido, edad, dni, email}).eq("id", id);
    if(errorUsuario) {
      console.log("Error al Modificar Usuario: ", errorUsuario);
      return false;
    }

    if(usuario instanceof Paciente) {
      const { obra_social } = usuario;
      const {error: errorPaciente} = await this.sb.supabase.from("Pacientes").update({obra_social}).eq("id_usuario", id);
    
      if(errorPaciente) {
        console.log("Error al Modificar Paciente: ", errorPaciente);
        return false;
      }
    }

    if(usuario instanceof Especialista) {
      const { especialidades, estado } = usuario;
      const {error: errorEspecialista} = await this.sb.supabase.from("Especialistas").update({especialidades, estado}).eq("id_usuario", id);
    
      if(errorEspecialista) {
        console.log("Error al Modificar Especialista: ", errorEspecialista);
        return false;
      }
    }

    return true;
  }

  async actualizarDisponibilidadEspecialistas(id: number, dias: string[], horas: string[]) {
    const {error: errorDisponibilidad} = await this.sb.supabase.from("Especialistas").update({dias_laborables: dias, horas_laborables: horas}).eq("id_usuario", id);
  
    if(errorDisponibilidad) {
      console.log("Error al Modificar Disponibilidad de Especialista: ", errorDisponibilidad);
      return false;
    }

    return true;
  }

  async eliminarUsuario(id: number, perfil: string) {
    if (perfil === "Paciente") {
      const {error: errorPaciente} = await this.sb.supabase.from("Pacientes").delete().eq("id_usuario", id);

      if(errorPaciente) {
        console.log("Error Eliminando Paciente: ", errorPaciente);
        return false;
      }
    }

    if (perfil === "Especialista") {
      const {error: errorEspecialista} = await this.sb.supabase.from("Especialistas").delete().eq("id_usuario", id);
    
      if(errorEspecialista) {
        console.log("Error Eliminando Especialista: ", errorEspecialista);
        return false;
      }
    }

    if (perfil === "Administrador") {
      const {error: errorAdministrador} = await this.sb.supabase.from("Administradores").delete().eq("id_usuario", id);
    
      if(errorAdministrador) {
        console.log("Error Eliminando Administrador: ", errorAdministrador);
        return false;
      }
    }

    const {error: errorUsuario} = await this.sb.supabase.from("Usuarios").delete().eq("id", id);
    if(errorUsuario) {
      console.log("Error Eliminando Usuario: ", errorUsuario);
      return false;
    }

    return true;
  }
}