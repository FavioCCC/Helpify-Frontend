// src/app/services/universitario-service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IniciarsesionService } from './inicarsesion-service';

export interface UniversitarioPayload {
  codigoestudiante: string;
}

@Injectable({ providedIn: 'root' })
export class UniversitarioService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private auth = inject(IniciarsesionService);

  crearUniversitario(data: UniversitarioPayload): Observable<any> {
    const token = this.auth.getToken() || '';
    const headers = new HttpHeaders({ Authorization: token }); // "Bearer …"
    return this.http.post(`${this.api}/universitario`, data, {
      headers,
      withCredentials: true
    });
  }
}
