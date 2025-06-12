import { Routes } from '@angular/router';
import { ErrorComponent } from './pages/error/error.component';
import { HomeComponent } from './pages/home/home.component';
import { noLogueadoGuard } from './guards/no-logueado.guard';
import { logueadoGuard } from './guards/logueado.guard';
import { LoadingComponent } from './pages/loading/loading.component';
import { estadoGuard } from './guards/estado.guard';
import { misTurnosGuard } from './guards/mis-turnos.guard';
import { accesoAdminGuard } from './guards/acceso-admin.guard';
import { solicitarTurnoGuard } from './guards/solicitar-turno.guard';
import { soloEspecialistasGuard } from './guards/solo-especialistas.guard';

export const routes: Routes = [{
    path: "home", component: HomeComponent,
    title: "Clinica Online"
}, {
    path: "registro", loadComponent: () => import("./pages/registro/registro.component").then((archivo) => archivo.RegistroComponent),
    canActivate: [noLogueadoGuard],
    title: "Registro"
}, {
    path: "login", loadComponent: () => import("./pages/login/login.component").then((archivo) => archivo.LoginComponent),
    canActivate: [noLogueadoGuard],
    title: "Login"
}, {
    path: "usuarios", loadComponent: () => import("./pages/usuarios/usuarios.component").then((archivo) => archivo.UsuariosComponent),
    canActivate: [logueadoGuard, accesoAdminGuard],
    title: "Usuarios"
}, {
    path: "loading", component: LoadingComponent,
    canActivate: [logueadoGuard],
    title: "Clínica Online"
}, {
    path: "estado", loadComponent: () => import("./pages/estado/estado.component").then((archivo) => archivo.EstadoComponent),
    canActivate: [estadoGuard],
    title: "Clínica Online"
}, {
    path: "solicitar-turno", loadComponent: () => import("./pages/solicitar-turno/solicitar-turno.component").then((archivo) => archivo.SolicitarTurnoComponent),
    canActivate: [solicitarTurnoGuard],
    title: "Solicitar Turno"
}, {
    path: "estadisticas", loadComponent: () => import("./pages/estadisticas/estadisticas.component").then((archivo) => archivo.EstadisticasComponent),
    canActivate: [accesoAdminGuard],
    title: "Estadísticas"
}, {
    path: "turnos", loadComponent: () => import("./pages/turnos/turnos.component").then((archivo) => archivo.TurnosComponent),
    canActivate: [accesoAdminGuard],
    title: "Turnos"
}, {
    path: "pacientes", loadComponent: () => import("./pages/pacientes/pacientes.component").then((archivo) => archivo.PacientesComponent),
    canActivate: [soloEspecialistasGuard],
    title: "Pacientes"
}, {
    path: "mis-turnos", loadComponent: () => import("./pages/mis-turnos/mis-turnos.component").then((archivo) => archivo.MisTurnosComponent),
    canActivate: [misTurnosGuard],
    title: "Mis Turnos"
}, {
    path: "perfil", loadComponent: () => import("./pages/perfil/perfil.component").then((archivo) => archivo.PerfilComponent),
    canActivate: [logueadoGuard],
    title: "Perfil"
}, {
    path: "error", component: ErrorComponent,
    title: "Error"
}, {
    path: "",
    redirectTo: "home",
    pathMatch: "full"
}, {
    path: "**",
    component: ErrorComponent
}];