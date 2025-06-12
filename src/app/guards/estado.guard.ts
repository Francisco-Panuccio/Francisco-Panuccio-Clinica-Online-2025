import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DatabaseUsersService } from '../services/database-users.service';

export const estadoGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const db = inject(DatabaseUsersService);
  const email = localStorage.getItem("estado_email");
  let user: any;

  if(!email) {
    return router.navigateByUrl("home");
  } else {
    user = await db.listarUsuariosPorEmail(email);
    if(user[0].perfil === "Especialista" && (user[0].estado === "Pendiente" || user[0].estado === "Inhabilitado")) {
      return true;
    } else {
      return router.navigateByUrl("home");
    }
  }
};
