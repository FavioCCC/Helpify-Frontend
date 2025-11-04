import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  private proyectoService = inject(ProyectoService);

  proyecto: Proyecto | null = null;
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

  marcarWishlist() {  }
  inscribirme() {  }
}
