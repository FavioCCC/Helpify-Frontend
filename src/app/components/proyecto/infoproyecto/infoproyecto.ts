import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProyectoService } from '../../../services/proyectoService';
import { Proyecto } from '../../../models/proyecto';
import {IniciarsesionService} from '../../../services/inicarsesion-service';

@Component({
  selector: 'app-info-proyecto',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './infoProyecto.html',
  styleUrls: ['./infoProyecto.css']
})
export class InfoProyecto implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private proyectoService = inject(ProyectoService);
  private auth = inject(IniciarsesionService);

  proyecto: Proyecto | null = null;
  loading = false;
  error = '';
  yaInscrito = false;
  necesitaUniversitario = false;

  mensajeExito: string = '';
  mostrarConfirmacionEliminar: boolean = false;
  mostrarConfirmacionInscripcion: boolean = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      this.error = 'Proyecto inválido.';
      return;
    }
    this.cargar(id);
  }

  private cargar(id: number) {
    this.loading = true;
    this.error = '';
    this.proyectoService.obtenerPorId(id).subscribe({
      next: (p) => this.proyecto = p,
      error: () => {
        this.error = 'No se pudo cargar el proyecto.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  marcarWishlist() {
    if (!this.proyecto?.idproyecto) return;

    this.loading = true;
    this.error = '';
    this.mensajeExito = '';

    this.proyectoService.agregarAWishlist(this.proyecto.idproyecto).subscribe({
      next: () => {
        this.mensajeExito = '¡Proyecto añadido a tu wishlist!';
      },
      error: (e) => {
        if (e?.status === 401) {
          this.error = 'Debes iniciar sesión para usar tu wishlist.';
        } else if (e?.status === 403) {
          this.error = 'Necesitas rol VOLUNTARIO o DONANTE para usar la wishlist.';
        } else if (e?.status === 409) {
          this.error = 'Este proyecto ya está en tu wishlist.';
        } else {
          this.error = 'No se pudo añadir a la wishlist.';
        }
      },
      complete: () => this.loading = false
    });
  }

  confirmarInscripcion(): void {

    const ok = window.confirm('¿Confirmas que deseas inscribirte en este proyecto?');

    if (!ok) return;

    this.realizarInscripcion();

  }


  private realizarInscripcion(): void {
    if (!this.proyecto?.idproyecto) return;
    if (this.loading) return;
    this.loading = true;
    this.error = '';
    this.necesitaUniversitario = false;

    this.proyectoService.inscribirme(this.proyecto.idproyecto).subscribe({
      next: () => {
        alert('¡Inscripción exitosa!');
        this.router.navigate(['/proyectos']);
        this.loading = false;
      },
      error: (e) => {
        this.loading = false; // resetear también en error
        const backendMsg = this.parseBackendError(e);

        if (e?.status === 401) {
          this.error = backendMsg || 'Debes iniciar sesión nuevamente.';
        } else if (e?.status === 403) {
          this.necesitaUniversitario = true;
          this.error = backendMsg || 'Debes registrarte como Universitario para inscribirte.';
        } else if (e?.status === 409) {
          this.yaInscrito = true;
          this.error = backendMsg || 'Ya estás inscrito en este proyecto.';
        } else {
          this.error = backendMsg || 'No se pudo completar la inscripción.';
        }
        console.error('Error inscribirme:', e);
      }
    });
  }

  private parseBackendError(e: any): string | null {
    if (!e) return null;

    const payload = e.error ?? e;

    if (typeof payload === 'string' && payload.trim()) {
      try {
        const parsed = JSON.parse(payload);
        return parsed.message ?? parsed.mensaje ?? JSON.stringify(parsed);
      } catch {
        return payload;
      }
    }

    if (typeof payload === 'object' && payload !== null) {
      if (payload.message) return payload.message;
      if (payload.mensaje) return payload.mensaje;
      if (payload.error && typeof payload.error === 'string') return payload.error;
      if (Array.isArray(payload.errors) && payload.errors.length) {
        const first = payload.errors[0];
        return (first && (first.message || first.defaultMessage)) ? (first.message || first.defaultMessage) : JSON.stringify(payload.errors);
      }
    }

    if (e?.message) return e.message;
    if (e?.statusText) return e.statusText;
    return null;
  }

  confirmarEliminacion()
  :
    void {

      if(!
    this.proyecto?.idproyecto
  )
    return;

    this.loading = true;
    this.error = '';
    this.mensajeExito = '';
    this.mostrarConfirmacionEliminar = false; // Oculta el modal al iniciar la eliminación

    this.proyectoService.eliminarProyecto(this.proyecto.idproyecto).subscribe({
      next: () => {
        this.mensajeExito = 'Proyecto eliminado correctamente. Redirigiendo...';
        setTimeout(() => this.router.navigate(['/proyectos']), 1500);
      },
      error: (e) => {
        if (e?.status === 401) {
          this.error = 'Error de eliminación: Debes iniciar sesión para realizar esta acción.';
        } else if (e?.status === 403) {
          this.error = 'Error de eliminación: No tienes el rol de ADMINISTRADOR para eliminar proyectos.';
        } else {
          const detalle = e?.error?.message || e.message || e.statusText || 'Error desconocido';
          this.error = `No se pudo eliminar el proyecto. Motivo: ${detalle}`;
        }
        console.error('Error detallado al eliminar proyecto:', e);
      },
      complete: () => this.loading = false
    });
    this.limpiarMensajes();
  }


    cancelarEliminacion()
  :
    void {
      this.mostrarConfirmacionEliminar = false;
    }

    eliminarProyecto()
  :
    void {
      this.mostrarConfirmacionEliminar = true;
    }
    limpiarMensajes()
  :
    void {
      this.error = '';
      this.mensajeExito = '';
    }

  // Retorna si hay un usuario autenticado
  get isAuthenticated(): boolean {
    return this.auth.isLoggedIn();
  }

  // Getters seguros: si no hay sesión, siempre devuelven false
  get esAdmin(): boolean {
    if (!this.isAuthenticated) return false;
    return this.auth.isAdmin();
  }

  get esVoluntario(): boolean {
    if (!this.isAuthenticated) return false;
    return this.auth.userHasRole('VOLUNTARIO');
  }

  get esDonante(): boolean {
    if (!this.isAuthenticated) return false;
    return this.auth.userHasRole('DONANTE');
  }
}
