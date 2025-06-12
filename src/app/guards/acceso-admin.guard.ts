import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DatabaseUsersService } from '../services/database-users.service';

export const accesoAdminGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService)
  const db = inject(DatabaseUsersService);
  const usuario_actual = await auth.getUsuarioActual();
  let user: any;

  if(usuario_actual === null) {
    return router.navigateByUrl("home");
  } else {
    user = await db.listarUsuariosPorEmail(usuario_actual.email!);
    return user[0].perfil === "Administrador" ? true : router.navigateByUrl("home");
  }
};
