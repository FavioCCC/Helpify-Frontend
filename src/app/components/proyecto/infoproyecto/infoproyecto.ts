import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { ProyectoService } from '../../../services/proyectoService';
import { Proyecto } from '../../../models/proyecto';
import {Usuario} from '../../../models/usuario';
import {IniciarsesionService} from '../../../services/inicarsesion-service';
import {PerfilService} from '../../../services/perfil-service'; // ⬅ importa tu model

@Component({
  selector: 'app-info-proyecto',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './infoProyecto.html',
  styleUrls: ['./infoProyecto.css']
})
export class InfoProyecto implements OnInit {
  private route = inject(ActivatedRoute);
  private proyectoService = inject(ProyectoService);
  proyecto?: Proyecto;

  constructor(
    private auth: IniciarsesionService,
    private router: Router
  ) {}
  loading = false;
  error = '';

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

  marcarWishlist() { /* opcional */ }
  inscribirme() { /* opcional */ }


// 1. Variable para controlar el modal
  mostrarModalConfirmacion: boolean = false;

// ... (otras funciones)

// 2. Modifica esta función para mostrar el modal
  eliminarCuenta(): void {
    // En lugar de llamar al servicio de eliminación, mostramos el modal
    this.mostrarModalConfirmacion = true;
  }

// 3. Función para cerrar el modal (si el usuario presiona 'No' o fuera del modal)
  cancelarEliminacion(): void {
    this.mostrarModalConfirmacion = false;
  }

// 4. Función que se llamará cuando el usuario presione 'Sí' en el modal
  confirmarEliminacion(): void {
    if (!this.proyecto) return;
    if (confirm('¿Eliminar este proyecto de manera permanente?')) {
      this.proyectoService.eliminarProyecto(this.proyecto.idproyecto).subscribe({
        next: () => { this.auth.logout(); this.router.navigate(['/']); },
        error: () => alert('No se pudo eliminar el proyecto.')
      });
    }
  }
}
