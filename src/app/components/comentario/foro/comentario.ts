// src/app/components/comentario/foro/comentario.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Comentario } from '../../../models/comentario';
import { IniciarsesionService } from '../../../services/inicarsesion-service';
import { Router } from '@angular/router';
import {ComentarioService} from '../../../services/comentarioService';

@Component({
  selector: 'app-comentario',
  standalone: true,
  templateUrl: './comentario.html',
  styleUrls: ['./comentario.css'],
  imports: [CommonModule, FormsModule]
})
export class ComentarioComponent implements OnInit {
  private comentarioService = inject(ComentarioService);
  private auth = inject(IniciarsesionService);
  private router = inject(Router);

  nuevoComentario = '';
  nuevaEstrella = 0;

  comentarios: Comentario[] = [];
  cargando = false;
  errorMsg = '';

  usuarioActual: any = null;
  esAdmin = false;
  esVoluntario = false;

  ngOnInit(): void {
    // ⚠️ Permite ver el foro sin login, solo leer
    this.usuarioActual = this.auth.getUsuario();
    this.resolverRoles();
    this.cargarComentarios();
  }

  private resolverRoles(): void {
    this.esAdmin = this.auth.userHasRole('ADMIN');
    this.esVoluntario = this.auth.userHasRole('VOLUNTARIO');
    console.log('[Comentario] roles → admin:', this.esAdmin, 'voluntario:', this.esVoluntario);
  }

  private cargarComentarios(): void {
    this.cargando = true;
    this.errorMsg = '';
    this.comentarioService.list().subscribe({
      next: (data) => {
        this.comentarios = (data || []).map(c => ({
          ...c,
          fecha: c.fecha ? new Date(c.fecha) : undefined
        }));
      },
      error: (err) => {
        console.error('[Comentario] list error', err);
        this.errorMsg = 'No se pudieron cargar los comentarios.';
      },
      complete: () => (this.cargando = false)
    });
  }

  publicarComentario(): void {
    //Si NO está logueado: redirige a iniciar sesión y no intenta publicar
    if (!this.auth.isLoggedIn()) {
      // opcional: guardar intención si quieres (no es necesario para tu flujo)
      // localStorage.setItem('postLoginRedirect', '/home');
      this.router.navigate(['/login']);
      return;
    }

    const texto = this.nuevoComentario.trim();
    if (!texto) return;

    const payload = { comentario: texto, estrella: this.nuevaEstrella || 0 };

    this.comentarioService.create(payload).subscribe({
      next: () => {
        this.cargarComentarios();
        this.nuevoComentario = '';
        this.nuevaEstrella = 0;
      },
      error: (err) => {
        console.error('[Comentario] create error', err);
        this.errorMsg = 'No se pudo publicar el comentario.';
      }
    });
  }

  eliminarComentario(id?: number): void {
    if (!id) return;

    // También bloquea eliminar si no hay sesión
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/iniciarsesion']);
      return;
    }

    this.comentarioService.delete(id).subscribe({
      next: () => this.cargarComentarios(),
      error: (err) => {
        console.error('[Comentario] delete error', err);
        this.errorMsg = 'No se pudo eliminar el comentario.';
      }
    });
  }

  seleccionarEstrella(v: number): void {
    this.nuevaEstrella = v;
  }

  trackById(_: number, c: Comentario) {
    return c.idcomentario;
  }
  /**
   * ✅ Lógica de visibilidad del botón "Eliminar"
   * - ADMIN: puede eliminar todos
   * - VOLUNTARIO: solo sus propios comentarios
   */
  puedeEliminarComentario(c: Comentario): boolean {
    if (!this.auth.isLoggedIn()) return false;

    // 1) Admin puede todo
    if (this.esAdmin) return true;

    // 2) Voluntario solo su comentario
    if (this.esVoluntario && this.usuarioActual && c.usuario) {
      const idUserActual =
        this.usuarioActual.idusuario ??
        this.usuarioActual.id ?? null;

      const idUserComentario =
        (c.usuario as any).idusuario ??
        (c.usuario as any).id ?? null;

      return !!idUserActual && !!idUserComentario && idUserActual === idUserComentario;
    }

    return false;
  }
}


