import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatSelectModule, MatOption } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { PerfilService } from '../../../services/perfil-service';
import { Usuario } from '../../../models/usuario';
import { CommonModule, NgIf } from '@angular/common';

type TipoDoc = 'DNI' | 'RUC' | 'CE';
type Rol = 'VOLUNTARIO' | 'DONANTE';

@Component({
  selector: 'app-crear-cuenta',
  standalone: true,
  imports: [
    CommonModule, NgIf,
    MatCard, MatCardTitle, MatCardContent,
    MatFormField, MatFormFieldModule, MatLabel,
    MatSelect, MatOption, MatSelectModule,
    MatInputModule, MatCheckboxModule, MatButtonModule,
    ReactiveFormsModule, RouterLink
  ],
  templateUrl: './crearperfil.html',
  styleUrl: './crearperfil.css'
})
export class CrearCuenta {
  fb: FormBuilder = inject(FormBuilder);
  perfilService = inject(PerfilService);
  router = inject(Router);

  cargando = false;

  ROL_ID_MAP: Record<Rol, number> = {
    VOLUNTARIO: 2,
    DONANTE: 3
  };

  crearCuentaForm: FormGroup = this.fb.group({
    nombredocumento: this.fb.control<TipoDoc | null>(null, { validators: [Validators.required] }),
    numerodocumento: this.fb.control('', { validators: [Validators.required, Validators.minLength(8)] }),
    nombre: this.fb.control('', { validators: [Validators.required] }),
    apellidopaterno: this.fb.control('', { validators: [Validators.required] }),
    apellidomaterno: this.fb.control('', { validators: [Validators.required] }),
    celular: this.fb.control('', { validators: [Validators.required, Validators.pattern('^[0-9]{9}$')] }),
    correo: this.fb.control('', { validators: [Validators.required, Validators.email] }),
    password: this.fb.control('', { validators: [Validators.required, Validators.minLength(6)] }),
    rol: this.fb.control<Rol | null>(null, { validators: [Validators.required] }),
    aceptaTerminos: this.fb.control(false, { validators: [Validators.requiredTrue] })
  });

  onSubmit(): void {
    if (this.crearCuentaForm.invalid) {
      this.crearCuentaForm.markAllAsTouched();
      alert('Completa los campos requeridos.');
      return;
    }

    const v = this.crearCuentaForm.value;
    const rol = v.rol as Rol;
    const idRol = this.ROL_ID_MAP[rol];

    const nuevoUsuario: Omit<Usuario, 'idusuario' | 'fecharegistro'> & { idRol: number } = {
      nombredocumento: v.nombredocumento as TipoDoc,
      numerodocumento: v.numerodocumento!,
      nombre: v.nombre!,
      apellidopaterno: v.apellidopaterno!,
      apellidomaterno: v.apellidomaterno!,
      celular: v.celular!,
      correo: v.correo!,
      password: v.password!,
      idRol
    };

    this.cargando = true;
    this.perfilService.crearCuenta(nuevoUsuario).subscribe({
      next: (resp) => {
        console.log('Cuenta creada:', resp);
        this.cargando = false;
        alert('Cuenta creada exitosamente');
        void this.router.navigate(['/login']);
      },
      error: (err) => {
        this.cargando = false;
        console.error(err);

        // Ajusta estas condiciones a lo que devuelva tu backend:
        const esDuplicado =
          err?.status === 409 ||
          err?.error?.code === 'DNI_DUPLICADO' ||
          /documento.*(existe|registrado)/i.test(err?.error?.message || '');

        if (esDuplicado) {
          const ctrl = this.crearCuentaForm.get('numerodocumento');
          // preserva otros errores que ya pudiera tener el control
          const prev = ctrl?.errors || {};
          ctrl?.setErrors({ ...prev, dniDuplicado: true });
          ctrl?.markAsTouched();
          ctrl?.updateValueAndValidity();


          return;
        }

        alert('Error al registrar la cuenta. El DNI ya existe');
      }
    });
  }
}
