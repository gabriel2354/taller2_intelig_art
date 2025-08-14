import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  title = 'flowbiteBlocks';

  ngOnInit(): void {
    initFlowbite();

    if (!document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.add('dark');
    }

    this.initChatbot();
  }

  initChatbot(): void {
    const chatInput = document.getElementById('chatInput') as HTMLInputElement;
    const sendButton = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');
    const imageUpload = document.getElementById('imageUpload') as HTMLInputElement;
    const recordAudio = document.getElementById('recordAudio');

    // Enviar mensaje con botón
    sendButton?.addEventListener('click', () => {
      this.sendMessage(chatInput, chatMessages);
    });

    // Enviar mensaje con Enter
    chatInput?.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        this.sendMessage(chatInput, chatMessages);
      }
    });

// Subir imágenes múltiples
imageUpload?.addEventListener('change', () => {
  if (imageUpload.files && imageUpload.files.length > 0) {
    Array.from(imageUpload.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        chatMessages!.innerHTML += `
          <div class="flex justify-end">
            <img src="${e.target?.result}" alt="Imagen enviada" 
                 class="max-w-[200px] rounded-lg shadow mb-2" />
          </div>
        `;
        chatMessages!.scrollTop = chatMessages!.scrollHeight;
      };
      reader.readAsDataURL(file);
    });

    // Permitir volver a seleccionar las mismas imágenes
    imageUpload.value = '';
  }
});


    // Grabar audio
    let mediaRecorder: MediaRecorder;
    let audioChunks: BlobPart[] = [];

    recordAudio?.addEventListener('click', async () => {
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
          const audioUrl = URL.createObjectURL(audioBlob);
          this.addUserMedia(chatMessages, { audioUrl });
        };

        mediaRecorder.start();
        recordAudio.textContent = "⏹";
      } else {
        mediaRecorder.stop();
        recordAudio.textContent = "🎤";
      }
    });
  }

  // Agregar texto del usuario
  sendMessage(chatInput: HTMLInputElement, chatMessages: HTMLElement | null): void {
    const message = chatInput.value.trim();
    if (message && chatMessages) {
      chatMessages.innerHTML += `
        <div class="flex justify-end">
          <span class="bg-blue-500 text-white px-3 py-2 rounded-lg mb-2 max-w-[75%] break-words">
            ${message}
          </span>
        </div>
      `;
      chatInput.value = '';

      setTimeout(() => {
        chatMessages.innerHTML += `
          <div class="flex justify-start">
            <span class="bg-gray-200 text-gray-900 px-3 py-2 rounded-lg mb-2">
              Estoy procesando tu mensaje...
            </span>
          </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 500);

      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  // 📌 Función para agregar imagen y/o audio del usuario alineado a la derecha
  addUserMedia(chatMessages: HTMLElement | null, media: { imageUrl?: string, audioUrl?: string }): void {
    if (!chatMessages) return;

    let content = '';

    if (media.audioUrl) {
      content += `
        <audio controls class="rounded-lg shadow max-w-[220px]">
          <source src="${media.audioUrl}" type="audio/mpeg">
        </audio>
      `;
    }

    if (media.imageUrl) {
      content += `
        <img src="${media.imageUrl}" alt="Imagen enviada"
          class="rounded-lg shadow max-w-[200px]" />
      `;
    }

    chatMessages.innerHTML += `
      <div class="flex justify-end items-end gap-2 mb-2">
        ${content}
      </div>
    `;

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}
