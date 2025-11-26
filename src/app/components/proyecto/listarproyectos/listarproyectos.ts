import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProyectoService } from '../../../services/proyectoService';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-listarproyectos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './listarproyectos.html',
  styleUrls: ['./listarproyectos.css']
})
export class ListarProyectos implements OnInit {
  proyectos: any[] = [];
  loading = false;
  error = '';

  filtros = {
    nombre: '' as string,
    montoMin: undefined as number | undefined,
    montoMax: undefined as number | undefined,
    fechaInicio: '' as string,
    fechaFin: '' as string,
  };

  private proyectoService = inject(ProyectoService);

  ngOnInit(): void {
    this.cargarTodos();
  }

  cargarTodos(): void {
    this.loading = true;
    this.error = '';
    this.proyectoService.list().subscribe({
      next: (data) => {
        this.proyectos = data ?? [];
        this.error = this.proyectos.length === 0 ? 'Sin resultados.' : '';
      },
      error: () => {
        this.error = 'Error cargando proyectos.';
        this.proyectos = [];
      },
      complete: () => { this.loading = false; }
    });
  }

  limpiar(): void {
    this.filtros = {
      nombre: '',
      montoMin: undefined,
      montoMax: undefined,
      fechaInicio: '',
      fechaFin: ''
    };
    this.error = '';
    this.cargarTodos();
  }

  buscar(): void {
    this.loading = true;
    this.error = '';

    const nombre = (this.filtros.nombre ?? '').trim();
    const montoMin = this.asNumber(this.filtros.montoMin);
    const montoMax = this.asNumber(this.filtros.montoMax);
    const fechaInicio = (this.filtros.fechaInicio ?? '').trim();
    const fechaFin = (this.filtros.fechaFin ?? '').trim();

    const tieneNombre = !!nombre;
    const tieneRangoMonto = montoMin !== undefined || montoMax !== undefined;
    const tieneRangoFechas = !!fechaInicio && !!fechaFin;

    // 0) Si NO hay ningún filtro, recargo todo
    if (!tieneNombre && !tieneRangoMonto && !tieneRangoFechas) {
      this.cargarTodos();
      return;
    }

    // 1) Si hay rango de fechas (puede combinar con nombre/montos)
    if (tieneRangoFechas) {
      this.proyectoService.buscarPorFechas(fechaInicio, fechaFin).subscribe({
        next: (base) => {
          let arr = base ?? [];

          if (!arr.length) {
            // fallback completamente local sobre el listado
            return this.filtrarLocalDesdeListado(
              nombre || undefined,
              montoMin,
              montoMax,
              fechaInicio,
              fechaFin
            );
          }

          // Aplico nombre + rango de montos en front si existen
          arr = this.filtrarNombreRangoFront(arr, nombre, montoMin, montoMax);
          this.finalizar(arr);
        },
        error: () => this.filtrarLocalDesdeListado(
          nombre || undefined,
          montoMin,
          montoMax,
          fechaInicio,
          fechaFin
        ),
        complete: () => { this.loading = false; }
      });
      return;
    }

    // 2) Si hay rango de montos (con o sin nombre, pero sin fechas)
    if (tieneRangoMonto) {
      this.proyectoService.buscarPorRangoMonto(montoMin, montoMax).subscribe({
        next: (data) => {
          let arr = data ?? [];

          if (tieneNombre) {
            arr = this.filtrarNombreRangoFront(arr, nombre, undefined, undefined);
          }

          if (!arr.length) {
            // fallback local sobre todo el listado
            return this.filtrarLocalDesdeListado(
              nombre || undefined,
              montoMin,
              montoMax,
              undefined,
              undefined
            );
          }

          this.finalizar(arr);
        },
        error: () => this.filtrarLocalDesdeListado(
          nombre || undefined,
          montoMin,
          montoMax,
          undefined,
          undefined
        ),
        complete: () => { this.loading = false; }
      });
      return;
    }

    // 3) Solo nombre (sin rango de montos ni fechas)
    if (tieneNombre && !tieneRangoMonto && !tieneRangoFechas) {
      this.proyectoService.buscarPorNombre(nombre).subscribe({
        next: (data) => {
          if (data && data.length) return this.finalizar(data);
          this.filtrarLocalDesdeListado(nombre, undefined, undefined, undefined, undefined);
        },
        error: () => this.filtrarLocalDesdeListado(nombre, undefined, undefined, undefined, undefined),
        complete: () => { this.loading = false; }
      });
      return;
    }

    // 4) Cualquier otra combinación rara → filtro full local
    this.filtrarLocalDesdeListado(
      nombre || undefined,
      montoMin,
      montoMax,
      fechaInicio || undefined,
      fechaFin || undefined
    );
  }

  // ======== Helpers ========

  private finalizar(arr: any[]): void {
    this.proyectos = arr ?? [];
    this.error = '';
    if (!this.proyectos.length) {
      this.error = 'Sin resultados.';
    }
    this.loading = false;
  }

  private filtrarLocalDesdeListado(
    nombre?: string,
    montoMin?: number,
    montoMax?: number,
    fechaInicio?: string,
    fechaFin?: string
  ): void {
    this.proyectoService.list().subscribe({
      next: (all) => {
        let arr = all ?? [];

        // Filtro por rango de fechas (fechainicio)
        if (fechaInicio || fechaFin) {
          const dIni = fechaInicio ? this.parseDate(fechaInicio) : null;
          const dFin = fechaFin ? this.parseDate(fechaFin) : null;

          arr = arr.filter((p: any) => {
            const d = this.parseDate(p && p.fechainicio);
            if (!d) return false;
            if (dIni && d < dIni) return false;
            if (dFin && d > dFin) return false;
            return true;
          });
        }

        // Filtro por nombre "contains"
        if (nombre) {
          const n = nombre.toLowerCase();
          arr = arr.filter((p: any) => {
            const np = p && p.nombreproyecto ? String(p.nombreproyecto) : '';
            return np.toLowerCase().includes(n);
          });
        }

        // Filtro por rango de montoobjetivo
        if (montoMin !== undefined) {
          arr = arr.filter((p: any) => Number(p && p.montoobjetivo) >= Number(montoMin));
        }
        if (montoMax !== undefined) {
          arr = arr.filter((p: any) => Number(p && p.montoobjetivo) <= Number(montoMax));
        }

        this.finalizar(arr);
      },
      error: () => {
        this.error = 'No se pudo filtrar localmente.';
        this.proyectos = [];
        this.loading = false;
      }
    });
  }

  private filtrarNombreRangoFront(
    arr: any[],
    nombre?: string,
    montoMin?: number,
    montoMax?: number
  ): any[] {
    let r = arr;

    if (nombre) {
      const n = nombre.toLowerCase();
      r = r.filter((p: any) => {
        const np = p && p.nombreproyecto ? String(p.nombreproyecto) : '';
        return np.toLowerCase().includes(n);
      });
    }

    if (montoMin !== undefined) {
      r = r.filter((p: any) => Number(p && p.montoobjetivo) >= Number(montoMin));
    }

    if (montoMax !== undefined) {
      r = r.filter((p: any) => Number(p && p.montoobjetivo) <= Number(montoMax));
    }

    return r;
  }

  private parseDate(v: any): Date | null {
    if (!v) return null;
    const d = new Date(String(v));
    return isNaN(d.getTime()) ? null : d;
  }

  private asNumber(v: any): number | undefined {
    if (v === null || v === undefined || v === '') return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
}
