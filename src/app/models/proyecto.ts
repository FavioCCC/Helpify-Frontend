import {Donacion} from './donacion';

export class Proyecto {
  idproyecto: number;
  nombreproyecto: string;
  descripcion: string;
  montoobjetivo: number;
  montorecaudado: number;
  fechainicio: Date;
  fechafin: Date;
  nombreorganizacion: string;
  escuelabeneficiada: string;
  cupoMaximo: number;
  cupoRestante: number;
  imagen: string;
  donaciones?: Donacion[];
}
