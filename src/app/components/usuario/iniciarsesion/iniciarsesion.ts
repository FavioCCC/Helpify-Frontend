import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {IniciarsesionService} from '../../../services/inicarsesion-service';


@Component({
  selector: 'app-iniciarsesion',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './iniciarsesion.html',
  styleUrls: ['./iniciarsesion.css'],
})
export class Iniciarsesion {
  private auth = inject(IniciarsesionService);
  private router = inject(Router);

  usuario = '';
  password = '';

  onSubmit() {
    //Validar campos vacíos
    if (!this.usuario.trim() || !this.password.trim()) {
      alert('Ingrese la información de manera correcta.');
      return; // evita continuar
    }

    //Si hay valores, llamar al backend
    this.auth.login({ nombre: this.usuario, password: this.password }).subscribe({
      next: (res) => {
        console.log('Sesión iniciada:', res);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error(err);
        alert('Credenciales inválidas o error de conexión');
      },
    });
  }
}
