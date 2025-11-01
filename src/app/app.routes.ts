import { Routes } from '@angular/router';
import {Home} from './components/home/home';
import {ListarProyectos} from './components/proyecto/listarproyectos/listarproyectos';
import { ComentarioComponent } from './components/comentario/foro/comentario';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'proyectos', component: ListarProyectos},
  { path: 'foros', component: ComentarioComponent },
  {path: '**', redirectTo: ''}
];
