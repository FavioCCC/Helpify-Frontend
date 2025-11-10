import { Component, OnInit, inject,ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProyectoService } from '../../../services/proyectoService';
import { Proyecto } from '../../../models/proyecto';
import { firstValueFrom } from 'rxjs';
import {Usuario} from '../../../models/usuario';

@Component({
  selector: 'app-modificar-proyecto', // opcional: antes era 'app-info-proyecto'
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, ReactiveFormsModule],
  templateUrl: './modificar-proyecto.html',
  styleUrls: ['./modificar-proyecto.css']
})
export class ModificarProyecto implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private proyectoService = inject(ProyectoService);
  private fb = inject(FormBuilder);

  // Control de estado de imagen
  imagenModificada = false;       // true si el usuario eligió una nueva imagen
  private fileToken = 0;          // para invalidar lecturas previas del FileReader
  private fileReader?: FileReader; // por si queremos abortar

  //IMAGEN
  previewUrl: string | null = null;        // Miniatura y modal
  mostrarPreview = false;                   // Estado del modal
  private objectUrlTemporal: string | null = null; // Para revocar URL
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // === ESTADO UI ===
  form!: FormGroup;
  enviando = false;
  mensajeExito = '';
  error = '';

  // === CONTEXTO EDICIÓN ===
  idProyecto!: number;
  proyecto: Proyecto | null = null;
  archivoImagen: File | null = null;

  ngOnInit(): void {
    // 1) Inicializa el formulario (mismos campos/validaciones que usas al crear)
    this.form = this.fb.group({
      nombreproyecto: ['', Validators.required],
      descripcion: ['', Validators.required],
      montoobjetivo: [null, [Validators.required, Validators.min(1)]],
      montorecaudado: [0, [Validators.min(0)]],
      fechainicio: [null, Validators.required],
      fechafin: [null, Validators.required],
      nombreorganizacion: ['', Validators.required],
      escuelabeneficiada: ['', Validators.required],
      cupoMaximo: [null, [Validators.required, Validators.min(1)]],
      imagen: [null]
    }, { validators: this.validarRangoFechas });

    // 2) Lee el id de la ruta y carga el proyecto
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      this.error = 'Proyecto inválido.';
      return;
    }
    this.idProyecto = id;
    this.cargarYAutocompletar(id);
  }

  // === Validación de rango de fechas ===
  private validarRangoFechas = (group: FormGroup) => {
    const ini = group.get('fechainicio')?.value;
    const fin = group.get('fechafin')?.value;
    if (ini && fin && new Date(fin) < new Date(ini)) {
      group.get('fechafin')?.setErrors({ rangoFechas: true });
    } else {
      const err = group.get('fechafin')?.errors;
      if (err && err['rangoFechas']) {
        delete err['rangoFechas'];
        group.get('fechafin')?.setErrors(Object.keys(err).length ? err : null);
      }
    }
    return null;
  };

  // === Carga y patchValue ===
  private async cargarYAutocompletar(id: number) {
    this.error = '';
    try {
      const p = await firstValueFrom(this.proyectoService.obtenerPorId(id));
      this.proyecto = p;
      this.previewUrl = p.imagen ?? null;

      this.form.patchValue({
        nombreproyecto: p.nombreproyecto,
        descripcion: p.descripcion,
        montoobjetivo: p.montoobjetivo,
        montorecaudado: p.montorecaudado ?? 0,
        fechainicio: this.aInputDate(p.fechainicio),
        fechafin: this.aInputDate(p.fechafin),
        nombreorganizacion: p.nombreorganizacion,
        escuelabeneficiada: p.escuelabeneficiada,
        cupoMaximo: p.cupoMaximo,
        imagen: this.proyecto?.imagen ?? null
      });
    } catch (e) {
      console.error(e);
      this.error = 'No se pudo cargar el proyecto.';
    }
  }

  // Convierte Date/ISO a 'YYYY-MM-DD' para <input type="date">
  private aInputDate(value: string | Date | undefined | null) {
    if (!value) return null;
    const d = new Date(value);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    // Si tu back ya te envía 'YYYY-MM-DD', puedes simplemente: return value;
  }

  // === Imagen ===
  onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;

    const file = input.files[0];

    // Validaciones
    const tiposPermitidos = ['image/jpeg','image/png','image/webp'];
    const maxMB = 3;
    if (!tiposPermitidos.includes(file.type)) {
      this.error = 'Formato no permitido. Usa JPG, PNG o WebP.';
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      this.error = `El archivo supera ${maxMB} MB.`;
      return;
    }
    this.error = '';

    // Limpia URL temporal previa si la había
    if (this.objectUrlTemporal) {
      URL.revokeObjectURL(this.objectUrlTemporal);
      this.objectUrlTemporal = null;
    }

    // Preview inmediato
    const url = URL.createObjectURL(file);
    this.objectUrlTemporal = url;
    this.previewUrl = url;

    // Guarda archivo
    this.archivoImagen = file;

    // --- Conversión a base64 con token anti-carrera ---
    const token = ++this.fileToken;     // invalida lecturas previas
    const reader = new FileReader();
    this.fileReader = reader;

    reader.onload = () => {
      // si durante la lectura el usuario canceló o eligió otra, salimos
      if (token !== this.fileToken) return;

      const base64 = String(reader.result); // "data:image/...;base64,...."
      this.form.patchValue({ imagen: base64 });
      this.form.get('imagen')?.markAsDirty();
      this.imagenModificada = true;        // << importante
    };
    reader.onerror = () => {
      if (token !== this.fileToken) return;
      this.error = 'No se pudo leer la imagen seleccionada.';
    };
    reader.readAsDataURL(file);
  }


  abrirPreview() {
    if (this.previewUrl) this.mostrarPreview = true;
  }
  cerrarPreview() {
    this.mostrarPreview = false;
  }
  cancelarCambioImagen() {
    // Restaurar preview a la imagen original del proyecto
    this.previewUrl = this.proyecto?.imagen ?? null;

    // Anular archivo seleccionado
    this.archivoImagen = null;

    // Abortamos lectura si está en curso y anulamos tokens
    if (this.fileReader && this.fileReader.readyState === FileReader.LOADING) {
      try { this.fileReader.abort(); } catch {}
    }
    this.fileToken++; // invalida cualquier onload pendiente

    // Liberar URL temporal
    if (this.objectUrlTemporal) {
      URL.revokeObjectURL(this.objectUrlTemporal);
      this.objectUrlTemporal = null;
    }

    // Limpiar input file
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    // *** Restaurar el control del formulario ***
    this.form.patchValue({ imagen: this.proyecto?.imagen ?? null });
    this.form.get('imagen')?.markAsPristine();
    this.form.get('imagen')?.updateValueAndValidity({ emitEvent: false });

    // Ya no hay imagen nueva
    this.imagenModificada = false;
  }

  ngOnDestroy(): void {
    if (this.objectUrlTemporal) URL.revokeObjectURL(this.objectUrlTemporal);
  }

  // === Helpers UI ===
  limpiarMensajes() {
    this.mensajeExito = '';
    this.error = '';
  }

  // === Construye payload (FormData para soportar imagen) ===
  private buildFormData(): FormData {
    const f = this.form.value;
    const fd = new FormData();
    fd.append('nombreproyecto', f.nombreproyecto);
    fd.append('descripcion', f.descripcion);
    fd.append('montoobjetivo', String(f.montoobjetivo));
    fd.append('montorecaudado', String(f.montorecaudado ?? 0));
    fd.append('fechainicio', f.fechainicio);
    fd.append('fechafin', f.fechafin);
    fd.append('nombreorganizacion', f.nombreorganizacion);
    fd.append('escuelabeneficiada', f.escuelabeneficiada);
    fd.append('cupoMaximo', String(f.cupoMaximo));
    if (this.archivoImagen) fd.append('imagen', this.archivoImagen);
    return fd;
  }

  // === Submit => actualizar ===
  submit(): void {

    const formValue = this.form.value;

    const imagenAEnviar = this.imagenModificada
      ? formValue.imagen                       // base64 nueva
      : (this.proyecto?.imagen ?? null);

    if (this.form.valid) {
      const proyectoActualizado: Proyecto = {
        ...this.proyecto,                // mantiene idusuario, rol, password, etc.
        ...this.form.value  ,
        imagen: imagenAEnviar// sobrescribe solo los campos del formulario
      };



      console.log('Datos actualizados:', proyectoActualizado);

      this.proyectoService.actualizarProyecto(proyectoActualizado).subscribe({
        next: (respuesta) => {
          console.log('proyecto actualizado correctamente:', respuesta);
          this.mensajeExito = 'proyecto actualizado con éxito. Redirigiendo...';
          setTimeout(() => this.router.navigate(['/proyectos', this.idProyecto]), 1500);
        },
        error: (err) => {
          console.error('Error al actualizar proyecto:', err);
          this.error = err?.error?.message || 'Error al actualizar el proyecto.';
        }
      });
    } else {
      console.warn('Formulario no válido');
    }
  }
}
