import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;

  messages: { type: 'text' | 'image'; content: string; sender: 'user' | 'bot' }[] = [];
  userInput: string = '';
  isBotTyping = false;

  sendMessage(): void {
    if (this.userInput.trim()) {
      this.messages.push({ type: 'text', content: this.userInput.trim(), sender: 'user' });
      const userMessage = this.userInput;
      this.userInput = '';
      this.simulateBotReply(userMessage);
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const imageUrl = reader.result as string;
      this.messages.push({ type: 'image', content: imageUrl, sender: 'user' });
      this.simulateBotReply("Bonita imagen 😄");
    };

    reader.readAsDataURL(file);
  }

  triggerImageUpload(): void {
    this.imageInput.nativeElement.click();
  }

  simulateBotReply(userMessage: string): void {
    this.isBotTyping = true;

    setTimeout(() => {
      this.isBotTyping = false;

      const reply = `Recibido: "${userMessage}"`;
      this.messages.push({ type: 'text', content: reply, sender: 'bot' });
    }, 1200);
  }
}
