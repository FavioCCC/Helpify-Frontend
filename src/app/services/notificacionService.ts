import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notificacion } from '../models/notificacion';
import { IniciarsesionService } from './inicarsesion-service';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private http = inject(HttpClient);
  private auth = inject(IniciarsesionService);


  private baseUrl = environment.apiUrl;

  // Endpoints específicos de Notificación
  private urlListarTodo = `${this.baseUrl}/notificaciones/listartodo`;
  private urlListarPorUsuario = `${this.baseUrl}/notificaciones/usuario`;
  private urlCrear = `${this.baseUrl}/notificacion/crear`;
  private urlMarcarLeida = `${this.baseUrl}/notificacion/leer`;
  private urlEliminar = `${this.baseUrl}/notificacion`;

  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', token);
    }
    return headers;
  }

  private getRequestOptions() {
    return {
      withCredentials: true,
      headers: this.authHeaders()
    };
  }

  // --- Métodos del Servicio ---

  listarTodas(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(this.urlListarTodo, this.getRequestOptions());
  }


  listarPorUsuario(idUsuario: number): Observable<Notificacion[]> {
    const url = `${this.urlListarPorUsuario}/${idUsuario}`;
    return this.http.get<Notificacion[]>(url, this.getRequestOptions());
  }


  crear(data: Notificacion): Observable<Notificacion> {
    return this.http.post<Notificacion>(this.urlCrear, data, this.getRequestOptions());
  }

  marcarComoLeida(id: number): Observable<Notificacion> {
    const url = `${this.urlMarcarLeida}/${id}`;
    return this.http.put<Notificacion>(url, null, this.getRequestOptions());
  }

  eliminar(id: number): Observable<void> {
    const url = `${this.urlEliminar}/${id}`;
    return this.http.delete<void>(url, this.getRequestOptions());
  }
}
