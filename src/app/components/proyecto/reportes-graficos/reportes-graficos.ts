import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProyectoService } from '../../../services/proyectoService';
import { UniversitariosPorProyecto } from '../../../models/universitarios-por-proyecto';
import {PorcentajeUniversitarios} from '../../../models/porcentaje-universitarios';

@Component({
  selector: 'app-reportes-graficos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes-graficos.html',
  styleUrls: ['./reportes-graficos.css'],
})
export class ReportesGraficos implements OnInit {
  barras: { label: string; valor: number; altura: number }[] = [];
  maxValor = 0;
  ticksY: number[] = [];
  error = '';

  segmentosPie: { label: string; porcentaje: number; color: string }[] = [];
  pieBackground = '';
  errorPie = '';

  constructor(private proyectoService: ProyectoService) {}

  ngOnInit(): void {
    console.log('[REPORTES] ngOnInit');
    this.cargarDatos();
    this.cargarPorcentajes();
  }

  private cargarDatos(): void {
    this.proyectoService.obtenerUniversitariosPorProyecto().subscribe({
      next: (data: UniversitariosPorProyecto[]) => {
        console.log('[REPORTES] data cruda', data);

        if (!data || data.length === 0) {
          this.barras = [];
          this.maxValor = 0;
          this.ticksY = [];
          return;
        }

        this.maxValor = Math.max(...data.map(d => d.cantidadUniversitarios));

        // Escalamos a 80% de la altura para dejar aire arriba
        const factor = this.maxValor ? 80 / this.maxValor : 0;

        this.barras = data.map(d => ({
          label: d.nombreProyecto,
          valor: d.cantidadUniversitarios,
          altura: d.cantidadUniversitarios * factor,
        }));

        this.ticksY = Array.from(
          { length: this.maxValor + 1 },
          (_, i) => this.maxValor - i
        );

        console.log('[REPORTES] barras', this.barras);
        console.log('[REPORTES] ticksY', this.ticksY);
      },
      error: (e) => {
        console.error('[REPORTES] error', e);
        this.error = 'No se pudo cargar el reporte de universitarios.';
      },
    });
  }
  private cargarPorcentajes(): void {
    this.proyectoService.obtenerPorcentajeUniversitarios().subscribe({
      next: (data: PorcentajeUniversitarios[]) => {
        if (!data || data.length === 0) {
          this.segmentosPie = [];
          this.pieBackground = '';
          return;
        }

        const total = data.reduce((acc, d) => acc + d.porcentaje, 0);
        if (!total) {
          this.segmentosPie = [];
          this.pieBackground = '';
          return;
        }

        let acumulado = 0;
        const paradas: string[] = [];
        const segs: { label: string; porcentaje: number; color: string }[] = [];

        const n = data.length;

        data.forEach((d, i) => {
          // color dinámico según la posición
          const hue = (i / n) * 360;
          const color = `hsl(${hue}, 70%, 55%)`;

          const pctNorm = (d.porcentaje / total) * 100;
          const inicio = acumulado;
          const fin = acumulado + pctNorm;

          paradas.push(
            `${color} ${inicio.toFixed(2)}% ${fin.toFixed(2)}%`
          );

          segs.push({
            label: d.nombreProyecto,
            porcentaje: pctNorm,
            color,
          });

          acumulado = fin;
        });

        this.segmentosPie = segs;
        this.pieBackground = `conic-gradient(${paradas.join(', ')})`;
      },
      error: (e) => {
        this.errorPie = 'No se pudo cargar el porcentaje de universitarios.';
        console.error('[REPORTES] error pastel', e);
      },
    });
  }

}
