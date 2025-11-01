// src/app/components/comentario/foro/comentario.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Comentario } from '../../../models/comentario';
import { ComentarioService } from '../../../services/comentarioService'; // ojo con el nombre del archivo

@Component({
  selector: 'app-comentario',
  standalone: true,
  templateUrl: './comentario.html',
  styleUrls: ['./comentario.css'],
  imports: [CommonModule, FormsModule]
})
export class ComentarioComponent implements OnInit {

  nuevoComentario: string = '';
  nuevaEstrella: number = 0;

  comentarios: Comentario[] = [];

  fechaActual: Date = new Date();

  private comentarioService = inject(ComentarioService);

  ngOnInit(): void {
    this.cargarComentarios();
  }

  // ================== CARGAR ==================
  private cargarComentarios(): void {
    console.log('[ComentarioComponent] cargando comentarios...');
    this.comentarioService.list().subscribe({
      next: (data: any[]) => {
        console.log('[ComentarioComponent] datos recibidos del backend:', data);

        // si el backend devolvió [], acá también verás []
        this.comentarios = (data || []).map((d: any) => ({
          idcomentario: d.idcomentario,
          comentario: d.comentario,
          estrella: d.estrella ?? 0,
          usuario: d.usuario ?? null,
          fecha: d.fecha ? new Date(d.fecha) : undefined
        }));
      },
      error: (err) => {
        console.error('[ComentarioComponent] ERROR al cargar comentarios', err);
        // this.comentarios = [
        //   { idcomentario: 999, comentario: 'No se pudo cargar', estrella: 0 }
        // ];
      }
    });
  }

  // ================== PUBLICAR ==================
  publicarComentario(): void {
    if (!this.nuevoComentario.trim()) {
      return;
    }

    const payload: Partial<Comentario> = {
      comentario: this.nuevoComentario.trim(),
      estrella: this.nuevaEstrella || 0
    };

    console.log('[ComentarioComponent] publicando...', payload);

    this.comentarioService.create(payload as Comentario).subscribe({
      next: (resp: any) => {
        console.log('[ComentarioComponent] respuesta al publicar:', resp);

        const nuevo: Comentario = {
          idcomentario: resp.idcomentario ?? 0,
          comentario: resp.comentario,
          estrella: resp.estrella ?? (this.nuevaEstrella || 0),
          usuario: resp.usuario ?? null,
          fecha: resp.fecha ? new Date(resp.fecha) : new Date()
        };

        // lo agrego arriba
        this.comentarios = [nuevo, ...this.comentarios];

        // limpio
        this.nuevoComentario = '';
        this.nuevaEstrella = 0;
      },
      error: (err) => {
        console.error('[ComentarioComponent] ERROR al publicar', err);
      }
    });
  }

  // ================== ELIMINAR ==================
  eliminarComentario(id: number): void {
    console.log('[ComentarioComponent] eliminando comentario', id);
    this.comentarioService.delete(id).subscribe({
      next: () => {
        this.comentarios = this.comentarios.filter(c => c.idcomentario !== id);
      },
      error: (err) => {
        console.error('[ComentarioComponent] ERROR al eliminar', err);
      }
    });
  }

  // ================== ESTRELLAS ==================
  seleccionarEstrella(valor: number): void {
    this.nuevaEstrella = valor;
  }
}
