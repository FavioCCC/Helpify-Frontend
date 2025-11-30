import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { ListarProyectos } from './components/proyecto/listarproyectos/listarproyectos';
import { ComentarioComponent } from './components/comentario/foro/comentario';
import { Iniciarsesion } from './components/usuario/iniciarsesion/iniciarsesion';
import { DonarComponent } from './components/donar/donar';
import { PerfilComponent } from './components/usuario/perfil/perfil';
import { RegistroProyecto } from './components/proyecto/registro-proyecto/registro-proyecto';
import {PerfilEditar} from './components/usuario/perfil-editar/perfil-editar';
import {CrearCuenta} from './components/usuario/crearperfil/crearperfil';
import {ProyectoDonaciones} from './components/proyecto/proyecto-donaciones/proyecto-donaciones';
import {ProyectoInscripciones} from './components/proyecto/proyecto-inscripciones/proyecto-inscripciones';
import {NotificacionesComponent} from './components/notificacion/notificacion';
import {ReportesGraficos} from './components/proyecto/reportes-graficos/reportes-graficos';
import {InsertarNotificacion} from './components/notificacion/insertar-notificacion/insertar-notificacion';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'perfil/editar', component: PerfilEditar },
  { path: 'proyectos', component: ListarProyectos },
  { path: 'proyectos/nuevo', component: RegistroProyecto },
  { path: 'proyectos/:id/modificar',
    loadComponent: () => import('./components/proyecto/modificar-proyecto/modificar-proyecto')
      .then(m => m.ModificarProyecto)},
  { path: 'proyectos/:id',
    loadComponent: () => import('./components/proyecto/infoproyecto/infoproyecto')
      .then(m => m.InfoProyecto)},
  {
    path: 'wishlist',
    loadComponent: () => import('./components/wishlist/listar-wishlist/listar-wishlist')
      .then(m => m.ListarWishlistComponent)
  },

  { path: 'proyectos-donaciones', component: ProyectoDonaciones },
  { path: 'proyectos-inscripciones', component: ProyectoInscripciones },
  { path: 'foros', component: ComentarioComponent },
  { path: 'notificaciones', component: NotificacionesComponent },
  { path: 'notificaciones/nueva', component: InsertarNotificacion },
  { path: 'perfil', component: PerfilComponent },
  { path: 'login', component: Iniciarsesion },
  { path: 'donar/:idProyecto', component: DonarComponent },
  { path: 'crearperfil', component: CrearCuenta },
  { path: 'reporte-universitarios', component: ReportesGraficos },
  { path: '**', redirectTo: '' },
];
