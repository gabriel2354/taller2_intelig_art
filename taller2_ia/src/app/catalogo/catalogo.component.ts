import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Juego {
  titulo: string;
  precio: number;
  imagen: string;
}

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css']
})
export class CatalogoComponent {
  carrito: Juego[] = [];
  modalVisible = false;

  juegos: Juego[] = [
    { titulo: 'League of Legends', precio: 0, imagen: '/assets/imgs/champ-select5.jpg' },
    { titulo: 'Valorant', precio: 0, imagen: '/assets/imgs/champ-select4.jpg' },
    { titulo: 'Apex Legends', precio: 0, imagen: '/assets/imgs/champ-select2.jpg' },
    { titulo: 'Minecraft', precio: 20, imagen: '/assets/imgs/champ-select5.jpg' },
    { titulo: 'GTA V', precio: 30, imagen: '/assets/imgs/champ-select4.jpg' },
    { titulo: 'FIFA 25', precio: 40, imagen: '/assets/imgs/champ-select5.jpg' }
  ];

  agregarAlCarrito(juego: Juego) {
    this.carrito.push(juego);
    this.modalVisible = true;
  }

  eliminarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
  }

  comprar() {
    alert('¡Gracias por tu compra!');
    this.carrito = [];
    this.modalVisible = false;
  }

  cerrarModal() {
    this.modalVisible = false;
  }

  // ✅ Getter para calcular el total sin usar funciones flecha en el HTML
  get totalCarrito(): number {
    return this.carrito.reduce((acc, item) => acc + item.precio, 0);
  }
}
