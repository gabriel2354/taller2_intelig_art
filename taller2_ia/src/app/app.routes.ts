import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CatalogoComponent } from './catalogo/catalogo.component';
import { ContactoComponent } from './contacto/contacto.component';
import { LoginComponent } from './pages/login/login.component';
import { ComunidadComponent } from './comunidad/comunidad.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Página inicial
  { path: 'catalogo', component: CatalogoComponent }, // Página catálogo
   { path: 'contacto', component: ContactoComponent },
    { path: 'login', component: LoginComponent },
    { path: 'comunidad', component: ComunidadComponent },
  { path: '**', redirectTo: '' }, // Redirección para rutas no encontradas
 
];
