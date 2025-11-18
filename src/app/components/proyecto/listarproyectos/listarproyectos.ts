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
    anio: undefined as number | undefined,
    mes: undefined as number | undefined,
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
      anio: undefined,
      mes: undefined
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
    const anio = this.asInt(this.filtros.anio);
    const mes = this.asInt(this.filtros.mes);

    const anioValido = anio !== undefined && anio >= 1900 && anio <= 2100;
    const mesValido  = mes !== undefined && mes >= 1 && mes <= 12;

    const tieneNombre = !!nombre;
    const tieneRango = montoMin !== undefined || montoMax !== undefined;

    // 0) Si NO hay ningún filtro, recargo todo
    if (!tieneNombre && !tieneRango && !anioValido && !mesValido) {
      this.cargarTodos();
      return;
    }

    // 1) Si hay año y mes válidos → filtro principal por año/mes y luego aplico nombre + rango en front
    if (anioValido && mesValido) {
      this.proyectoService.buscarPorAnioMes(anio!, mes!).subscribe({
        next: (base) => {
          let arr = base ?? [];
          if (!arr.length) {
            // fallback completamente local
            return this.filtrarLocalDesdeListado(nombre || undefined, montoMin, montoMax, anio, mes);
          }
          arr = this.filtrarNombreRangoFront(arr, nombre, montoMin, montoMax);
          this.finalizar(arr);
        },
        error: () => this.filtrarLocalDesdeListado(nombre || undefined, montoMin, montoMax, anio, mes),
        complete: () => { this.loading = false; }
      });
      return;
    }

    // 2) Si hay rango de montos (con o sin nombre, pero sin año/mes válido) → usamos el endpoint nuevo
    if (tieneRango) {
      this.proyectoService.buscarPorRangoMonto(montoMin, montoMax).subscribe({
        next: (data) => {
          let arr = data ?? [];

          // Si también hay nombre, filtro adicional
          if (tieneNombre) {
            arr = this.filtrarNombreRangoFront(arr, nombre, undefined, undefined);
          }

          if (!arr.length) {
            // fallback local sobre todo el listado
            return this.filtrarLocalDesdeListado(nombre || undefined, montoMin, montoMax, anioValido ? anio : undefined, mesValido ? mes : undefined);
          }

          this.finalizar(arr);
        },
        error: () => this.filtrarLocalDesdeListado(nombre || undefined, montoMin, montoMax, anioValido ? anio : undefined, mesValido ? mes : undefined),
        complete: () => { this.loading = false; }
      });
      return;
    }

    // 3) Solo nombre (sin rango y sin año/mes)
    if (tieneNombre && !tieneRango && !anioValido && !mesValido) {
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
      anioValido ? anio : undefined,
      mesValido ? mes : undefined
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
    anio?: number,
    mes?: number
  ): void {
    this.proyectoService.list().subscribe({
      next: (all) => {
        let arr = all ?? [];

        // Filtro por año/mes (fechainicio)
        if (anio !== undefined || mes !== undefined) {
          arr = arr.filter((p: any) => {
            const d = this.parseDate(p && p.fechainicio);
            if (!d) return false;
            const okY = anio === undefined || d.getFullYear() === anio;
            const okM = mes === undefined || (d.getMonth() + 1) === mes;
            return okY && okM;
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

  private asInt(v: any): number | undefined {
    if (v === null || v === undefined || v === '') return undefined;
    const n = parseInt(v, 10);
    return Number.isInteger(n) ? n : undefined;
  }
}
