import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  sp = inject(SupabaseService);

  constructor() { }

  async guardarArchivos(email: string, archivos: File[]) {
    const urls: string[] = [];

    for(const archivo of archivos) {
      const ruta = `perfil/${email}/${archivo.name}`;
      const {data, error} = await this.sp.supabase.storage.from("clinica-online").upload(ruta, archivo);

      if(error) {
        console.log(`Error al Guardar el Archivo /${email}/${archivo.name}: -->`, error);
        continue;
      }

      const url = this.sp.supabase.storage.from("clinica-online").getPublicUrl(data!.path);
      urls.push(url.data.publicUrl);
    }

    const user = {
      email: email,
      fotos: urls
    }

    return user;
  }

  async listarArchivosPorEmail(email: string) {
    const {data: archivos, error} = await this.sp.supabase.storage.from("clinica-online").list(`perfil/${email}`);

    if (error) {
      console.log(`Error al listar archivos de ${email}: -->`, error);
      return [];
    }

    const paths = archivos.map(a => this.sp.supabase.storage.from("clinica-online").getPublicUrl(`perfil/${email}/${a.name}`).data.publicUrl);
    return paths;
  }
}
