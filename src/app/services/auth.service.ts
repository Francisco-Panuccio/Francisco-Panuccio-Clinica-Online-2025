import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService{
  sb = inject(SupabaseService);
  router = inject(Router);
  usuario_actual: User | null = null;

  constructor() { 
    this.sb.supabase.auth.onAuthStateChange((event, session) => {
      session ? this.usuario_actual = session.user : this.usuario_actual = null;
    })
  }

  //Devolver Usuario Actual
  async getUsuarioActual() {
    const response = await this.sb.supabase.auth.getSession();
    const session = response.data.session;
    return this.usuario_actual = session ? session.user : null;
  }

  //Crear Cuenta
  async crearCuenta(correo: string, contraseña: string) {
    return await this.sb.supabase.auth.signUp({
      email: correo,
      password: contraseña
    });
  }

  // Iniciar Sesión
  async iniciarSesion(correo: string, contraseña: string) {
    return await this.sb.supabase.auth.signInWithPassword({
      email: correo,
      password: contraseña
    });
  }

  // Cerrar Sesión
  async cerrarSesion() {
    const { error } = await this.sb.supabase.auth.signOut({scope: "global"});
    this.usuario_actual = null;

    if (error) {
      console.error("Error Cerrando Sesión:", error.message);
      return;
    }

    this.router.navigateByUrl("home");
  }

  async cerrarSesionInhabilitada() {
    const { error } = await this.sb.supabase.auth.signOut({scope: "global"});
    this.usuario_actual = null;

    if (error) {
      console.error("Error Cerrando Sesión Inhabilitada:", error.message);
      return;
    }
  }
}