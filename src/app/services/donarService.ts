// src/app/services/pagoService.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { PagoDTO } from '../models/pago';


export interface DonacionProyectoRef { idproyecto: number; }
export interface DonacionCreate { monto?: number; proyecto: DonacionProyectoRef; }
export interface DonacionRespuesta { id: number; estado?: string; monto?: number; proyecto?: DonacionProyectoRef; }

@Injectable({ providedIn: 'root' })
export class DonacionService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  crear(d: DonacionCreate): Observable<DonacionRespuesta> {
    return this.http.post<DonacionRespuesta>(`${this.base}/donacion`, d);
  }

  pagar(dto: PagoDTO): Observable<{ mensaje: string; pago: PagoDTO }> {
    return this.http.post<{ mensaje: string; pago: PagoDTO }>(`${this.base}/pago`, dto);
  }

  listarTodos(): Observable<PagoDTO[]> {
    return this.http.get<PagoDTO[]>(`${this.base}/pago`);
  }
}

