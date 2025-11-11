// src/app/core/interceptors/jwt.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

function readToken(): string | null {
  // Tu login guarda 'auth_token'. Aceptamos con o sin 'Bearer '.
  const t = localStorage.getItem('auth_token') || localStorage.getItem('token');
  if (!t) return null;
  return t.startsWith('Bearer ') ? t : `Bearer ${t}`;
}

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const bearer = readToken();
  const authReq = bearer ? req.clone({ setHeaders: { Authorization: bearer } }) : req;
  return next(authReq);
};


