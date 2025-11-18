import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { IniciarsesionService } from './services/inicarsesion-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
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
    ev.stopPropagation();
    this.menuOpened = false;

    const logged = !!this.auth.getToken();
    if (logged) {
      this.router.navigate(['/perfil']);
    } else {
      this.router.navigate(['/login'], { queryParams: { redirect: '/perfil' } });
    }
  }

  scrollToFaq() {
    const faqSection = document.getElementById('faq');
    if (faqSection) {
      faqSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/home#faq';
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
// Retorna si hay un usuario autenticado
  get isAuthenticated(): boolean {
    return this.auth.isLoggedIn();
  }
  get esAdmin(): boolean {
    // asegurar que si no hay sesión devuelva false
    return this.isAuthenticated && this.auth.isAdmin();
  }
  get esVoluntario(): boolean {
    return this.isAuthenticated && this.auth.userHasRole('VOLUNTARIO');
  }
  get esDonante(): boolean {
    return this.isAuthenticated && this.auth.userHasRole('DONANTE');
  }
  get rolActual(): string {
    if (!this.isAuthenticated) {
      return 'INVITADO';
    }
    if (this.esAdmin) {
      return 'ADMIN';
    }
    if (this.esDonante) {
      return 'DONANTE';
    }
    if (this.esVoluntario) {
      return 'VOLUNTARIO';
    }
    return 'USUARIO';
  }

}
