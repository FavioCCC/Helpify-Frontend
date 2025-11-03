import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Comentario } from '../models/comentario';
import { IniciarsesionService } from './inicarsesion-service';

@Injectable({ providedIn: 'root' })
export class ComentarioService {
  private http = inject(HttpClient);
  private auth = inject(IniciarsesionService);

  private urlListar = environment.apiUrl + '/comentarios';
  private urlComentario = environment.apiUrl + '/comentario';

  /** Headers con token si existe */
  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken(); // 'auth_token' guardado en login
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', token); // ya viene con 'Bearer ...'
    return headers;
  }

  list(): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(this.urlListar, {
      withCredentials: true,
      headers: this.authHeaders()
    });
  }

  create(data: Pick<Comentario, 'comentario' | 'estrella'>): Observable<Comentario> {
    return this.http.post<Comentario>(this.urlComentario, data, {
      withCredentials: true,
      headers: this.authHeaders()
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlComentario}/${id}`, {
      withCredentials: true,
      headers: this.authHeaders()
    });
  }
}
