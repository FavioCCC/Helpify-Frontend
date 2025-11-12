import {Component, inject} from '@angular/core';
import {
  MatAccordion,
  MatExpansionModule,
  MatExpansionPanel,
  MatExpansionPanelHeader
} from '@angular/material/expansion';
import {CommonModule, DatePipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {ProyectoService} from '../../../services/proyectoService';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-proyecto-donaciones',
  standalone: true,
  imports: [
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    DatePipe,
    CommonModule,
    MatExpansionModule,
    RouterLink
  ],
  templateUrl: './proyecto-donaciones.html',
  styleUrl: './proyecto-donaciones.css',
})
export class ProyectoDonaciones {
  proyectos: any[] = [];
  loading = false;
  error = '';

  private proyectoService = inject(ProyectoService);

  ngOnInit(): void {
    this.cargarProyectosConDonaciones();
  }

  cargarProyectosConDonaciones(): void {
    this.loading = true;
    this.error = '';

    this.proyectoService.listarProyectosConDonaciones().subscribe({
      next: (data) => {
        console.log('[DONACIONES] Datos cargados:', data);
        this.proyectos = (data ?? []).map((proyecto: any) => {
          return {
            ...proyecto,
            donaciones: (proyecto.donaciones ?? []).filter(
              (d: any) => d.estado?.toUpperCase() === 'COMPLETADO'
            ),
          };
        }).filter(p => (p.donaciones?.length ?? 0) > 0);

        if (this.proyectos.length === 0){
          this.error = 'No hay proyectos con donaciones completadas.';
        }
      },
      error: (err) => {
        console.error('Error al cargar proyectos con donaciones:', err);
        if (err.status == 403) {
          this.error = 'Error de visualización: No tienes el rol de ADMINISTRADOR O DONANTE para visualizar las donaciones de cada proyecto';
        } else {
          this.error = 'Ocurrió un error al cargar las donaciones.';
        }
        this.proyectos = [];
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  limpiarMensajes(): void {
    this.error = '';
  }
}
