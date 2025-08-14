import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css']
})
export class ContactoComponent {
  nombre = '';
  email = '';
  mensaje = '';

  enviarFormulario() {
    if (this.nombre && this.email && this.mensaje) {
      alert(`Gracias por contactarnos, ${this.nombre}. Pronto responderemos a tu mensaje.`);
      this.nombre = '';
      this.email = '';
      this.mensaje = '';
    } else {
      alert('Por favor completa todos los campos.');
    }
  }
}
