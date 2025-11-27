import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProyectoService } from '../../../services/proyectoService';
import { Proyecto } from '../../../models/proyecto';
import { IniciarsesionService } from '../../../services/inicarsesion-service';

@Component({
  selector: 'app-listar-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listar-wishlist.html',
  styleUrls: ['./listar-wishlist.css']
})
export class ListarWishlistComponent implements OnInit {
  private proyectoService = inject(ProyectoService);
  private auth = inject(IniciarsesionService);

  proyectos: Proyecto[] = [];
  nombreUsuario = '';
  error = '';
  loading = false;

  ngOnInit(): void {
    const usuario = this.auth.getUsuario();
    if (usuario) {
      const nombre = usuario.nombre || '';
      const paterno = usuario.apellidopaterno || '';
      const materno = usuario.apellidomaterno || '';
      this.nombreUsuario = `${nombre} ${paterno} ${materno}`.trim();
    }
    this.cargarWishlist();
  }


  private cargarWishlist(): void {
    this.loading = true;
    this.proyectoService.obtenerWishlist().subscribe({
      next: (data) => this.proyectos = data,
      error: () => this.error = 'No se pudo cargar tu wishlist.',
      complete: () => this.loading = false
    });
  }

  eliminar(idProyecto: number): void {
    this.error = '';

    const copia = [...this.proyectos];
    this.proyectos = this.proyectos.filter(p => p.idproyecto !== idProyecto);

    this.proyectoService.eliminarDeWishlist(idProyecto).subscribe({
      next: () => this.cargarWishlist(),
      error: (e) => {
        // Revertir si falla
        this.proyectos = copia;
        this.error = (e?.status === 401 || e?.status === 403)
          ? 'No tienes permisos o tu sesión expiró. Inicia sesión nuevamente.'
          : 'No se pudo eliminar el proyecto de tu wishlist.';
      }
    });
  }

}
