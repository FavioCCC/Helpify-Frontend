import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { ListarProyectos } from './components/proyecto/listarproyectos/listarproyectos';
import { ComentarioComponent } from './components/comentario/foro/comentario';
import { Iniciarsesion } from './components/usuario/iniciarsesion/iniciarsesion';
import { DonarComponent } from './components/donar/donar';
import { PerfilComponent } from './components/usuario/perfil/perfil';
import {PerfilEditar} from './components/usuario/perfil-editar/perfil-editar';
import {PerfilCrear} from './components/usuario/crearperfil/crearperfil';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'proyectos', component: ListarProyectos },
  { path: 'proyectos/:id',
    loadComponent: () => import('./components/proyecto/infoproyecto/infoproyecto')
      .then(m => m.InfoProyecto)},
  { path: 'foros', component: ComentarioComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'perfil-editar', component: PerfilEditar},
  { path: 'login', component: Iniciarsesion },
  { path: 'donar', component: DonarComponent },
  {path: 'crearperfil', component: PerfilCrear},
  { path: '**', redirectTo: '' }
];
