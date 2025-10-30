import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Proyecto} from '../models/proyecto';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {
  private url = environment.apiUrl;
  private httpCliente: HttpClient = inject(HttpClient);


  constructor() {}
  list() :Observable<any>{
    console.log(this.url+'/proyectos');
    return this.httpCliente.get<Proyecto[]>(this.url+'/proyectos');
  }

}
