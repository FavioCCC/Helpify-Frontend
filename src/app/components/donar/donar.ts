import {
  Component, ElementRef, AfterViewInit, OnDestroy,
  Renderer2
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DonarService } from '../../services/donarService';
import { Donacion } from '../../models/donar';

@Component({
    selector: 'app-donar',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './donar.html',
    styleUrls: ['./donar.css']
})
export class DonarComponent implements AfterViewInit, OnDestroy {

  // ========== Estado para mensajes en la UI ==========
  mensajeExito = '';
  mensajeError = '';

  // Mensajes de validación por campo (enlázalos en tu HTML con *ngIf)
  errors = {
    monto: '',
    titular: '',
    numero: '',
    venc: '',
    cvv: ''
  };

  // ========== Estado del comprobante ==========
  receiptVisible = false;
  proyectoNombre = 'Tecnología para Aprender';  // cámbialo si viene por ruta/servicio
  receipt = {
    donante: '',
    proyecto: '',
    monto: 0,
    metodo: 'Tarjeta',
    last4: '',
    fecha: '',
    estado: 'Completa'
  };

  // ========== Referencias a elementos (por ID en el template) ==========
  private chipsEl!: HTMLElement;
  private otherEl!: HTMLInputElement;
  private amountTextEl!: HTMLElement;
  private breakdownEl!: HTMLElement;
  private numeroEl!: HTMLInputElement;
  private vencEl!: HTMLInputElement;
  private cvvEl!: HTMLInputElement;
  private enviarEl!: HTMLButtonElement;
  private titularEl!: HTMLInputElement;

