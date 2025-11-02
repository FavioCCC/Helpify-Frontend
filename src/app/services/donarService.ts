import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Donacion } from '../models/donar';

@Injectable({
  providedIn: 'root'
})
export class DonarService {

  private http = inject(HttpClient);

  // Rutas base (ajústalas según tu backend)
  private urlListar = `${environment.apiUrl}/donaciones`;
  private urlDonacion = `${environment.apiUrl}/donacion`;

  /**
   * 1) Listar todas las donaciones
   * Ejemplo: GET /api/donaciones
   */
  list(): Observable<Donacion[]> {
    return this.http.get<Donacion[]>(this.urlListar, { withCredentials: true });
  }

  /**
   * 2) Registrar una nueva donación
   * Ejemplo: POST /api/donacion
   *
   * @param donacion solo se envían los campos necesarios
   */
  create(donacion: Pick<Donacion, 'monto' | 'metodoPago' | 'titular'>): Observable<Donacion> {
    return this.http.post<Donacion>(this.urlDonacion, donacion, { withCredentials: true });
  }

  /**
   * 3) Eliminar una donación por ID
   * Ejemplo: DELETE /api/donacion/{id}
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlDonacion}/${id}`, { withCredentials: true });
  }

  /**
   * 4) (Opcional) Obtener una donación específica
   * Ejemplo: GET /api/donacion/{id}
   */
  getById(id: number): Observable<Donacion> {
    return this.http.get<Donacion>(`${this.urlDonacion}/${id}`, { withCredentials: true });
  }
}
