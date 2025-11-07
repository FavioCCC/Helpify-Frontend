import {Usuario} from './usuario';

export class Universitario {
  iduniversitario: number;
  idusuario: number;
  codigoestudiante!: string; // opcional, si lo necesitas para alguna relación rápida
  usuario?: Usuario;        // opcional, si lo necesitas para mostrar detalles
}
