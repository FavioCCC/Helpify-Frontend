import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario';
import { IniciarsesionService } from './inicarsesion-service';

@Injectable({ providedIn: 'root' })
export class UsuarioService {

  private http = inject(HttpClient);
  private auth = inject(IniciarsesionService);

  private api = environment.apiUrl;

  listarTodos(): Observable<Usuario[]> {
    const token = this.auth.getToken() || '';
    const headers = new HttpHeaders({ Authorization: token });

    return this.http.get<Usuario[]>(`${this.api}/usuarios`, {
      headers,
      withCredentials: true
    });
  }

  obtenerPorId(id: number): Observable<Usuario> {
    const token = this.auth.getToken() || '';
    const headers = new HttpHeaders({ Authorization: token });

    return this.http.get<Usuario>(`${this.api}/usuario/${id}`, {
      headers,
      withCredentials: true
    });
  }
}
