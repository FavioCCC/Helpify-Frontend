/**
 * Modelo de Donación
 * Representa una donación registrada por un usuario/donante.
 */
export interface Donacion {
  /** ID único de la donación (autogenerado por el backend) */
  id: number;

  /** Monto donado en soles (S/.) */
  monto: number;

  /** Nombre del titular de la tarjeta o donante */
  titular: string;

  /** Método de pago usado: "Tarjeta", "Yape", "Plin", etc. */
  metodoPago: string;

  /** Fecha de la donación en formato ISO (por ejemplo "2025-11-02T22:30:00Z") */
  fecha: string;

  /** (Opcional) ID del proyecto al que pertenece la donación */
  proyectoId?: number;

  /** (Opcional) Estado de la donación: 'Pendiente', 'Procesada', 'Rechazada', etc. */
  estado?: string;

  /** (Opcional) Código de transacción (si tu backend lo genera) */
  codigoTransaccion?: string;
}
