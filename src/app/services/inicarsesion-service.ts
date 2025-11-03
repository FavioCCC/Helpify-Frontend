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
        let token = res.headers.get('Authorization');
        if (!token && res.body?.jwt) token = res.body.jwt;

        if (token && !token.startsWith('Bearer ')) token = 'Bearer ' + token;

        if (token) localStorage.setItem('auth_token', token);
        if (res.body) localStorage.setItem('auth_user', JSON.stringify(res.body));
      }),
    );
  }

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

  // iniciarsesion.service.ts
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
