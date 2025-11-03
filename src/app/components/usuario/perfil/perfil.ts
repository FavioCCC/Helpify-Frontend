import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Usuario } from '../../../models/usuario';
import {PerfilService} from '../../../services/perfil-service';
import {catchError, finalize, of} from 'rxjs';
import {IniciarsesionService} from '../../../services/inicarsesion-service';


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

  constructor(
    private auth: IniciarsesionService,
    private perfilService: PerfilService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1) ¿Hay token?
    this.logeado = this.auth.isLoggedIn();
    if (!this.logeado) { this.cargando = false; return; }

    // 2) Pinta de inmediato con lo que ya guardaste en el login
    this.pintarDesdeLocal();
    this.cargando = false; // no te quedes en "Cargando..."

    // 3) (Opcional) Refresca desde el backend SIN romper la UI si falla
    this.perfilService.getPerfilActual().subscribe({
      next: (u) => {
        if (!u) return;
        if (u.fecharegistro) u.fecharegistro = new Date(u.fecharegistro as any);
        this.usuario = u; // actualiza con lo más nuevo del server
      },
      error: (e) => {
        // No cambies la vista; ya está pintada con localStorage
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
      // Si por algún motivo no hay usuario guardado, fuerza el estado "no logueado"
      this.logeado = false;
    }
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  eliminarCuenta(): void {
    if (!this.usuario) return;
    if (confirm('¿Eliminar su cuenta de forma permanente?')) {
      this.perfilService.eliminarCuenta(this.usuario.idusuario).subscribe({
        next: () => { this.auth.logout(); this.router.navigate(['/']); },
        error: () => alert('No se pudo eliminar la cuenta.')
      });
    }
  }

  irALogin(): void {
    this.router.navigate(['/login'], { queryParams: { redirect: '/' } });
  }



}
