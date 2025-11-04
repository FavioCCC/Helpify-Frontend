import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Usuario } from '../../../models/usuario';
import { PerfilService } from '../../../services/perfil-service';
import { IniciarsesionService } from '../../../services/inicarsesion-service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilComponent implements OnInit {
  cargando = true;
  logeado = false;
  usuario?: Usuario;
  error = '';

  // Modal
  mostrarModalConfirmacion = false;

  constructor(
    private auth: IniciarsesionService,
    private perfilService: PerfilService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ★ Si no hay sesión, manda al login de inmediato
    this.logeado = this.auth.isLoggedIn();
    if (!this.logeado) {
      this.cargando = false;
      this.router.navigate(['/login'], {
        queryParams: { redirect: '/perfil' },
        replaceUrl: true
      });
      return;
    }

    // Pinta con lo que quedó del login
    this.pintarDesdeLocal();
    this.cargando = false;

    // Refresca desde backend (no rompe la UI si falla)
    this.perfilService.getPerfilActual().subscribe({
      next: (u) => {
        if (!u) return;
        if (u.fecharegistro) u.fecharegistro = new Date(u.fecharegistro as any);
        this.usuario = u;
      },
      error: (e) => {
        console.warn('No se pudo refrescar /usuario/me:', e?.status || e);
      }
    });
  }

  private pintarDesdeLocal(): void {
    const local = this.auth.getUsuario();
    if (local) {
      this.usuario = {
        ...local,
        fecharegistro: local.fecharegistro ? new Date(local.fecharegistro) : (undefined as any)
      };
    } else {
      // ★ Sin usuario en storage → fuerza estado no logueado y redirige
      this.logeado = false;
      this.router.navigate(['/login'], {
        queryParams: { redirect: '/perfil' },
        replaceUrl: true
      });
    }
  }

  // ★ Cerrar sesión: limpia estado y al login
  cerrarSesion(): void {
    this.auth.logout();
    this.usuario = undefined;
    this.logeado = false;
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  irALogin(): void {
    this.router.navigate(['/login'], { queryParams: { redirect: '/perfil' } });
  }

  eliminarCuenta(): void {
    this.mostrarModalConfirmacion = true;
  }

  cancelarEliminacion(): void {
    this.mostrarModalConfirmacion = false;
  }

  // ★ Confirmar eliminación: borra, limpia estado y al login
  confirmarEliminacion(): void {
    if (!this.usuario?.idusuario) return;

    this.perfilService.eliminarCuenta(this.usuario.idusuario).subscribe({
      next: () => {
        this.mostrarModalConfirmacion = false;
        this.auth.logout();
        this.usuario = undefined;
        this.logeado = false;
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: () => {
        alert('No se pudo eliminar su cuenta.');
        this.mostrarModalConfirmacion = false;
      }
    });
  }
}
