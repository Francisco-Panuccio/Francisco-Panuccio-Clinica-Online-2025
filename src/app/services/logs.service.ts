import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  sb = inject(SupabaseService);
  constructor() { }

  async crearLog(email: string) {
    const {error: errorLog} = await this.sb.supabase.from("Logs").insert([{usuario: email, fecha_hora: new Date()}]);

    if(errorLog) {
      console.log("Error al Generar Log: ", errorLog);
      throw errorLog;
    }
  }

  async listarLogs() {
    const {data: dataLog, error: errorLog} = await this.sb.supabase.from("Logs").select("*").order("fecha_hora", {ascending: false});

    if(errorLog) {
      console.log("Error al Listar Logs: ", errorLog);
      throw errorLog;
    }
    
    return dataLog;
  }
}
