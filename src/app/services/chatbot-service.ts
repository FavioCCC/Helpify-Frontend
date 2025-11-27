import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {IniciarsesionService} from './inicarsesion-service';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  private http = inject(HttpClient);
  private auth = inject(IniciarsesionService);

  private urlChat = environment.apiUrl + '/chatbot';

  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', token);
    return headers;
  }

  enviarMensaje(message: string): Observable<{ reply: string }> {
    const body = { message };

    return this.http.post<{ reply: string }>(this.urlChat, body, {
      withCredentials: true,
      headers: this.authHeaders()
    });
  }

}

