import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { PagoDTO } from '../models/pago';
import { PagoRespuesta } from '../models/pago';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  pagar(dto: PagoDTO): Observable<PagoRespuesta> {
    return this.http.post<PagoRespuesta>(`${this.base}/pago`, dto);
  }



  mis(): Observable<PagoDTO[]> {
    return this.http.get<PagoDTO[]>(`${this.base}/pago/mis`);
  }

  listarTodos(): Observable<PagoDTO[]> {
    return this.http.get<PagoDTO[]>(`${this.base}/pago`);
  }

}
