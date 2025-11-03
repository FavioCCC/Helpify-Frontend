import { Component } from '@angular/core';
import {Router, RouterOutlet, RouterLink, RouterLinkActive} from '@angular/router';
import { NgIf } from '@angular/common';
import {IniciarsesionService} from './services/inicarsesion-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.css'] // <-- plural
})
export class App {
  constructor(
    private router: Router,
    private auth: IniciarsesionService
  ) {}

  menuOpened = false;
  isEditing: 'true' | 'false' = 'false';

  // ====== Menú ======
  toggleMenu(): void { this.menuOpened = !this.menuOpened; }
  closeMenu(): void { this.menuOpened = false; }

  // ====== Botón INICIAR SESIÓN ======
  onLogin(): void {
    this.router.navigate(['/login'], { queryParams: { redirect: this.router.url } });
  }

  // ====== Submenú HOME → PERFIL ======
  irAPerfil(ev: MouseEvent): void {
    ev.stopPropagation();        // evita cierre prematuro del menú
    this.menuOpened = false;

    const logged = !!this.auth.getToken(); // usa tu token 'auth_token'
    if (logged) {
      this.router.navigate(['/perfil']);
    } else {
      this.router.navigate(['/login'], { queryParams: { redirect: '/perfil' } });
    }
  }

  // ====== Utilidades ======
  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  toggleEdit(): void {
    this.isEditing = this.isEditing === 'true' ? 'false' : 'true';
  }
}
