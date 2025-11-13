import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IniciarsesionService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/autenticar';

  // POST → /api/autenticar
  login(data: { nombre: string; password: string }): Observable<any> {
    console.log('[LOGIN] Enviando credenciales a', this.url, data);
    return this.http.post<any>(this.url, data, {
      observe: 'response',
      withCredentials: true
    }).pipe(
      tap((res: HttpResponse<any>) => {
        console.log('[LOGIN] Status:', res.status);
        console.log('[LOGIN] Headers Authorization:', res.headers.get('Authorization'));
        console.log('[LOGIN] Body:', res.body);

        let token = res.headers.get('Authorization');
        if (!token && res.body?.jwt) token = res.body.jwt;

        if (token && !token.startsWith('Bearer ')) token = 'Bearer ' + token;

        if (token) {
          localStorage.setItem('auth_token', token);
          console.log('[LOGIN] Token guardado:', token);
          try {
            const payload = this.decodeJwtPayload(token);
            console.log('[LOGIN] JWT payload decodificado:', payload);
          } catch (e) {
            console.warn('[LOGIN] No se pudo decodificar el JWT:', e);
          }
        } else {
          console.warn('[LOGIN] No se recibió token');
        }

        if (res.body) {
          localStorage.setItem('auth_user', JSON.stringify(res.body));
          console.log('[LOGIN] Usuario guardado en localStorage:', res.body);
        } else {
          console.warn('[LOGIN] No se recibió body de usuario');
        }
      }),
    );
  }

  logout(): void {
    console.log('[AUTH] Logout: limpiando storage');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  getToken(): string | null {
    const t = localStorage.getItem('auth_token');
    console.log('[AUTH] getToken() →', t ? t.substring(0, 20) + '...' : null);
    return t;
  }

  getUsuario(): any {
    const user = localStorage.getItem('auth_user');
    const parsed = user ? JSON.parse(user) : null;
    console.log('[AUTH] getUsuario() →', parsed);
    return parsed;
  }

  isLoggedIn(): boolean {
    const ok = !!this.getToken();
    console.log('[AUTH] isLoggedIn() →', ok);
    return ok;
  }

  /** ==== Helpers de roles (con logs) ==== */
  private decodeJwtPayload(bearerToken: string): any {
    try {
      const token = bearerToken.replace(/^Bearer\s+/i, '');
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  private getRoles(): string[] {
    // 1) Primero intenta desde auth_user
    const u = this.getUsuario();
    let roles: string[] = [];

    if (u?.roles && Array.isArray(u.roles)) {
      roles = u.roles.map((r: string) => r.toUpperCase());
      console.log('[ROLES] desde user.roles:', roles);
    } else if (u?.authorities && Array.isArray(u.authorities) && typeof u.authorities[0] === 'string') {
      roles = u.authorities.map((a: string) => a.replace(/^ROLE_/, '').toUpperCase());
      console.log('[ROLES] desde user.authorities(string[]):', roles);
    } else if (u?.authorities && Array.isArray(u.authorities) && typeof u.authorities[0] === 'object') {
      roles = u.authorities.map((o: any) => String(o.authority || ''))
        .map((a: string) => a.replace(/^ROLE_/, '').toUpperCase());
      console.log('[ROLES] desde user.authorities(object[]):', roles);
    } else if (u?.role) {
      roles = [String(u.role).toUpperCase()];
      console.log('[ROLES] desde user.role:', roles);
    }

    // 2) Si no hay en user, intenta leer del JWT
    if (roles.length === 0) {
      const t = this.getToken();
      const payload = t ? this.decodeJwtPayload(t) : null;
      if (payload) {
        if (Array.isArray(payload.roles)) {
          roles = payload.roles.map((r: string) => r.replace(/^ROLE_/, '').toUpperCase());
          console.log('[ROLES] desde JWT.roles:', roles);
        } else if (Array.isArray(payload.authorities)) {
          roles = payload.authorities.map((r: any) =>
            String(r?.authority ?? r).replace(/^ROLE_/, '').toUpperCase()
          );
          console.log('[ROLES] desde JWT.authorities:', roles);
        } else if (typeof payload.scope === 'string') {
          // ej: "ROLE_ADMIN ROLE_USER"
          roles = payload.scope.split(/\s+/).map((s: string) => s.replace(/^ROLE_/, '').toUpperCase());
          console.log('[ROLES] desde JWT.scope:', roles);
        }
      } else {
        console.warn('[ROLES] No hay payload JWT para inferir roles');
      }
    }

    console.log('[ROLES] Final →', roles);
    return roles;
  }

  userHasRole(role: string): boolean {
    const roles = this.getRoles().map(r => r.replace(/^ROLE_/, '').toUpperCase());
    const ok = roles.includes(String(role).toUpperCase());
    console.log(`[ROLES] userHasRole(${role}) →`, ok, '| Roles detectados:', roles);
    return ok;
  }


  isAdmin(): boolean {
    const ok = this.userHasRole('ADMIN');
    console.log('[ROLES] isAdmin() →', ok);
    return ok;
  }

  /** debug rápido para ver todo junto en consola */
  debugAuth() {
    const t = this.getToken();
    const user = this.getUsuario();
    const roles = this.getRoles();
    console.log('[DEBUG AUTH] token:', t);
    console.log('[DEBUG AUTH] user:', user);
    console.log('[DEBUG AUTH] roles:', roles);
    return { token: t, user, roles };
  }
}
