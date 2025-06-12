import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class TurnoService {
  sb = inject(SupabaseService);
  constructor() { }

  async listarTurnos() {
    const fechaInicio = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaInicio.getDate() + 15);

    const {data, error} = await this.sb.supabase.from("Turnos").select("*")
    .gte("fecha", fechaInicio.toISOString().slice(0, 10))
    .lte("fecha", fechaLimite.toISOString().slice(0, 10));

    if(error) {
      console.log("Error al Listar Turnos: ", error);
      return [];
    } else {
      const turnosOrdenados = data.sort((a, b) => {
        if (a.estado === 'Pendiente' && b.estado !== 'Pendiente') return -1;
        if (a.estado !== 'Pendiente' && b.estado === 'Pendiente') return 1;
        return 0;
      });

      return turnosOrdenados;
    }
  }

  async listarTurnosEspecialista(especialista_id: string) {
    const fechaInicio = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaInicio.getDate() + 15);

    const {data, error} = await this.sb.supabase.from("Turnos").select("*")
    .eq("id_especialista", especialista_id)
    .gte("fecha", fechaInicio.toISOString().slice(0, 10))
    .lte("fecha", fechaLimite.toISOString().slice(0, 10));

    if(error) {
      console.log("Error al Listar Turnos: ", error);
      return [];
    } else {
      const turnosOrdenados = data.sort((a, b) => {
        if (a.estado === 'Pendiente' && b.estado !== 'Pendiente') return -1;
        if (a.estado !== 'Pendiente' && b.estado === 'Pendiente') return 1;
        return 0;
      });

      return turnosOrdenados;
    }
  }

  async listarTurnosPaciente(paciente_id: string) {
    const fechaInicio = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaInicio.getDate() + 15);

    const {data, error} = await this.sb.supabase.from("Turnos").select("*")
    .eq("id_paciente", paciente_id)
    .gte("fecha", fechaInicio.toISOString().slice(0, 10))
    .lte("fecha", fechaLimite.toISOString().slice(0, 10));

    if(error) {
      console.log("Error al Listar Turnos: ", error);
      return [];
    } else {
      const turnosOrdenados = data.sort((a, b) => {
        if (a.estado === 'Pendiente' && b.estado !== 'Pendiente') return -1;
        if (a.estado !== 'Pendiente' && b.estado === 'Pendiente') return 1;
        return 0;
      });

      return turnosOrdenados;
    }
  }

  async crearTurno(turno: {id_especialista: string, id_paciente: string, fecha: string, hora: string, especialidad: string, estado: string, comentario_especialista: string, comentario_paciente: string}) {
    const {error} = await this.sb.supabase.from("Turnos").insert([turno])

    if(error) {
      console.log("Error al Crear Turno: ", error);
      throw error;
    }
  }

  async modificarTurno(turno: {idTurno: number, fecha: string, hora: string, especialidad: string, estado: string, comentario_especialista: string, comentario_paciente: string}) {
    const { idTurno, fecha, hora, especialidad, estado, comentario_especialista, comentario_paciente } = turno;
    const {error: errorTurno} = await this.sb.supabase.from("Turnos").update({fecha, hora, especialidad, estado, comentario_especialista, comentario_paciente}).eq("id_turno", idTurno);

    if(errorTurno) {
      console.log("Error al Modificar Turno: ", errorTurno);
      return false;
    }

    return true;
  }

  async implementarEncuesta(idTurno: number, encuesta: string[] | null) {
    const {error: errorEncuesta} = await this.sb.supabase.from("Turnos").update({encuesta}).eq("id_turno", idTurno);

    if(errorEncuesta) {
      console.log("Error al Implementar Encuesta: ", errorEncuesta);
      return false;
    }

    return true;
  }

  async agregarHistorialClinico(idTurno: number, historiaClinica: any) {
    const {error: errorHistorial} = await this.sb.supabase.from("Turnos").update({historia_clinica: historiaClinica}).eq("id_turno", idTurno);

    if(errorHistorial) {
      console.log("Error al Agregar Historial Clínico: ", errorHistorial);
      return false;
    }

    return true;
  }

  async contarTurnosPorEspecialidad() {
    const {data, error} = await this.sb.supabase.from("Turnos").select("especialidad");

    if(error) {
      console.log("Error al Listar Turnos por Especialidad: ", error);
      throw error;
    } else {
      const contadorEspecialidad = new Map<string, number>();
      for(const turno of data) {
        const esp = turno.especialidad.trim().toLowerCase();
        contadorEspecialidad.set(esp, (contadorEspecialidad.get(esp) || 0) + 1);
      }
      return contadorEspecialidad;
    }
  }

  async contarTurnosPorFecha() {
    const {data, error} = await this.sb.supabase.from("Turnos").select("fecha");

    if(error) {
      console.log("Error al Listar Turnos por Fecha: ", error);
      throw error;
    } else {
      const contadorPorFecha = new Map<string, number>();
      for(const turno of data) {
        const fecha = new Date(turno.fecha).toISOString().split("T")[0];
        contadorPorFecha.set(fecha, (contadorPorFecha.get(fecha) || 0) + 1);
      }
      return contadorPorFecha;
    }
  }
}
