export interface ClientData {
  nombreCompleto: string;
  telefono: string;
  correo: string;
  direccion: string;
}

export type EquipmentType = 'audio' | 'video' | 'computacion' | 'linea_blanca';

export interface EquipmentData {
  tipo: EquipmentType;
  marca: string;
  modelo: string;
  noSerie: string;
  accesorios: string;
}

export interface ServiceDetails {
  revision: boolean;
  reparacion: boolean;
  mantenimiento: boolean;
  mantenimientoCorrectivo: boolean;
  descripcion: string;
}

export interface CostsData {
  manoObra: number;
  refacciones: number;
  total: number;
}

export interface SignatureData {
  cliente: string; // Base64 image of signature
  tecnico: string;  // Base64 image of signature
  nombreCliente: string;
  nombreTecnico: string;
  fechaCliente: string;
  fechaTecnico: string;
}

export type OrderStatus = 'pendiente' | 'proceso' | 'completado' | 'entregado';

export interface ServiceOrder {
  id: string; // Unique ID
  noOrden: string; // User visible sequential or custom order number
  fecha: string;
  cliente: ClientData;
  equipo: EquipmentData;
  descripcionFalla: string;
  diagnosticoTecnico: string;
  servicio: ServiceDetails;
  costos: CostsData;
  observaciones: string;
  garantiaDias: number;
  firmas: SignatureData;
  status: OrderStatus;
  createdAt: string;
}
