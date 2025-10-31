import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ProyectoService} from '../../../services/proyectoService';
import {RouterLink} from '@angular/router';


@Component({
  selector: 'app-listarproyectos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listarproyectos.html',
  styleUrls: ['./listarproyectos.css']
})
export class ListarProyectos implements OnInit {
  proyectos: any[] = []; //

  private proyectoService = inject(ProyectoService);

  ngOnInit(): void {
    // Llama al backend
    this.proyectoService.list().subscribe({
      next: (data) => {
        this.proyectos = data;
        console.log('Proyectos cargados:', data);
      },
      error: (err) => console.error('Error cargando proyectos:', err)
    });
  }
}
