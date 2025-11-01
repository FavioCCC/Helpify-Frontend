import { Usuario } from "./usuario";

export class Comentario {
  idcomentario: number;
  comentario: string;
  estrella: number;
  usuario?: Usuario;
  fecha?: Date;
}
