import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DonacionService } from '../../services/donarService';
import { PagoService } from '../../services/pagoService';

import { DonacionCreate, DonacionRespuesta } from '../../models/donacion';
import { PagoDTO, PagoRespuesta } from '../../models/pago';

import { switchMap, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

type Receipt = {
  donante: string;
  proyecto: string;
  monto: number;
  metodo: string;
  last4: string;
  fecha: string;
  estado: string;
};

@Component({
  selector: 'app-donar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './donar.html',
  styleUrls: ['./donar.css']
})
export class DonarComponent implements OnInit {
  form!: FormGroup;

  // mensajes
  mensajeError = '';
  mensajeExito = '';

  // control de modal de comprobante
  receiptVisible = false;
  receipt: Receipt = {
    donante: '',
    proyecto: '',
    monto: 0,
    metodo: 'Tarjeta',
    last4: '',
    fecha: '',
    estado: 'OK'
  };

  // errores de validación
  errors: any = {
    monto: '',
    titular: '',
    numero: '',
    venc: '',
    cvv: ''
  };

  cargando = false;
  idProyecto!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private donacionService: DonacionService,
    private pagoService: PagoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.idProyecto = Number(this.route.snapshot.paramMap.get('idProyecto'));

    this.form = this.fb.group({
      monto: [null, [Validators.required, Validators.min(1)]],
      numerotarjeta: ['', [Validators.required, Validators.minLength(13)]],
      nombretitular: ['', [Validators.required, Validators.minLength(2)]],
      venc: ['', [Validators.required, this.mmAaValidator]],
      cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]]
    });
  }

  // ===== Helpers de formato/validación =====

  // Valida formato MM/AA (muy simple)
  private mmAaValidator = (control: any) => {
    const v: string = control.value || '';
    const ok = /^\d{2}\/\d{2}$/.test(v);
    return ok ? null : { mmAa: true };
  };

  // Convierte 'MM/AA' → 'YYYY-MM-01'
  private vencToISO(venc: string): string {
    if (!venc || venc.length !== 5) return '';
    const mm = venc.slice(0, 2);
    const yy = venc.slice(3);
    const year = parseInt(yy, 10);
    const yyyy = year >= 80 ? 1900 + year : 2000 + year;
    return `${yyyy}-${mm}-01`;
  }

  // ===== Eventos  =====

  volver(): void {
    history.back();
  }

  closeReceipt(): void {
    this.receiptVisible = false;
  }

  selectChip(valor: number): void {
    this.form.patchValue({ monto: valor });
  }

  onOtroMontoChange(ev: Event): void {
    const raw = (ev.target as HTMLInputElement).value || '';
    // limpia símbolos y convierte a número decimal
    const clean = raw.replace(/[^\d.,]/g, '').replace(',', '.');
    const num = parseFloat(clean);
    this.form.patchValue({ monto: isNaN(num) ? null : num });
  }

  onVencInput(ev: Event): void {
    let v = (ev.target as HTMLInputElement).value || '';
    // fuerza formato MM/AA en tiempo real
    v = v.replace(/[^\d]/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
    this.form.patchValue({ venc: v }, { emitEvent: false });
  }

  // ===== Flujo crear Donación → Pagar =====

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // mensajes simples por campo (los lees en tu HTML si quieres)
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';
    this.receiptVisible = false;

    // 1) Crear donación (usuario viene del JWT en el backend)
    const donacion: DonacionCreate = {
      monto: this.form.value.monto, // si tu back no usa monto en donación, puedes quitarlo
      proyecto: { idproyecto: this.idProyecto }
    };

    this.donacionService.crear(donacion).pipe(
      switchMap((d: DonacionRespuesta | null) => {
        if (!d?.id) return of(null);

        // 2) Pagar esa donación
        const dto: PagoDTO = {
          monto: this.form.value.monto,
          numerotarjeta: (this.form.value.numerotarjeta || '').replace(/\s+/g, ''),
          nombretitular: this.form.value.nombretitular,
          fechaexpiracion: this.vencToISO(this.form.value.venc),
          cvv: this.form.value.cvv, // el backend lo descarta/ignora
          donacion: { id: d.id }
        };
        return this.pagoService.pagar(dto);
      }),
      finalize(() => (this.cargando = false))
    )
      .subscribe({
        next: (resp: any) => {
          if (!resp) {
            this.mensajeError = 'No se pudo crear la donación.';
            return;
          }
          this.mensajeExito = resp?.mensaje || '¡Pago realizado con éxito!';

          const last4 = (resp?.pago?.numerotarjeta || '').slice(-4);
          this.receipt = {
            donante: this.form.value.nombretitular,
            proyecto: `#${this.idProyecto}`,
            monto: this.form.value.monto,
            metodo: 'Tarjeta',
            last4,
            fecha: new Date().toISOString().slice(0, 10),
            estado: resp?.pago?.status || 'OK'
          };
          this.receiptVisible = true;
          this.form.reset();
        },
        error: (err) => {
          if (err.status === 409 && (err.error?.message || '').toLowerCase().includes('pago')) {
            this.mensajeError = 'Esta donación ya fue pagada.';
          } else if (err.status === 403) {
            this.mensajeError = 'No tienes permisos para realizar esta operación.';
          } else if (err.status === 400) {
            this.mensajeError = 'Datos inválidos. Verifica el formulario.';
          } else if (err.status === 401) {
            this.mensajeError = 'Sesión expirada. Inicia sesión nuevamente.';
          } else {
            this.mensajeError = err?.error?.message || 'Ocurrió un error procesando el pago.';
          }
        }
      });
  }
}
