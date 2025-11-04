import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProyectoService } from '../../../services/proyectoService';
import { Proyecto } from '../../../models/proyecto';

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

  proyecto: Proyecto | null = null;
  loading = false;
  error = '';
  yaInscrito = false;
  necesitaUniversitario = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) { this.error = 'Proyecto inválido.'; return; }
    this.cargar(id);
  }

  private cargar(id: number) {
    this.loading = true;
    this.error = '';
    this.proyectoService.obtenerPorId(id).subscribe({
      next: (p) => this.proyecto = p,
      error: () => { this.error = 'No se pudo cargar el proyecto.'; },
      complete: () => { this.loading = false; }
    });
  }

  marcarWishlist() {
    if (!this.proyecto?.idproyecto) return;

    this.loading = true;
    this.error = '';

    this.proyectoService.agregarAWishlist(this.proyecto.idproyecto).subscribe({
      next: () => {
        alert('Proyecto añadido a tu wishlist');
        this.router.navigate(['/wishlist']); // ajusta la ruta si tu página se llama distinto
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
    if (!ok) return; // Se queda en la misma página
    this.realizarInscripcion();
  }

  private realizarInscripcion(): void {
    if (!this.proyecto?.idproyecto) return;

    this.loading = true;
    this.error = '';
    this.necesitaUniversitario = false; // resetea antes del intento

    this.proyectoService.inscribirme(this.proyecto.idproyecto).subscribe({
      next: () => {
        alert('¡Inscripción exitosa!');
        this.router.navigate(['/proyectos']);
      },
      error: (e) => {
        if (e?.status === 401) {
          this.error = 'Debes iniciar sesión nuevamente.';
        } else if (e?.status === 403) {
          // Puede ser falta de rol o falta de ficha Universitario.
          // El backend ya envía un mensaje claro; además, activamos bandera UI.
          this.necesitaUniversitario = true;
          this.error = e?.error?.message ?? 'Debes registrarte como Universitario para inscribirte.';
        } else if (e?.status === 409) {
          this.error = 'Ya estás inscrita en este proyecto.';
          this.yaInscrito = true;
        } else {
          this.error = 'No se pudo completar la inscripción.';
        }
      },
      complete: () => this.loading = false
    });
  }
}
