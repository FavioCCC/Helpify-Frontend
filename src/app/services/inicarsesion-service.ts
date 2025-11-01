import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {map, Observable, tap} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IniciarsesionService {
  private http = inject(HttpClient);

  // URL base
  private url = environment.apiUrl + '/autenticar';

  // POST → /api/autenticar
  login(data: { nombre: string; password: string }): Observable<any> {
    return this.http.post<any>(this.url, data, {
      observe: 'response',   // para leer encabezados
      withCredentials: true
    }).pipe(
      tap((res: HttpResponse<any>) => {
        // Leer token del header o del cuerpo
        let token = res.headers.get('Authorization');
        if (!token && res.body?.jwt) {
          token = 'Bearer ' + res.body.jwt;
        }

        // Guardar token y datos del usuario
        if (token) localStorage.setItem('auth_token', token);
        if (res.body) localStorage.setItem('auth_user', JSON.stringify(res.body));
      }),
      map(res => res.body)
    );
  }

  //Son métodos de utilidad para otros componentes del sistema

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getUsuario(): any {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  }
}
