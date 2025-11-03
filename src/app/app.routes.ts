import { Routes } from '@angular/router';
import {Home} from './components/home/home';
import {ListarProyectos} from './components/proyecto/listarproyectos/listarproyectos';
import { ComentarioComponent } from './components/comentario/foro/comentario';
import {Iniciarsesion} from './components/usuario/iniciarsesion/iniciarsesion';
import { DonarComponent } from './components/donar/donar';
import {PerfilComponent} from './components/usuario/perfil/perfil';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'proyectos', component: ListarProyectos},
  { path: 'foros', component: ComentarioComponent },
  { path: 'perfil', component: PerfilComponent },
  //Corregir porque puse eso para poder ver mi pantalla de login
  { path: 'login', component: Iniciarsesion },
  { path: 'donar', component: DonarComponent },
  {path: '**', redirectTo: ''}
];
