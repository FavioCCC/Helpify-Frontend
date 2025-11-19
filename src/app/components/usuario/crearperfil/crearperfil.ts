// src/app/components/usuario/crearperfil/crearperfil.ts
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';

import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatSelectModule, MatOption } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { PerfilService } from '../../../services/perfil-service';
import { IniciarsesionService } from '../../../services/inicarsesion-service';
import { Usuario } from '../../../models/usuario';
import { CodigouniversitarioComponent } from './codigouniversitario/codigouniversitario';
import {UniversitarioService} from '../../../services/universitarioService';

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
    MatDialogModule,
    ReactiveFormsModule, RouterLink
  ],
  templateUrl: './crearperfil.html',
  styleUrl: './crearperfil.css'
})
export class CrearCuenta {
  fb = inject(FormBuilder);
  perfilService = inject(PerfilService);
  auth = inject(IniciarsesionService);
  univ = inject(UniversitarioService);
  dialog = inject(MatDialog);
  router = inject(Router);

  cargando = false;
  ROL_ID_MAP: Record<Rol, number> = { VOLUNTARIO: 2, DONANTE: 3 };

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

  async onSubmit(): Promise<void> {
    if (this.crearCuentaForm.invalid) {
      this.crearCuentaForm.markAllAsTouched();
      alert('Completa los campos requeridos.');
      return;
    }

    const v = this.crearCuentaForm.value;
    const rol = v.rol as Rol;
    const idRol = this.ROL_ID_MAP[rol];

    // Si va a ser VOLUNTARIO → pedir código antes de continuar
    let codigoestudiante: string | null = null;
    if (rol === 'VOLUNTARIO') {
      codigoestudiante = await this.dialog
        .open(CodigouniversitarioComponent, {
          disableClose: true,
          autoFocus: true,
          panelClass: 'popup-voluntario'
        })
        .afterClosed()
        .toPromise();

      if (!codigoestudiante) {
        alert('Debes ingresar tu código de estudiante para completar el registro.');
        return;
      }
    }

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

    // 1) Crear usuario
    this.perfilService.crearCuenta(nuevoUsuario).subscribe({
      next: () => {
        // 2) Si es DONANTE, termina aquí
        if (rol !== 'VOLUNTARIO') {
          this.cargando = false;
          alert('Cuenta creada exitosamente.');
          void this.router.navigate(['/home']);
          return;
        }

        // 3) VOLUNTARIO → autenticarse para obtener JWT
        this.auth.login({ nombre: v.nombre!, password: v.password! }).subscribe({
          next: () => {
            // 4) Con el JWT, registrar universitario (solo manda código; el backend toma idusuario del token)
            this.univ.crearUniversitario({ codigoestudiante: codigoestudiante! }).subscribe({
              next: () => {
                this.cargando = false;
                alert('Cuenta y código de estudiante registrados correctamente.');
                void this.router.navigate(['/home']);
              },
              error: (e) => {
                this.cargando = false;
                console.error(e);
                alert('Cuenta creada. Error al registrar el código de estudiante.');
                void this.router.navigate(['/login']);
              }
            });
          },
          error: (e) => {
            this.cargando = false;
            console.error(e);
            alert('Cuenta creada. No fue posible autenticarse para registrar el código.');
            void this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        this.cargando = false;
        console.error(err);

        const esDuplicado =
          err?.status === 409 ||
          err?.error?.code === 'DNI_DUPLICADO' ||
          /documento.*(existe|registrado)/i.test(err?.error?.message || '');

        if (esDuplicado) {
          const ctrl = this.crearCuentaForm.get('numerodocumento');
          const prev = ctrl?.errors || {};
          ctrl?.setErrors({ ...prev, dniDuplicado: true });
          ctrl?.markAsTouched();
          ctrl?.updateValueAndValidity();
          return;
        }
        alert('Error al registrar la cuenta.');
      }
    });
  }
}
