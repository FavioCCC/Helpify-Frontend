export interface PagoDonacionRef {
  id: number;   // id de la donación creada
}

export interface PagoDTO {
  monto: number;
  numerotarjeta: string;
  nombretitular: string;
  fechaexpiracion: string; // 'YYYY-MM-01'
  cvv: string;
  donacion: PagoDonacionRef;
}

export interface PagoRespuesta {
  mensaje: string;
  pago: {
    numerotarjeta?: string;
    status?: string;
  };
}

