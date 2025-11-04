import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario';
import {IniciarsesionService} from './inicarsesion-service';


@Injectable({ providedIn: 'root' })
export class PerfilService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private auth = inject(IniciarsesionService);

  getPerfilActual(): Observable<Usuario> {
    const token = this.auth.getToken() || '';
    const headers = new HttpHeaders({ Authorization: token }); // ← manda Bearer ...

    return this.http.get<Usuario>(`${this.api}/usuario/me`, {
      headers,
      withCredentials: true
    });
  }

  crearPerfil(nuevoUsuario: Omit<Usuario, "idusuario" | "fecharegistro"> & { password: string }): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.api}/usuario`, nuevoUsuario, {
        withCredentials: true
    });

  }


  actualizarPerfil(usuario: Usuario): Observable<Usuario> {
    const token = this.auth.getToken() || '';
    return this.http.put<Usuario>(`${this.api}/usuario`, usuario, {
      headers: { Authorization: token },
      withCredentials: true
    });
  }

  eliminarCuenta(idusuario: number): Observable<void> {
    const token = this.auth.getToken() || '';
    return this.http.delete<void>(`${this.api}/usuario/${idusuario}`, {
      headers: { Authorization: token },
      withCredentials: true
    });
  }
}
