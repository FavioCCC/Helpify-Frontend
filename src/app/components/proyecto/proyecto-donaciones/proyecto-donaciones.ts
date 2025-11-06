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
    MatIcon,
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
        this.proyectos = data ?? [];
        this.error = this.proyectos.length === 0 ? 'No hay proyectos con donaciones registradas.' : '';
      },
      error: (err) => {
        console.error('Error al cargar proyectos con donaciones:', err);
        this.error = 'Ocurrió un error al cargar las donaciones.';
        this.proyectos = [];
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
