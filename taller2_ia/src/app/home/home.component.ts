import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { initFlowbite } from 'flowbite';

interface ChatMessage {
  sender: 'user' | 'bot';
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  loading?: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  title = 'flowbiteBlocks';
  private apiUrl = 'http://localhost:3000';

  messages: ChatMessage[] = [];
  userMessage: string = '';
  recording = false;
  private mediaRecorder?: MediaRecorder;
  private audioChunks: BlobPart[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    initFlowbite();
    document.documentElement.classList.add('dark');
  }

  // 📌 Enviar mensaje
  sendMessage(): void {
    const message = this.userMessage.trim();
    if (!message) return;

    this.messages.push({ sender: 'user', text: message });
    this.messages.push({ sender: 'bot', text: 'Estoy procesando...', loading: true });

    if (message.startsWith('/imagen')) {
      const prompt = message.replace('/imagen', '').trim();
      this.http.post<{ url?: string; error?: string }>(`${this.apiUrl}/generar-imagen`, { prompt })
        .subscribe({
          next: (res) => {
            this.removeLoading();
            if (res.error) {
              this.messages.push({ sender: 'bot', text: `⚠️ ${res.error}` });
            } else if (res.url) {
              this.messages.push({ sender: 'bot', imageUrl: res.url });
            } else {
              this.messages.push({ sender: 'bot', text: '⚠️ No se pudo generar la imagen.' });
            }
          },
          error: () => {
            this.removeLoading();
            this.messages.push({ sender: 'bot', text: '❌ Error al generar imagen.' });
          }
        });
    } else {
      this.http.post<{ reply?: string; error?: string }>(`${this.apiUrl}/chat`, { message })
        .subscribe({
          next: (res) => {
            this.removeLoading();
            this.messages.push({ sender: 'bot', text: res.error || res.reply || 'Sin respuesta.' });
          },
          error: () => {
            this.removeLoading();
            this.messages.push({ sender: 'bot', text: '❌ Error al conectar con el servidor.' });
          }
        });
    }

    this.userMessage = '';
  }

  // 📌 Subir imagen
  sendImage(file: File): void {
    this.messages.push({ sender: 'user', imageUrl: URL.createObjectURL(file) });
    this.messages.push({ sender: 'bot', text: 'Estoy procesando...', loading: true });

    const formData = new FormData();
    formData.append('image', file);

    this.http.post<{ descripcion?: string; error?: string }>(`${this.apiUrl}/analizar-imagen`, formData)
      .subscribe({
        next: (res) => {
          this.removeLoading();
          this.messages.push({ sender: 'bot', text: res.error || res.descripcion || '⚠️ No se pudo analizar la imagen.' });
        },
        error: () => {
          this.removeLoading();
          this.messages.push({ sender: 'bot', text: '❌ Error al analizar imagen.' });
        }
      });
  }

  // 📌 Manejar input file (corregido)
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.sendImage(input.files[0]);
    }
  }

  // 📌 Subir audio
  toggleRecording(): void {
    if (!this.recording) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];

        this.mediaRecorder.ondataavailable = event => this.audioChunks.push(event.data);

        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/mpeg' });
          this.messages.push({ sender: 'user', audioUrl: URL.createObjectURL(audioBlob) });
          this.messages.push({ sender: 'bot', text: 'Estoy procesando...', loading: true });

          const formData = new FormData();
          formData.append('audio', audioBlob, 'grabacion.mp3');

          this.http.post<{ texto?: string; error?: string }>(`${this.apiUrl}/voz-a-texto`, formData)
            .subscribe({
              next: (res) => {
                this.removeLoading();
                this.messages.push({ sender: 'bot', text: res.error || `🗣 ${res.texto}` || '⚠️ No se pudo transcribir el audio.' });
              },
              error: () => {
                this.removeLoading();
                this.messages.push({ sender: 'bot', text: '❌ Error al procesar audio.' });
              }
            });
        };

        this.mediaRecorder.start();
        this.recording = true;
      }).catch(err => console.error("❌ Error al acceder al micrófono:", err));
    } else {
      this.mediaRecorder?.stop();
      this.recording = false;
    }
  }

  // 📌 Quitar loading
  private removeLoading(): void {
    const idx = this.messages.findIndex(m => m.loading);
    if (idx !== -1) this.messages.splice(idx, 1);
  }
}
