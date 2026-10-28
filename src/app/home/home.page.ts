import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonAvatar,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSearchbar,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeOutline, refreshOutline } from 'ionicons/icons';
import { ApiService, Producto } from '../service/api.service';

addIcons({ closeOutline, refreshOutline });

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonAvatar,
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonSearchbar,
    IonTitle,
    IonToast,
    IonToolbar,
  ],
})
export class HomePage implements OnInit {
  productos: Producto[] = [];
  cargando = false;
  mensajeError = '';
  textoBusqueda = '';
  modalAbierto = false;
  productoSeleccionado: Producto | null = null;
  cantidadReabastecimiento = 1;
  proveedor = '';
  observaciones = '';
  mensajeFormulario = '';
  toastAbierto = false;
  mensajeToast = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.actualizarProductos();
  }

  get productosFiltrados(): Producto[] {
    const busqueda = this.textoBusqueda.trim().toLowerCase();

    return this.productos.filter((producto) => {
      const coincideBusqueda = !busqueda
        || producto.nombre.toLowerCase().includes(busqueda)
        || producto.albumId.toString().includes(busqueda);

      return coincideBusqueda;
    });
  }

  get cantidadProductos(): number {
    return this.productos.length;
  }

  get productosCriticos(): number {
    return this.productos.filter(({ stockActual, stockMinimo }) => stockActual <= stockMinimo).length;
  }

  actualizarProductos(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.apiService.obtenerProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.cargando = false;
      },
      error: () => {
        this.mensajeError = 'No fue posible cargar los productos.';
        this.cargando = false;
      },
    });
  }

  abrirModal(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.cantidadReabastecimiento = 1;
    this.proveedor = '';
    this.observaciones = '';
    this.mensajeFormulario = '';
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.productoSeleccionado = null;
  }

  registrarReabastecimiento(): void {
    if (!this.productoSeleccionado || this.cantidadReabastecimiento <= 0) {
      this.mensajeFormulario = 'Ingresa una cantidad mayor que cero.';
      return;
    }

    try {
      this.apiService.registrarReabastecimiento({
        productoId: this.productoSeleccionado.id,
        cantidad: Number(this.cantidadReabastecimiento),
        proveedor: this.proveedor.trim() || 'Sin proveedor',
        observaciones: this.observaciones.trim() || undefined,
      });
      this.cerrarModal();
      this.mensajeToast = 'Reabastecimiento registrado correctamente.';
      this.toastAbierto = true;
    } catch (error) {
      this.mensajeFormulario = error instanceof Error ? error.message : 'No fue posible registrar el reabastecimiento.';
    }
  }
}
