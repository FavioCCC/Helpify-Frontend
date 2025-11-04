import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProyectoService } from '../../../services/proyectoService';

import { Proyecto } from '../../../models/proyecto';
import {IniciarsesionService} from '../../../services/inicarsesion-service';

@Component({
  selector: 'app-registro-proyecto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-proyecto.html',
  styleUrls: ['./registro-proyecto.css']
})
export class RegistroProyecto implements OnInit {
  private fb = inject(FormBuilder);
  private proyectoSrv = inject(ProyectoService);
  private auth = inject(IniciarsesionService);
  private router = inject(Router);

  form!: FormGroup;
  enviando = false;

  ngOnInit(): void {
    console.log('[REGISTRO] init');
    this.auth.debugAuth(); // imprime token, user, roles

    this.form = this.fb.group({
      nombreproyecto: ['', [Validators.required, Validators.maxLength(120)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      montoobjetivo: [null, [Validators.required, Validators.min(1)]],
      montorecaudado: [0, [Validators.min(0)]],
      fechainicio: ['', Validators.required],
      fechafin: ['', Validators.required],
      nombreorganizacion: ['', [Validators.required, Validators.maxLength(120)]],
      escuelabeneficiada: ['', [Validators.required, Validators.maxLength(120)]],
      cupoMaximo: [null, [Validators.required, Validators.min(1)]],
      imagen: ['']
    });
  }

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      console.warn('[REGISTRO] onFileChange: sin archivos');
      return;
    }
    const file = input.files[0];
    console.log('[REGISTRO] Archivo seleccionado:', file.name, file.type, file.size);
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = String(reader.result);
      console.log('[REGISTRO] Imagen en base64 (primeros 50):', b64.substring(0, 50) + '...');
      this.form.patchValue({ imagen: b64 });
    };
    reader.onerror = (e) => console.error('[REGISTRO] Error leyendo archivo:', e);
    reader.readAsDataURL(file);
  }

  private toISO(dateStr: string): string {
    // dateStr = "2025-11-06"
    const date = new Date(dateStr + 'T00:00:00');
    const iso = date.toISOString().split('T')[0]; // solo YYYY-MM-DD
    console.log('[REGISTRO] Fecha convertida a ISO simple:', iso);
    return iso;
  }


  submit() {
    console.log('[REGISTRO] submit() llamado. isLoggedIn?', this.auth.isLoggedIn());
    console.log('[REGISTRO] Roles detectados:', this.auth['getRoles'] ? '(privado)' : this.auth.debugAuth());

    // 1) Valida rol
    if (!this.auth.isAdmin()) {
      console.warn('[REGISTRO] Bloqueado por rol. Usuario no es ADMIN');
      alert('Para registrar un proyecto debes tener rol de administrador');
      return;
    }

    // 2) Valida formulario
    if (this.form.invalid) {
      console.warn('[REGISTRO] Form inválido:', this.form.value, this.form.errors);
      this.form.markAllAsTouched();
      return;
    }

    // 3) Payload
    const v = this.form.value;
    const payload: Proyecto | any = {
      ...v,
      fechainicio: this.toISO(v.fechainicio),
      fechafin: this.toISO(v.fechafin),
    };
    console.log('[REGISTRO] Payload a enviar:', payload);

    // 4) POST
    this.enviando = true;
    this.proyectoSrv.crear(payload).subscribe({
      next: (resp) => {
        console.log('[REGISTRO] Éxito crear proyecto:', resp);
        alert('Proyecto registrado exitosamente');
        this.router.navigate(['/proyectos']);
      },
      error: (err) => {
        console.error('[REGISTRO] Error crear proyecto:', err);
        const status = err?.status;
        if (status === 403 || status === 401) {
          console.warn('[REGISTRO] Backend devolvió', status, '→ sin permisos / no autenticado');
        }
        alert(err?.error?.message || 'No se pudo registrar el proyecto');
        this.enviando = false;
      }
    });
  }
}
