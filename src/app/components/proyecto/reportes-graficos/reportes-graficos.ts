import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartDataset, ChartOptions, ChartType, registerables } from 'chart.js';

import { ProyectoService } from '../../../services/proyectoService';
import { UniversitariosPorProyecto } from '../../../models/universitarios-por-proyecto';
import { PorcentajeUniversitarios } from '../../../models/porcentaje-universitarios';

// registrar todos los tipos de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-reportes-graficos',
  standalone: true,
  imports: [CommonModule, MatCardModule, BaseChartDirective],
  templateUrl: './reportes-graficos.html',
  styleUrls: ['./reportes-graficos.css'],
})
export class ReportesGraficos implements OnInit {

  // ====== BARRAS ======
  barChartType: ChartType = 'bar';

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: '#5b2b06', font: { size: 11 } },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#5b2b06' }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  barChartLabels: string[] = [];
  barChartDatasets: ChartDataset<'bar'>[] = [
    {
      label: 'Universitarios',
      data: [],
      backgroundColor: '#8b4513'
    }
  ];

  // ====== PIE ======
  pieChartType: ChartType = 'pie';

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#5b2b06',
          font: { size: 12 },
          padding: 20        // más espacio en la leyenda
        }
      },
      tooltip: {
        callbacks: {
          // Muestra "Nombre: xx%"
          label: (context) => {
            const label = context.label ?? '';
            const value = context.parsed as number; // para pie es número
            const num = isNaN(value) ? 0 : value;
            return `${label}: ${num.toFixed(0)}%`;
          }
        }
      }
    }
  };

  pieChartLabels: string[] = [];
  pieChartDatasets: ChartDataset<'pie'>[] = [
    {
      data: [],
      backgroundColor: []  // se llena dinámicamente
    }
  ];

  constructor(private proyectoService: ProyectoService) {}

  ngOnInit(): void {
    this.cargarBarras();
    this.cargarPie();
  }

  // ------- BARRAS -------
  private cargarBarras(): void {
    this.proyectoService.obtenerUniversitariosPorProyecto().subscribe({
      next: (data: UniversitariosPorProyecto[]) => {
        if (!data || data.length === 0) return;

        this.barChartLabels = data.map(d => d.nombreProyecto);
        this.barChartDatasets[0].data = data.map(d => d.cantidadUniversitarios);
      }
    });
  }

  // ------- PIE -------
  private cargarPie(): void {
    this.proyectoService.obtenerPorcentajeUniversitarios().subscribe({
      next: (data: PorcentajeUniversitarios[]) => {
        if (!data || data.length === 0) return;

        this.pieChartLabels = data.map(d => d.nombreProyecto);

        const valores = data.map(d => d.porcentaje);

        // colores dinámicos
        const n = data.length;
        const colors = data.map((_, i) => {
          const hue = (i / n) * 360;
          return `hsl(${hue}, 70%, 55%)`;
        });

        this.pieChartDatasets[0].data = valores;
        this.pieChartDatasets[0].backgroundColor = colors;
      }
    });
  }
}
