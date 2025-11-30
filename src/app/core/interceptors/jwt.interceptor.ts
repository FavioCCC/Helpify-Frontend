// src/app/core/interceptors/jwt.interceptor.ts
import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';


function readToken(): string | null {
  const t = localStorage.getItem('auth_token') || localStorage.getItem('token');
  if (!t) return null;
  return t.startsWith('Bearer ') ? t : `Bearer ${t}`;
}

function shouldSkipAuth(req: HttpRequest<any>): boolean {
  if (req.method === 'OPTIONS') return true;
  // TODAS las URLs públicas que NO necesitan token
  const publicUrls = [
    '/api/autenticar',
    '/api/usuario',        // <-- registro
    '/api/proyectos',
    '/api/proyectos/',
    '/api/buscar',
    '/api/chatbot'
  ];

  return publicUrls.some(url => req.url.includes(url));
}


export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  if (shouldSkipAuth(req)) return next(req);

  const bearer = readToken();

  // Si no hay token o ya viene Authorization, no hacemos nada
  if (!bearer || req.headers.has('Authorization')) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: bearer },
  });

  return next(authReq);
};
