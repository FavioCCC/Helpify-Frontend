export interface DonacionProyectoRef {
  idproyecto: number;
}

export interface DonacionCreate {
  monto?: number;
  proyecto: DonacionProyectoRef;
}

export interface DonacionRespuesta {
  id: number;
  estado?: string;
  monto?: number;
  proyecto?: DonacionProyectoRef;
}
export interface ProyectoRef {
  idproyecto: number;
}

export interface Donacion {
  id: number;
  monto?: number;
  estado?: string;
  proyecto?: ProyectoRef; // referencia mínima para evitar ciclo
}

