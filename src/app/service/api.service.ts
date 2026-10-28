import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap, timeout } from 'rxjs';


export interface Producto {
  id: number;
  albumId: number;
  nombre: string;
  imagen: string;
  stockActual: number;
  stockMinimo: number;
  precio: number;
}

export interface Reabastecimiento {
  id: number;
  productoId: number;
  cantidad: number;
  proveedor: string;
  fecha: string;
  observaciones?: string;
}

interface Imagen {
  id: number;
  albumId: number;
  title: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {


  
  private apiUrl = 'https://jsonplaceholder.typicode.com/photos';
  private productos: Producto[] = [];
  private reabastecimientos: Reabastecimiento[] = [];

  // Inyecta HttpClient para realizar peticiones HTTP.
  constructor(private http: HttpClient) {}

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Imagen[]>(this.apiUrl).pipe(
      map((imagenes) => imagenes.slice(0, 20).map((imagen) => ({
        id: imagen.id,
        albumId: imagen.albumId,
        nombre: imagen.title,
        imagen: imagen.url,
        stockActual: (imagen.id % 12) + 1,
        stockMinimo: 5,
        precio: Number((10 + imagen.id / 10).toFixed(2)),
      }))),
      tap((productos) => {
        this.productos = productos;
      }),
      timeout({ first: 8000 }),
      catchError(() => {
        const productos = this.crearProductosDeRespaldo();
        this.productos = productos;
        return of(productos);
      })
    );
  }

  private crearProductosDeRespaldo(): Producto[] {
    return Array.from({ length: 20 }, (_, indice) => {
      const id = indice + 1;

      return {
        id,
        albumId: Math.ceil(id / 5),
        nombre: `Producto de respaldo ${id}`,
        imagen: `https://picsum.photos/seed/inventario-${id}/200/200`,
        stockActual: (id % 12) + 1,
        stockMinimo: 5,
        precio: Number((10 + id / 10).toFixed(2)),
      };
    });
  }

  obtenerReabastecimientos(): Reabastecimiento[] {
    return this.reabastecimientos;
  }

  registrarReabastecimiento(
    datos: Omit<Reabastecimiento, 'id' | 'fecha'> & { fecha?: string },
  ): Reabastecimiento {
    const producto = this.productos.find(({ id }) => id === datos.productoId);

    if (!producto) {
      throw new Error('El producto debe cargarse antes de registrar un reabastecimiento.');
    }

    if (datos.cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor que cero.');
    }

    producto.stockActual += datos.cantidad;

    const reabastecimiento: Reabastecimiento = {
      ...datos,
      id: Date.now(),
      fecha: datos.fecha ?? new Date().toISOString(),
    };

    this.reabastecimientos = [...this.reabastecimientos, reabastecimiento];
    return reabastecimiento;
  }
}
