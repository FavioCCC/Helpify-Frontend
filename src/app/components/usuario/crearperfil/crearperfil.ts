import {Component, inject} from '@angular/core';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatFormField, MatFormFieldModule, MatLabel} from '@angular/material/form-field';


import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatSelect, MatOption, MatSelectModule} from '@angular/material/select';
import {PerfilService} from '../../../services/perfil-service';
import {Router, RouterLink} from '@angular/router';
import {Usuario} from '../../../models/usuario';
import {MatInputModule} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatCheckbox} from '@angular/material/checkbox';
@Component({
  selector: 'app-crearperfil',
  imports: [
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RouterLink,
    MatIcon,
    MatCheckbox,
  ],
  templateUrl: './crearperfil.html',
  styleUrl: './crearperfil.css',
})
export class PerfilCrear { // No necesita implementar OnInit si se elimina ngOnInit y cargarPerfil
  perfilForm: FormGroup;
  fb: FormBuilder = inject(FormBuilder);
  perfilService = inject(PerfilService); // O el servicio de registro/autenticación
  router = inject(Router)
  cargando: boolean = false; // Se inicia en false ya que no hay carga de datos

  constructor() {
    this.perfilForm = this.fb.group({
      // idusuario se elimina ya que lo genera la DB
      nombredocumento: ['', Validators.required],
      numerodocumento: ['', [Validators.required, Validators.minLength(8)]],
      nombre: ['', Validators.required],
      apellidopaterno: ['', Validators.required],
      apellidomaterno: ['', Validators.required],
      celular: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      correo: ['', [Validators.required, Validators.email]],
      // **Se añade el campo password/contrasena** para la creación
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['', Validators.required], // Campo para el Rol
      terminos: [false, Validators.requiredTrue] // Campo para el Checkbox
    });
  }

  // Se eliminan ngOnInit y cargarPerfil ya que no hay datos preexistentes que cargar

  onSubmit(): void {
    if (this.perfilForm.valid) {
      this.cargando = true; // Inicia la carga al enviar el formulario

      // Creamos el objeto con los datos del formulario, incluyendo el password
      const nuevoUsuario: Omit<Usuario, 'idusuario' | 'fecharegistro'> & { password: string } = {
        ...this.perfilForm.value
      };

      console.log('Datos de creación:', nuevoUsuario);

      // **CAMBIO CLAVE: Llamar al método de creación (ej. 'crearPerfil' o 'registrarUsuario')**
      this.perfilService.crearPerfil(nuevoUsuario).subscribe({
        next: (respuesta) => {
          this.cargando = false;
          console.log('Perfil creado correctamente:', respuesta);
          alert('Cuenta creada con éxito. Inicia sesión.');
          // Redirigir a la página de login o home después de la creación
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.cargando = false;
          console.error('Error al crear perfil:', err);
          alert('Error al crear el perfil. Inténtalo de nuevo.');
        }
      });
    } else {
      console.warn('Formulario no válido. Revisa los campos requeridos.');
      // Opcionalmente, puedes marcar todos los campos como 'touched' para mostrar errores
      this.perfilForm.markAllAsTouched();
    }
  }
}
