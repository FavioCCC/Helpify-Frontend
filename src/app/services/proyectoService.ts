import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proyecto } from '../models/proyecto';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {
  private httpCliente = inject(HttpClient);
  private url = environment.apiUrl; // se usa como this.url + '/proyectos'

  constructor() {}

  list(): Observable<any> {
    console.log(this.url + '/proyectos');
    return this.httpCliente.get<Proyecto[]>(this.url + '/proyectos');
  }

  // Búsquedas de backend
  buscarPorNombre(nombre: string): Observable<Proyecto[]> {
    const params = new HttpParams().set('nombre', nombre);
    return this.httpCliente.get<Proyecto[]>(this.url + '/proyectos/buscar/nombre', { params });
  }

  buscarPorMonto(monto: number): Observable<Proyecto[]> {
    const params = new HttpParams().set('monto', String(monto));
    return this.httpCliente.get<Proyecto[]>(this.url + '/proyectos/buscar/monto', { params });
  }

  buscarPorAnioMes(anio: number, mes: number): Observable<Proyecto[]> {
    const params = new HttpParams().set('anio', String(anio)).set('mes', String(mes));
    return this.httpCliente.get<Proyecto[]>(this.url + '/proyectos/buscar/anio-mes', { params });
  }
}
