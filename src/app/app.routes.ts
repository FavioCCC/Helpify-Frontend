import { Routes } from '@angular/router';
import {Home} from './components/home/home';
import {ListarProyectos} from './components/proyecto/listarproyectos/listarproyectos';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'proyectos', component: ListarProyectos},
  {path: '**', redirectTo: ''}
];
