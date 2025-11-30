import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf, NgFor } from '@angular/common';
import { ChatbotService } from '../../services/chatbot-service';
import { IniciarsesionService } from '../../services/inicarsesion-service';

interface Mensaje {
  from: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.css'],
  imports: [
    FormsModule,
    NgClass,
    NgIf,
    NgFor
  ]
})
export class ChatbotComponent implements OnInit {

  private chatbotService = inject(ChatbotService);
  private auth = inject(IniciarsesionService);

  mensajes: Mensaje[] = [
    { from: 'bot', text: '¡Hola! Soy el asistente virtual de Helpify 😊. ¿En qué puedo ayudarte?' }
  ];

  entradaUsuario: string = '';
  cargando: boolean = false;

  usuarioActual: any = null;
  esAdmin: boolean = false;
  esVoluntario: boolean = false;
  esDonante: boolean = false;

  ngOnInit(): void {
    this.usuarioActual = this.auth.getUsuario();
    this.resolverRoles();
  }

  private resolverRoles(): void {
    this.esAdmin = this.auth.userHasRole('ADMIN');
    this.esVoluntario = this.auth.userHasRole('VOLUNTARIO');
    this.esDonante = this.auth.userHasRole('DONANTE');
  }

  enviar(): void {
    const texto = this.entradaUsuario.trim();
    if (!texto) return;

    this.mensajes.push({ from: 'user', text: texto });
    this.entradaUsuario = '';
    this.cargando = true;

    this.chatbotService.enviarMensaje(texto).subscribe({
      next: (res: { reply: string }) => {
        this.mensajes.push({ from: 'bot', text: res.reply });
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error en chatbot:', err);

        if (err.status === 401 || err.status === 403) {
          this.mensajes.push({
            from: 'bot',
            text: 'Para usar el asistente virtual de Helpify debes iniciar sesión primero.'
          });
        } else {
          this.mensajes.push({
            from: 'bot',
            text: 'Hubo un error procesando tu mensaje. Intenta nuevamente.'
          });
        }

        this.cargando = false;
      }
    });
  }
}
