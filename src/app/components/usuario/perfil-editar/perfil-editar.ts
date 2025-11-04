import {Component, inject} from '@angular/core';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatFormField, MatFormFieldModule, MatLabel} from '@angular/material/form-field';


import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatSelect, MatOption, MatSelectModule} from '@angular/material/select';
import {PerfilService} from '../../../services/perfil-service';
import {Router, RouterLink} from '@angular/router';
import {Usuario} from '../../../models/usuario';
import {MatInputModule} from '@angular/material/input';

@Component({
  selector: 'app-perfil-editar',
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
  ],
  templateUrl: './perfil-editar.html',
  styleUrl: './perfil-editar.css',
})
export class PerfilEditar {
  perfilForm: FormGroup;
  fb: FormBuilder = inject(FormBuilder);
  perfilService = inject(PerfilService);
  router = inject(Router)
  cargando: boolean = true;
  usuario?: Usuario;

  constructor() {
    this.perfilForm = this.fb.group({
      idusuario: [''],
      nombredocumento: ['', Validators.required],
      numerodocumento: ['', [Validators.required, Validators.minLength(8)]],
      nombre: ['', Validators.required],
      apellidopaterno: ['', Validators.required],
      apellidomaterno: ['', Validators.required],
      celular: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      correo: ['', [Validators.required, Validators.email]]
      /*contrasena: ['', [Validators.required, Validators.minLength(6)]]*/
    });
  }

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.perfilService.getPerfilActual().subscribe({
      next: (usuario: Usuario) => {
        this.perfilForm.patchValue({
          idusuario: usuario.idusuario,
          nombredocumento: usuario.nombredocumento,
          numerodocumento: usuario.numerodocumento,
          nombre: usuario.nombre,
          apellidopaterno: usuario.apellidopaterno,
          apellidomaterno: usuario.apellidomaterno,
          celular: usuario.celular,
          correo: usuario.correo,
          //contrasena: '', // se deja en blanco por seguridad
        });
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar el perfil:', err);
        this.cargando = false;
      }
    });
  }

  onSubmit(): void {
    if (this.perfilForm.valid) {
      const usuarioActualizado: Usuario = {
        ...this.usuario,                // mantiene idusuario, rol, password, etc.
        ...this.perfilForm.value        // sobrescribe solo los campos del formulario
      };

      if (!this.perfilForm.value.contrasena) {
        delete (usuarioActualizado as any).contrasena;
      }

      console.log('Datos actualizados:', usuarioActualizado);


      this.perfilService.actualizarPerfil(usuarioActualizado).subscribe({
        next: (respuesta) => {
          console.log('Perfil actualizado correctamente:', respuesta);
          alert('Perfil actualizado con éxito');
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Error al actualizar perfil:', err);
          alert('Error al actualizar el perfil.');
        }
      });
    } else {
      console.warn('Formulario no válido');
    }
  }
}
