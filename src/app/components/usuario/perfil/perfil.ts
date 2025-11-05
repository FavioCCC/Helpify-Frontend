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

  // mensajes del sistema
  mensajeExito = '';
  error = '';

  // Modal
  mostrarModalConfirmacion = false;

  constructor(
    private auth: IniciarsesionService,
    private perfilService: PerfilService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.logeado = this.auth.isLoggedIn();
    if (!this.logeado) {
      this.cargando = false;
      this.router.navigate(['/login'], {
        queryParams: { redirect: '/perfil' },
        replaceUrl: true
      });
      return;
    }

    this.pintarDesdeLocal();
    this.cargando = false;

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
      this.logeado = false;
      this.router.navigate(['/login'], {
        queryParams: { redirect: '/perfil' },
        replaceUrl: true
      });
    }
  }

    limpiarMensajes(): void {
    this.mensajeExito = '';
    this.error = '';
  }
    private flashExito(msg: string, ms = 2500): void {
    this.mensajeExito = msg;
    setTimeout(() => (this.mensajeExito = ''), ms);
  }

  private flashError(msg: string, ms = 3500): void {
    this.error = msg;
    setTimeout(() => (this.error = ''), ms);
  }

  //Cerrar sesión: muestra mensaje y redirige
  cerrarSesion(): void {
    this.auth.logout();
    this.flashExito('Sesión cerrada correctamente.');
    // pequeña pausa para que se vea el toast antes de salir
    setTimeout(() => {
      this.usuario = undefined;
      this.logeado = false;
      this.router.navigate(['/login'], { replaceUrl: true });
    }, 700);
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

  //Confirmar eliminación: borra, muestra éxito y redirige
  confirmarEliminacion(): void {
    if (!this.usuario?.idusuario) return;

    this.perfilService.eliminarCuenta(this.usuario.idusuario).subscribe({
      next: () => {
        this.mostrarModalConfirmacion = false;
        this.flashExito('Cuenta eliminada exitosamente.');
        // pausa para que el usuario alcance a leer el mensaje
        setTimeout(() => {
          this.auth.logout();
          this.usuario = undefined;
          this.logeado = false;
          this.router.navigate(['/login'], { replaceUrl: true });
        }, 900);
      },
      error: (e) => {
        this.mostrarModalConfirmacion = false;
        this.flashError(
          e?.error?.message || 'No se pudo eliminar su cuenta. Inténtelo nuevamente.'
        );
      }
    });
  }
}
