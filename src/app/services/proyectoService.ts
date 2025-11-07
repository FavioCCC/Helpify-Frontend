// src/app/services/proyectoService.ts
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Proyecto } from '../models/proyecto';
import {IniciarsesionService} from './inicarsesion-service';


@Injectable({ providedIn: 'root' })
export class ProyectoService {
  private http = inject(HttpClient);
  private auth = inject(IniciarsesionService);
  private url = environment.apiUrl; // ej: http://localhost:8080/api

  /** Opciones con Authorization + cookies */
  private authOptions() {
    const token = this.auth.getToken(); // ya incluye "Bearer ..."
    const headers = token ? new HttpHeaders({ Authorization: token }) : new HttpHeaders();
    console.log('[PROYECTO SERVICE] Enviando con Authorization?', !!token);
    return { headers, withCredentials: true };
  }

  list(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(`${this.url}/proyectos`, this.authOptions())
      .pipe(tap(() => console.log('[PROYECTO SERVICE] GET /proyectos')));
  }

  obtenerPorId(id: number): Observable<Proyecto> {
    return this.http.get<Proyecto>(`${this.url}/proyectos/${id}`, this.authOptions())
      .pipe(tap(() => console.log('[PROYECTO SERVICE] GET /proyectos/', id)));
  }

  listarProyectosConDonaciones(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(`${this.url}/proyectos/donaciones`, this.authOptions())
      .pipe(
        tap(() => console.log('[PROYECTO SERVICE] GET /proyectos/donaciones'))
      );
  }

  listarProyectosConInscripciones(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(`${this.url}/proyectos/inscripciones`, this.authOptions())
      .pipe(
        tap(() => console.log('[PROYECTO SERVICE] GET /proyectos/inscripciones'))
      );
  }

  // POST
  crear(proyecto: Proyecto): Observable<any> {
    console.log('[PROYECTO SERVICE] POST /proyecto payload:', proyecto);
    return this.http.post(`${this.url}/proyecto`, proyecto, this.authOptions())
      .pipe(tap({
        next: (r) => console.log('[PROYECTO SERVICE] OK POST /proyecto →', r),
        error: (e) => console.error('[PROYECTO SERVICE] ERROR POST /proyecto →', e)
      }));
  }

  // Búsquedas
  buscarPorNombre(nombre: string): Observable<Proyecto[]> {
    const params = new HttpParams().set('nombre', nombre);
    return this.http.get<Proyecto[]>(`${this.url}/buscar/nombre`, { ...this.authOptions(), params });
  }

  buscarPorMonto(monto: number): Observable<Proyecto[]> {
    const params = new HttpParams().set('monto', String(monto));
    return this.http.get<Proyecto[]>(`${this.url}/buscar/monto`, { ...this.authOptions(), params });
  }

  buscarPorAnioMes(anio: number, mes: number): Observable<Proyecto[]> {
    const params = new HttpParams().set('anio', String(anio)).set('mes', String(mes));
    return this.http.get<Proyecto[]>(`${this.url}/buscar/anio-mes`, { ...this.authOptions(), params });
  }

  agregarAWishlist(idProyecto: number): Observable<void> {
    return this.http.post<void>(`${this.url}/wishlist/agregar/${idProyecto}`, null, this.authOptions());
  }

  obtenerWishlist(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(`${this.url}/wishlist`, this.authOptions());
  }

  inscribirme(idProyecto: number): Observable<any> {
    const opts = this.authOptions();
    console.log('[INSCRIPCION] headers', (opts as any).headers?.keys?.());
    console.log('[INSCRIPCION] Authorization', (opts as any).headers?.get?.('Authorization'));
    return this.http.post(`${this.url}/inscripcion/${idProyecto}`, null, opts);
  }
  eliminarProyecto(idProyecto: number): Observable<void> {
    const token = this.auth.getToken() || '';

    // CORRECCIÓN CLAVE: Se añade responseType: 'text' para evitar el error de parsing.
    // Usamos 'text' as 'json' para satisfacer el tipado de TypeScript.
    return this.http.delete<void>(`${this.url}/proyecto/${idProyecto}`, {
      headers: { Authorization: token },
      withCredentials: true,
      responseType: 'text' as 'json' // <--- ESTA LÍNEA SOLUCIONA EL ERROR DE PARSING
    });
  }
}
