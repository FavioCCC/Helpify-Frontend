import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProyectoService } from '../../../services/proyectoService';
import { Proyecto } from '../../../models/proyecto';
import { IniciarsesionService } from '../../../services/inicarsesion-service';

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
  mensajeExito = '';
  error = '';

  ngOnInit(): void {
    console.log('[REGISTRO] init');
    this.auth.debugAuth();

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

  limpiarMensajes() {
    this.mensajeExito = '';
    this.error = '';
  }

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => this.form.patchValue({ imagen: String(reader.result) });
    reader.readAsDataURL(file);
  }

  private toISO(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toISOString().split('T')[0];
  }

  submit() {
    this.limpiarMensajes();
    console.log('[REGISTRO] submit() ejecutado');

    // 1) Verifica rol
    if (!this.auth.isAdmin()) {
      this.error = 'Para registrar un proyecto debes tener rol de ADMINISTRADOR.';
      console.warn('[REGISTRO] Bloqueado por rol.');
      return;
    }

    // 2) Verifica formulario
    if (this.form.invalid) {
      this.error = 'Por favor, completa todos los campos obligatorios.';
      this.form.markAllAsTouched();
      return;
    }

    // 3) Crea payload
    const v = this.form.value;
    const payload: Proyecto | any = {
      ...v,
      fechainicio: this.toISO(v.fechainicio),
      fechafin: this.toISO(v.fechafin)
    };

    // 4) Envía al backend
    this.enviando = true;
    this.proyectoSrv.crear(payload).subscribe({
      next: () => {
        this.mensajeExito = 'Proyecto registrado correctamente. Redirigiendo...';
        console.log('[REGISTRO] Proyecto creado');
        setTimeout(() => this.router.navigate(['/proyectos']), 1500);
      },
      error: (e) => {
        console.error('[REGISTRO] Error al crear proyecto:', e);
        if (e?.status === 401) {
          this.error = 'Error: Debes iniciar sesión para registrar un proyecto.';
        } else if (e?.status === 403) {
          this.error = 'Error: No tienes el rol de ADMINISTRADOR para registrar proyectos.';
        } else {
          const detalle = e?.error?.message || e.message || e.statusText || 'Error desconocido';
          this.error = `No se pudo registrar el proyecto. Motivo: ${detalle}`;
        }
      },
      complete: () => this.enviando = false
    });
  }
}
