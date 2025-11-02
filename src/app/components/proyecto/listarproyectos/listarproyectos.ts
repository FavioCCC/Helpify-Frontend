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
    monto: undefined as number | undefined,
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
      error: () => { this.error = 'Error cargando proyectos.'; this.proyectos = []; },
      complete: () => { this.loading = false; }
    });
  }

  limpiar(): void {
    this.filtros = { nombre: '', monto: undefined, anio: undefined, mes: undefined };
    this.error = '';
    this.cargarTodos();
  }

  buscar(): void {
    this.loading = true;
    this.error = '';

    const nombre = (this.filtros.nombre ?? '').trim();
    const monto  = this.asNumber(this.filtros.monto);
    const anio   = this.asInt(this.filtros.anio);
    const mes    = this.asInt(this.filtros.mes);

    const anioValido = anio !== undefined && anio >= 1900 && anio <= 2100;
    const mesValido  = mes !== undefined && mes >= 1 && mes <= 12;

    // 1) Año + Mes válidos
    if (anioValido && mesValido) {
      this.proyectoService.buscarPorAnioMes(anio!, mes!).subscribe({
        next: (base) => {
          let arr = base ?? [];
          if (!arr.length) return this.filtrarLocalDesdeListado(nombre, monto, anio, mes);
          arr = this.filtrarNombreMontoFront(arr, nombre, monto);
          this.finalizar(arr);
        },
        error: () => this.filtrarLocalDesdeListado(nombre, monto, anio, mes),
        complete: () => { this.loading = false; }
      });
      return;
    }

    // 2) Solo nombre
    if (nombre && monto === undefined && !anio && !mes) {
      this.proyectoService.buscarPorNombre(nombre).subscribe({
        next: (data) => {
          if (data && data.length) return this.finalizar(data);
          this.filtrarLocalDesdeListado(nombre, undefined, undefined, undefined);
        },
        error: () => this.filtrarLocalDesdeListado(nombre, undefined, undefined, undefined),
        complete: () => { this.loading = false; }
      });
      return;
    }

    // 3) Solo monto
    if (!nombre && monto !== undefined && !anio && !mes) {
      this.proyectoService.buscarPorMonto(monto).subscribe({
        next: (data) => {
          if (data && data.length) return this.finalizar(data);
          this.filtrarLocalDesdeListado(undefined, monto, undefined, undefined);
        },
        error: () => this.filtrarLocalDesdeListado(undefined, monto, undefined, undefined),
        complete: () => { this.loading = false; }
      });
      return;
    }

    // 4) Nombre + Monto sin año/mes
    if (nombre && monto !== undefined && !anio && !mes) {
      this.proyectoService.buscarPorNombre(nombre).subscribe({
        next: (base) => {
          let arr = (base ?? []).filter(p => Number(p && p.montoobjetivo) === Number(monto));
          if (!arr.length) return this.filtrarLocalDesdeListado(nombre, monto, undefined, undefined);
          this.finalizar(arr);
        },
        error: () => this.filtrarLocalDesdeListado(nombre, monto, undefined, undefined),
        complete: () => { this.loading = false; }
      });
      return;
    }

    // 5) Filtro local directo si no hay criterios válidos
    this.filtrarLocalDesdeListado(nombre || undefined, monto, anioValido ? anio : undefined, mesValido ? mes : undefined);
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
    monto?: number,
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

        // Filtro por monto exacto
        if (monto !== undefined) {
          arr = arr.filter((p: any) => Number(p && p.montoobjetivo) === Number(monto));
        }

        this.finalizar(arr);
      },
      error: () => { this.error = 'No se pudo filtrar localmente.'; this.proyectos = []; this.loading = false; }
    });
  }

  private filtrarNombreMontoFront(arr: any[], nombre?: string, monto?: number): any[] {
    let r = arr;
    if (nombre) {
      const n = nombre.toLowerCase();
      r = r.filter((p: any) => {
        const np = p && p.nombreproyecto ? String(p.nombreproyecto) : '';
        return np.toLowerCase().includes(n);
      });
    }
    if (monto !== undefined) {
      r = r.filter((p: any) => Number(p && p.montoobjetivo) === Number(monto));
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
