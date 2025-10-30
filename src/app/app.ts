import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  constructor(private router: Router) {}
  menuOpened = false;
  isEditing: 'true' | 'false' = 'false';

  toggleMenu(): void {
    this.menuOpened = !this.menuOpened;
  }
  closeMenu(): void {
    this.menuOpened = false;
  }

  onLogin(): void {
    // ajusta la ruta según tu app
    this.router.navigate(['/login']);
  }

  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleEdit(): void {
    this.isEditing = this.isEditing === 'true' ? 'false' : 'true';
  }
}
