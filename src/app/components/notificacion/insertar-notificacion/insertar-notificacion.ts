import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {NotificacionService} from '../../../services/notificacionService';
import {Usuario} from '../../../models/usuario';
import {map, Observable, startWith} from 'rxjs';
import {Notificacion} from '../../../models/notificacion';
import {UsuarioService} from '../../../services/usuario-service';

@Component({
  selector: 'app-insertar-notificacion',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatButtonModule
  ],
  templateUrl: './insertar-notificacion.html',
  styleUrl: './insertar-notificacion.css',
})
export class InsertarNotificacion {
  private fb = inject(FormBuilder);
  private notificacionService = inject(NotificacionService);
  private usuarioService = inject(UsuarioService);

  form!: FormGroup;

  usuarios: Usuario[] = [];
  filteredUsuarios$!: Observable<Usuario[]>;

  tiposNotificacion: string[] = ['Donación', 'Sistema', 'Proyecto'];

  enviando = false;

  ngOnInit(): void {
    this.form = this.fb.group({
      usuario: ['', Validators.required],   // guardamos el objeto Usuario
      tipo: ['', Validators.required],
      mensaje: ['', [Validators.required, Validators.maxLength(250)]]
    });

    this.cargarUsuarios();
    this.configurarFiltroUsuarios();
  }

  // ====== Carga de usuarios desde backend ======
  private cargarUsuarios(): void {
    this.usuarioService.listarTodos().subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (err) => {
        console.error('Error al listar usuarios', err);
        alert('No se pudieron cargar los usuarios para la notificación.');
      }
    });
  }

  // ====== Filtro para el autocomplete ======
  private configurarFiltroUsuarios(): void {
    this.filteredUsuarios$ = this.form.get('usuario')!.valueChanges.pipe(
      startWith(''),
      map(value => (typeof value === 'string' ? value : this.displayUsuario(value)) || ''),
      map(texto => this.filtrarUsuarios(texto))
    );
  }

  displayUsuario(usuario: Usuario): string {
    if (!usuario) return '';
    const nombreCompleto =
      `${usuario.nombre ?? ''} ${usuario.apellidopaterno ?? ''} ${usuario.apellidomaterno ?? ''}`.trim();
    return usuario.correo
      ? `${nombreCompleto} (${usuario.correo})`
      : nombreCompleto;
  }

  private filtrarUsuarios(texto: string): Usuario[] {
    const filtro = texto.toLowerCase();
    return this.usuarios.filter(u =>
      (u.nombre && u.nombre.toLowerCase().includes(filtro)) ||
      (u.apellidopaterno && u.apellidopaterno.toLowerCase().includes(filtro)) ||
      (u.apellidomaterno && u.apellidomaterno.toLowerCase().includes(filtro)) ||
      (u.correo && u.correo.toLowerCase().includes(filtro))
    );
  }

  // ====== Envío del formulario ======
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const usuarioSeleccionado = this.form.value.usuario as Usuario;

    const payload: any = {
      // NotificacionSinUsuarioDTO en backend
      usuarioId: usuarioSeleccionado.idusuario,
      mensaje: this.form.value.mensaje,
      tipo: this.form.value.tipo
    };

    this.enviando = true;

    this.notificacionService.crear(payload as Notificacion).subscribe({
      next: (resp) => {
        console.log('Notificación creada', resp);
        this.enviando = false;
        this.form.reset();
        alert('Notificación enviada correctamente');
      },
      error: (err) => {
        console.error('Error al crear notificación', err);
        this.enviando = false;
        alert('Ocurrió un error al enviar la notificación.');
      }
    });
  }

}