  private unsubs: Array<() => void> = [];
  private nf = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private donarService: DonarService
  ) {}

  // ========== Utilidades equivalentes a tu JS ==========
  private setAmount(n: number) {
    const amount = isNaN(n) ? 0 : Math.max(0, Number(n));
    if (this.amountTextEl) this.amountTextEl.textContent = `S/ ${this.nf.format(amount)}`;
    if (this.breakdownEl) this.breakdownEl.textContent = amount > 0 ? 'Donación seleccionada' : '';
  }

  private getAmountFromDOM(): number {
    if (!this.amountTextEl) return 0;
    const txt = this.amountTextEl.textContent ?? '';
    return Number(txt.replace(/[^\d.]/g, '')) || 0;
  }

  private clearChipsActive() {
    if (!this.chipsEl) return;
    Array.from(this.chipsEl.children).forEach(c => (c as HTMLElement).classList.remove('active'));
  }

  // ========== Validación de campos ==========
  private validate(): boolean {
    // limpia mensajes
    this.errors = { monto: '', titular: '', numero: '', venc: '', cvv: '' };
    this.mensajeError = '';

    const amount = this.getAmountFromDOM();
    const name = (this.titularEl?.value || '').trim();
    const card = (this.numeroEl?.value || '').replace(/\s/g, '');
    const mmYY = (this.vencEl?.value || '').trim();
    const cvv = (this.cvvEl?.value || '').trim();

    let ok = true;

    if (amount <= 0) { this.errors.monto = 'Selecciona o ingresa un monto válido.'; ok = false; }
    if (!name) { this.errors.titular = 'Ingresa el nombre del titular.'; ok = false; }
    if (card.length < 13) { this.errors.numero = 'Número de tarjeta inválido.'; ok = false; }
    if (!/^\d{2}\/\d{2}$/.test(mmYY)) { this.errors.venc = 'Vencimiento inválido. Usa MM/AA.'; ok = false; }
    if (cvv.length < 3) { this.errors.cvv = 'CVV inválido.'; ok = false; }

    if (!ok) this.mensajeError = 'Revisa los campos marcados.';
    return ok;
  }

  // ========== Click en Donar (muestra comprobante si todo OK) ==========
  private onDonarClick() {
    this.mensajeExito = '';
    this.mensajeError = '';
    if (!this.validate()) return;

    const amount = this.getAmountFromDOM();
    const name = (this.titularEl?.value || '').trim();
    const card = (this.numeroEl?.value || '').replace(/\s/g, '');

    // armar payload para backend
    const donacion: Pick<Donacion, 'monto' | 'metodoPago' | 'titular'> = {
      monto: amount,
      metodoPago: 'Tarjeta',
      titular: name
    };

    this.donarService.create(donacion).subscribe({
      next: () => {
        // construir comprobante
        const now = new Date();
        this.receipt = {
          donante: name,
          proyecto: this.proyectoNombre,
          monto: amount,
          metodo: 'Tarjeta',
          last4: card.slice(-4),
          fecha: `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}, ${now.toLocaleTimeString('es-PE', { hour12: false })}`,
          estado: 'Completa'
        };
        this.receiptVisible = true;  // ← muestra el modal
        this.mensajeExito = `¡Gracias! Se registró una donación de S/ ${this.nf.format(amount)}.`;

        // reset visual
        this.clearChipsActive();
        this.otherEl.value = '';
        this.numeroEl.value = '';
        this.vencEl.value = '';
        this.cvvEl.value = '';
        this.titularEl.value = '';
        this.setAmount(0);
      },
      error: (err) => {
        console.error(err);
        this.mensajeError = 'Ocurrió un error al procesar tu donación.';
      }
    });
  }

  closeReceipt(): void { this.receiptVisible = false; }

  // ========== Eventos (Renderer2) ==========
  private wireEvents() {
    // Chips (delegado)
    this.unsubs.push(
      this.renderer.listen(this.chipsEl, 'click', (e: Event) => {
        const chip = (e.target as HTMLElement).closest('.chip') as HTMLElement | null;
        if (!chip) return;
        this.clearChipsActive();
        chip.classList.add('active');
        const value = Number(chip.dataset['value'] || 0);
        this.otherEl.value = `S/ ${value}`;
        this.setAmount(value);
        this.errors.monto = ''; // limpia error si lo había
      })
    );

    // Otro monto (input/blur)
    this.unsubs.push(
      this.renderer.listen(this.otherEl, 'input', () => {
        const raw = this.otherEl.value.replace(/[^\d.]/g, '');
        const val = raw ? Number(raw) : 0;
        this.setAmount(val);
        this.clearChipsActive();
        this.errors.monto = ''; // limpia si escribe
      })
    );
    this.unsubs.push(
      this.renderer.listen(this.otherEl, 'blur', () => {
        const raw = this.otherEl.value.replace(/[^\d.]/g, '');
        const val = raw ? Number(raw) : 0;
        this.otherEl.value = val ? `S/ ${val}` : '';
      })
    );

    // Número tarjeta #### #### #### ####
    this.unsubs.push(
      this.renderer.listen(this.numeroEl, 'input', () => {
        let v = this.numeroEl.value.replace(/\D/g, '').slice(0, 16);
        this.numeroEl.value = v.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
        this.errors.numero = '';
      })
    );

    // Vencimiento MM/AA
    this.unsubs.push(
      this.renderer.listen(this.vencEl, 'input', () => {
        let v = this.vencEl.value.replace(/\D/g, '').slice(0, 4);
        if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
        this.vencEl.value = v;
        this.errors.venc = '';
      })
    );

    // CVV (3–4)
    this.unsubs.push(
      this.renderer.listen(this.cvvEl, 'input', () => {
        this.cvvEl.value = this.cvvEl.value.replace(/\D/g, '').slice(0, 4);
        this.errors.cvv = '';
      })
    );

    // Titular
    this.unsubs.push(
      this.renderer.listen(this.titularEl, 'input', () => { this.errors.titular = ''; })
    );

    // Botón Donar
    this.unsubs.push(
      this.renderer.listen(this.enviarEl, 'click', () => this.onDonarClick())
    );
  }

  // ========== Ciclo de vida ==========
  ngAfterViewInit(): void {
    const root = this.el.nativeElement as HTMLElement;

    this.chipsEl      = root.querySelector('#chips')       as HTMLElement;
    this.otherEl      = root.querySelector('#otro')        as HTMLInputElement;
    this.amountTextEl = root.querySelector('#amountText')  as HTMLElement;
    this.breakdownEl  = root.querySelector('#breakdown')   as HTMLElement;
    this.numeroEl     = root.querySelector('#numero')      as HTMLInputElement;
    this.vencEl       = root.querySelector('#venc')        as HTMLInputElement;
    this.cvvEl        = root.querySelector('#cvv')         as HTMLInputElement;
    this.enviarEl     = root.querySelector('#enviar')      as HTMLButtonElement;
    this.titularEl    = root.querySelector('#titular')     as HTMLInputElement;

    // Validar que existan los IDs requeridos
    if (!this.chipsEl || !this.otherEl || !this.amountTextEl || !this.breakdownEl ||
      !this.numeroEl || !this.vencEl || !this.cvvEl || !this.enviarEl || !this.titularEl) {
      console.error('[DonarComponent] Faltan elementos con IDs requeridos en el template.');
      return;
    }

    // Valor inicial como tu JS
    this.otherEl.value = 'S/ 500';
    this.setAmount(500);

    // Conectar listeners
    this.wireEvents();
  }

  ngOnDestroy(): void {
    this.unsubs.forEach(u => { try { u(); } catch { /* noop */ } });
    this.unsubs = [];
  }

  // Back
  volver(): void { history.back(); }
}
