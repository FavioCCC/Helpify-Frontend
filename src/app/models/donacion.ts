export interface DonacionProyectoRef {
  idproyecto: number;
}

export interface DonacionCreate {
  // si tu back no usa monto en Donación, puedes quitar esta línea
  monto?: number;
  proyecto: DonacionProyectoRef;
}

// El back responde con DonacionDTO y ahí el id es "id"
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
  // agrega otros campos si tu backend los devuelve (pago, fechas, etc.)
}

