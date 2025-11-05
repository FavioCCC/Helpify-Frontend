import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IniciarsesionService } from '../../../services/inicarsesion-service';

@Component({
  selector: 'app-iniciarsesion',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './iniciarsesion.html',
  styleUrls: ['./iniciarsesion.css'],
})
export class Iniciarsesion {
  private auth = inject(IniciarsesionService);
  private router = inject(Router);

  usuario = '';
  password = '';

  // Mensajes para el toast (esquina superior derecha)
  mensajeExito = '';
  error = '';
  limpiarMensajes() {
    this.mensajeExito = '';
    this.error = '';
  }

  onSubmit() {
    // Validar campos vacíos
    if (!this.usuario.trim() || !this.password.trim()) {
      // alert('Ingrese la información de manera correcta.');
      this.error = 'Ingrese la información de manera correcta.';
      return; // evita continuar
    }

    // Si hay valores, llamar al backend
    this.auth.login({ nombre: this.usuario, password: this.password }).subscribe({
      next: (res) => {
        console.log('Sesión iniciada:', res);
        // alert('Inicio de sesión exitoso');
        this.mensajeExito = 'Inicio de sesión exitoso.';
        setTimeout(() => this.router.navigate(['/home']), 800);
      },
      error: (err) => {
        console.error(err);
        // alert('Credenciales inválidas o error de conexión');
        this.error = 'Credenciales inválidas o error de conexión.';
      },
    });
  }
}
