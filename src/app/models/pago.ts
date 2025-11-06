import {Donacion} from './donar';

export class Pago {
  idpago: number;
  monto: number;
  fechapago: Date;
  numerotarjeta: string;
  nombretitular: string;
  fechaexpiracion: Date;
  cvv: string;
  donacion?: Donacion;
}
