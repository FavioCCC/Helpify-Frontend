import { Usuario } from "./usuario";

export class Notificacion {
  idnotificacion: number;
  mensaje: string;
  tipo: string;
  fechaEnvio: Date;
  leido: boolean;
  usuario: Usuario;
}
