import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Comentario } from '../models/comentario';

@Injectable({
  providedIn: 'root'
})
export class ComentarioService {

  private http = inject(HttpClient);

  // GET todos -> /api/comentarios
  private urlListar: string = environment.apiUrl + '/comentarios';

  // POST, DELETE -> /api/comentario
  private urlComentario: string = environment.apiUrl + '/comentario';

  // 1) listar todos (este en tu controller NO está protegido)
  list(): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(this.urlListar, {
      withCredentials: true
    });
  }

  // 2) crear comentario -> el backend pone usuario e id, así que mandamos SOLO lo necesario
  create(comentario: Pick<Comentario, 'comentario' | 'estrella'>): Observable<Comentario> {
    return this.http.post<Comentario>(this.urlComentario, comentario, {
      withCredentials: true
    });
  }

  // 3) eliminar comentario
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlComentario}/${id}`, {
      withCredentials: true
    });
  }
}
