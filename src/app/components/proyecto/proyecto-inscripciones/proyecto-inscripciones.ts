import {Component, inject} from '@angular/core';
import {
  MatAccordion,
  MatExpansionModule,
  MatExpansionPanel,
  MatExpansionPanelHeader
} from '@angular/material/expansion';
import {CommonModule, DatePipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {ProyectoService} from '../../../services/proyectoService';

@Component({
  selector: 'app-proyecto-inscripciones',
  imports: [
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    DatePipe,
    CommonModule,
    MatExpansionModule,
    RouterLink
  ],
  templateUrl: './proyecto-inscripciones.html',
  styleUrl: './proyecto-inscripciones.css',
})
export class ProyectoInscripciones {
  proyectos: any[] = [];
  loading = false;
  error = '';

  private proyectoService = inject(ProyectoService);

  ngOnInit(): void {
    this.cargarProyectosConInscripciones();
  }

  cargarProyectosConInscripciones(): void {
    this.loading = true;
    this.error = '';

    this.proyectoService.listarProyectosConInscripciones().subscribe({
      next: (data) => {
        console.log('[INSCRIPCIONES] Datos cargados:', data);
        this.proyectos = data ?? [];
        if (this.proyectos.length === 0) {
          this.error = 'No hay proyectos con inscripciones registradas.';
        }
      },
      error: (err) => {
        console.error('Error al cargar proyectos con inscripciones:', err);
        if (err.status === 403) {
          this.error = 'Error de visualización: No tienes el rol de ADMINISTRADOR O VOLUNTARIO para visualizar las inscripciones de cada proyecto.';
        } else {
          this.error = 'Ocurrió un error al cargar las inscripciones.';
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
