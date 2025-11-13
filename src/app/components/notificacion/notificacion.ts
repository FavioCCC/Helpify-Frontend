import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../../services/notificacionService';
import { IniciarsesionService } from '../../services/inicarsesion-service';
import { finalize } from 'rxjs/operators';

// --- MODELOS (Asegúrate de que la ruta sea correcta) ---
import { Notificacion } from '../../models/notificacion';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificacion.html',
  styleUrls: ['./notificacion.css']
})
export class NotificacionesComponent implements OnInit {

  // --- Inyección de Servicios ---
  private notificacionService = inject(NotificacionService);
  private authService = inject(IniciarsesionService);

  // --- Estado del Componente ---
  public vista: 'lista' | 'detalle' = 'lista';
  public isLoading = true;
  public isDeleting = false;
  public errorMsg: string | null = null;
  public esAdmin = false;

  // --- Datos ---
  public notificaciones: Notificacion[] = [];
  public notificacionSeleccionada: Notificacion | null = null;
  private usuarioActual: any;

  ngOnInit(): void {
    try {
      // 1. Obtenemos el objeto del usuario desde tu servicio
      this.usuarioActual = this.authService.getUsuario();

      if (!this.usuarioActual) {
        throw new Error("Sesión no encontrada. Por favor, inicie sesión.");
      }

      // Log de depuración: Muestra el objeto de usuario en la consola
      console.log("Datos del usuario (auth_user):", this.usuarioActual);

      // 2. Verificamos el ID (necesario para la llamada de "listarPorUsuario")
      if (!this.usuarioActual.idusuario) {
        console.error("El objeto 'usuarioActual' NO tiene la propiedad 'idusuario'. Propiedades disponibles:", Object.keys(this.usuarioActual));
        throw new Error("Faltan datos esenciales (ID) del usuario en el objeto de sesión.");
      }

      // 3. Usamos el método de tu servicio para verificar el rol
      this.esAdmin = this.authService.isAdmin();

      // Log de depuración para confirmar
      console.log(`Usuario ID: ${this.usuarioActual.idusuario}. ¿Es Admin? ${this.esAdmin}`);

      // 4. Cargamos las notificaciones
      this.cargarNotificaciones();

    } catch (error: any) {
      this.errorMsg = error.message;
      this.isLoading = false;
      console.error("Error al inicializar el componente:", error);
    }
  }

  // Carga la lista de notificaciones según el rol
  cargarNotificaciones(): void {
    this.isLoading = true;
    this.errorMsg = null;

    const request = this.esAdmin
      ? this.notificacionService.listarTodas()
      : this.notificacionService.listarPorUsuario(this.usuarioActual.idusuario);

    request.pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (data: Notificacion[]) => {
        this.notificaciones = data.sort((a, b) => {
          if (a.leido === b.leido) return 0;
          return a.leido ? 1 : -1;
        });
      },
      error: (err) => {
        this.errorMsg = `Error al cargar las notificaciones. Código: ${err.status} ${err.statusText}. Verifique sus permisos.`;
        console.error("Error del servicio:", err);
      }
    });
  }

  // --- Acciones de USUARIO (Donante/Voluntario) ---

  onVerMas(notif: Notificacion): void {
    this.notificacionSeleccionada = notif;
    this.vista = 'detalle'; // Cambia a la vista modal
    this.errorMsg = null;

    if (!notif.leido) {
      this.notificacionService.marcarComoLeida(notif.idnotificacion).subscribe({
        next: (notifActualizada) => {
          notif.leido = true;
        },
        error: (err) => {
          console.error("Error al marcar como leída.", err);
        }
      });
    }
  }

  // --- Acciones del Modal (Admin y Usuario) ---

  /**
   * Esta función ahora es llamada tanto por el Admin (desde la lista)
   * como por el Usuario (desde el modal).
   */
  onEliminar(notif: Notificacion): void {
    if (!notif) return;

    if (confirm(`¿Estás seguro de que deseas eliminar la notificación: "${notif.mensaje.substring(0, 20)}..."?`)) {

      const borrandoDesdeModal = (this.notificacionSeleccionada !== null);

      if(borrandoDesdeModal) {
        this.isDeleting = true;
      } else {
        this.isLoading = true;
      }

      this.errorMsg = null;

      this.notificacionService.eliminar(notif.idnotificacion)
        .pipe(finalize(() => {
          this.isDeleting = false;
          this.isLoading = false;
        }))
        .subscribe({
          next: () => {
            this.notificaciones = this.notificaciones.filter(n =>
              n.idnotificacion !== notif.idnotificacion
            );

            if(borrandoDesdeModal) {
              this.onCancelar();
            }
          },
          error: (err) => {
            this.errorMsg = "Error al eliminar: No tienes permiso o la notificación ya no existe.";
            console.error("Error de eliminación:", err);
          }
        });
    }
  }

  onCancelar(): void {
    this.vista = 'lista';
    this.notificacionSeleccionada = null;
    this.errorMsg = null;
    this.isDeleting = false;
  }
}
