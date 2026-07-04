import React, { useState, useEffect } from 'react';
import { ServiceOrder, ClientData, EquipmentData, EquipmentType, ServiceDetails, CostsData, SignatureData, OrderStatus } from '../types';
import SignaturePad from './SignaturePad';
import { 
  User, Laptop, AlertTriangle, Search, Wrench, DollarSign, FileText, 
  Settings, Check, X, ShieldAlert, Calendar, Hash, Plus, ArrowLeft, Save, Sparkles 
} from 'lucide-react';

interface OrderFormProps {
  onSave: (order: ServiceOrder) => void;
  onCancel: () => void;
  initialOrder: ServiceOrder | null;
  nextOrderNo: string;
}

export default function OrderForm({ onSave, onCancel, initialOrder, nextOrderNo }: OrderFormProps) {
  // Client Data State
  const [cliente, setCliente] = useState<ClientData>({
    nombreCompleto: '',
    telefono: '',
    correo: '',
    direccion: '',
  });

  // Equipment Data State
  const [equipo, setEquipo] = useState<EquipmentData>({
    tipo: 'computacion',
    marca: '',
    modelo: '',
    noSerie: '',
    accesorios: '',
  });

  // Service Details State
  const [servicio, setServicio] = useState<ServiceDetails>({
    revision: true,
    reparacion: false,
    mantenimiento: false,
    mantenimientoCorrectivo: false,
    descripcion: '',
  });

  // Costs State
  const [costos, setCostos] = useState<CostsData>({
    manoObra: 0,
    refacciones: 0,
    total: 0,
  });

  // Other fields
  const [noOrden, setNoOrden] = useState(nextOrderNo);
  const [fecha, setFecha] = useState('');
  const [descripcionFalla, setDescripcionFalla] = useState('');
  const [diagnosticoTecnico, setDiagnosticoTecnico] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [garantiaDias, setGarantiaDias] = useState(30);
  const [status, setStatus] = useState<OrderStatus>('pendiente');

  // Signatures State
  const [firmas, setFirmas] = useState<SignatureData>({
    cliente: '',
    tecnico: '',
    nombreCliente: '',
    nombreTecnico: 'Técnico Gama',
    fechaCliente: '',
    fechaTecnico: '',
  });

  // Set today's date as default
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    setFecha(formattedDate);
    
    if (!initialOrder) {
      setFirmas(prev => ({
        ...prev,
        fechaCliente: formattedDate,
        fechaTecnico: formattedDate
      }));
    }
  }, []);

  // Hydrate form if editing
  useEffect(() => {
    if (initialOrder) {
      setCliente(initialOrder.cliente);
      setEquipo(initialOrder.equipo);
      setServicio(initialOrder.servicio);
      setCostos(initialOrder.costos);
      setNoOrden(initialOrder.noOrden);
      setFecha(initialOrder.fecha);
      setDescripcionFalla(initialOrder.descripcionFalla);
      setDiagnosticoTecnico(initialOrder.diagnosticoTecnico);
      setObservaciones(initialOrder.observaciones);
      setGarantiaDias(initialOrder.garantiaDias);
      setStatus(initialOrder.status);
      setFirmas(initialOrder.firmas);
    }
  }, [initialOrder]);

  // Handle client name change to auto-fill signature name
  useEffect(() => {
    if (!initialOrder) {
      setFirmas(prev => ({
        ...prev,
        nombreCliente: cliente.nombreCompleto
      }));
    }
  }, [cliente.nombreCompleto]);

  // Recalculate total whenever prices change
  useEffect(() => {
    const total = Number(costos.manoObra || 0) + Number(costos.refacciones || 0);
    setCostos(prev => ({ ...prev, total }));
  }, [costos.manoObra, costos.refacciones]);

  // Trigger save
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cliente.nombreCompleto) {
      alert('Por favor ingrese el nombre del cliente');
      return;
    }
    if (!cliente.telefono) {
      alert('Por favor ingrese el teléfono del cliente');
      return;
    }
    if (!equipo.marca || !equipo.modelo) {
      alert('Por favor ingrese marca y modelo del equipo');
      return;
    }

    const orderData: ServiceOrder = {
      id: initialOrder?.id || crypto.randomUUID(),
      noOrden,
      fecha,
      cliente,
      equipo,
      descripcionFalla,
      diagnosticoTecnico,
      servicio,
      costos,
      observaciones,
      garantiaDias,
      firmas,
      status,
      createdAt: initialOrder?.createdAt || new Date().toISOString(),
    };

    onSave(orderData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 pb-16 space-y-6" id="service-order-form">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            id="btn-back-form"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-950">
              {initialOrder ? 'Editar Orden de Servicio' : 'Nueva Orden de Servicio'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">Complete los datos basándose en el formato oficial</p>
          </div>
        </div>

        {/* Info badges */}
        <div className="flex gap-2 text-xs">
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-slate-700 font-bold shadow-xs">
            <Hash className="w-3.5 h-3.5 text-blue-600" />
            <span>Orden: {noOrden}</span>
          </div>
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-slate-700 font-bold shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Fecha: {fecha}</span>
          </div>
        </div>
      </div>

      {/* STATUS PICKER */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">⚙️</span>
          <span className="font-bold text-sm text-slate-900">Estado Actual de la Orden:</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {([
            { id: 'pendiente', label: 'Pendiente ⏳', color: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200' },
            { id: 'proceso', label: 'En Proceso 🛠️', color: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200' },
            { id: 'completado', label: 'Completado ✅', color: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' },
            { id: 'entregado', label: 'Entregado 📦', color: 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200' }
          ] as const).map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatus(st.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                status === st.id ? `${st.color} scale-105 shadow-sm ring-2 ring-offset-1 ring-blue-500` : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
              }`}
              id={`status-btn-${st.id}`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. DATOS DEL CLIENTE */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="bg-slate-800 text-white px-4 py-3 font-semibold flex items-center gap-2 text-sm uppercase tracking-wide">
            <User className="w-4 h-4 text-blue-400" />
            1. Datos del Cliente
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre completo *</label>
              <input
                type="text"
                required
                placeholder="Ej. Juan Pérez Ortega"
                value={cliente.nombreCompleto}
                onChange={(e) => setCliente({ ...cliente, nombreCompleto: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                id="input-cliente-nombre"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono (WhatsApp) *</label>
              <input
                type="tel"
                required
                placeholder="Ej. 5512345678"
                value={cliente.telefono}
                onChange={(e) => setCliente({ ...cliente, telefono: e.target.value.replace(/\D/g, '') })}
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                id="input-cliente-telefono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo electrónico</label>
              <input
                type="email"
                placeholder="Ej. cliente@gmail.com"
                value={cliente.correo}
                onChange={(e) => setCliente({ ...cliente, correo: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                id="input-cliente-correo"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dirección</label>
              <textarea
                placeholder="Dirección del cliente..."
                rows={2}
                value={cliente.direccion}
                onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 resize-none"
                id="input-cliente-direccion"
              />
            </div>
          </div>
        </div>

        {/* 2. DATOS DEL EQUIPO */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="bg-slate-900 text-white px-4 py-3 font-semibold flex items-center gap-2 text-sm uppercase tracking-wide">
            <Laptop className="w-4 h-4 text-blue-400" />
            2. Datos del Equipo
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tipo de equipo</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {([
                  { id: 'audio', label: 'Audio 🔊' },
                  { id: 'video', label: 'Video 📺' },
                  { id: 'computacion', label: 'Computo 💻' },
                  { id: 'linea_blanca', label: 'L. Blanca 🧺' }
                ] as const).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setEquipo({ ...equipo, tipo: t.id })}
                    className={`px-2 py-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                      equipo.tipo === t.id
                        ? 'bg-blue-600 text-white border-blue-600 scale-102 shadow-sm shadow-blue-500/10'
                        : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                    }`}
                    id={`equip-type-${t.id}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Marca *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sony, HP"
                  value={equipo.marca}
                  onChange={(e) => setEquipo({ ...equipo, marca: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 bg-slate-50/50"
                  id="input-equipo-marca"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Modelo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Smart 4K, Pavilion"
                  value={equipo.modelo}
                  onChange={(e) => setEquipo({ ...equipo, modelo: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 bg-slate-50/50"
                  id="input-equipo-modelo"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Número de Serie</label>
              <input
                type="text"
                placeholder="Ej. SN12345678"
                value={equipo.noSerie}
                onChange={(e) => setEquipo({ ...equipo, noSerie: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 bg-slate-50/50"
                id="input-equipo-noserie"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Accesorios entregados</label>
              <input
                type="text"
                placeholder="Ej. Cargador, control remoto, cables"
                value={equipo.accesorios}
                onChange={(e) => setEquipo({ ...equipo, accesorios: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 bg-slate-50/50"
                id="input-equipo-accesorios"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. DESCRIPCIÓN DE LA FALLA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-800 text-white px-4 py-3 font-semibold flex items-center gap-2 text-sm uppercase tracking-wide">
          <AlertTriangle className="w-4 h-4 text-blue-400" />
          3. Descripción de la Falla <span className="text-xs font-normal lowercase italic text-slate-300">(según lo reportado por el cliente)</span>
        </div>
        <div className="p-4">
          <textarea
            required
            rows={3}
            placeholder="Describa a detalle la falla que reporta el cliente al ingresar el equipo..."
            value={descripcionFalla}
            onChange={(e) => setDescripcionFalla(e.target.value)}
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            id="input-falla-desc"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 4. DIAGNÓSTICO TÉCNICO */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="bg-slate-900 text-white px-4 py-3 font-semibold flex items-center gap-2 text-sm uppercase tracking-wide">
            <Search className="w-4 h-4 text-blue-400" />
            4. Diagnóstico Técnico
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between">
            <textarea
              rows={4}
              placeholder="Escriba los resultados de la revisión física/interna, componentes dañados y hallazgos técnicos..."
              value={diagnosticoTecnico}
              onChange={(e) => setDiagnosticoTecnico(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 bg-slate-50/50 flex-1 min-h-[100px]"
              id="input-diagnostico"
            />
          </div>
        </div>

        {/* 5. SERVICIO A REALIZAR */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="bg-slate-800 text-white px-4 py-3 font-semibold flex items-center gap-2 text-sm uppercase tracking-wide">
            <Wrench className="w-4 h-4 text-blue-400" />
            5. Servicio a Realizar
          </div>
          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
            {/* Service checklist */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
              {[
                { key: 'revision', label: 'Revisión' },
                { key: 'reparacion', label: 'Reparación' },
                { key: 'mantenimiento', label: 'Mantenimiento' },
                { key: 'mantenimientoCorrectivo', label: 'Mantenimiento Correctivo' },
              ].map((srv) => (
                <label key={srv.key} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={(servicio as any)[srv.key]}
                    onChange={(e) => setServicio({ ...servicio, [srv.key]: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    id={`chk-srv-${srv.key}`}
                  />
                  <span className="text-xs font-bold text-slate-700">{srv.label}</span>
                </label>
              ))}
            </div>

            {/* Service details description */}
            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción del servicio específico</label>
              <textarea
                rows={2}
                placeholder="Ej. Cambio de tarjeta lógica, limpieza general..."
                value={servicio.descripcion}
                onChange={(e) => setServicio({ ...servicio, descripcion: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 flex-1 resize-none"
                id="input-servicio-desc"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 6. COSTOS ESTIMADOS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="bg-slate-800 text-white px-4 py-3 font-semibold flex items-center gap-2 text-sm uppercase tracking-wide">
            <DollarSign className="w-4 h-4 text-blue-400" />
            6. Costos Estimados
          </div>
          <div className="p-4 space-y-4 flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mano de Obra ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={costos.manoObra || ''}
                    onChange={(e) => setCostos({ ...costos, manoObra: parseFloat(e.target.value) || 0 })}
                    className="w-full text-sm pl-7 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                    id="input-costo-mano"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Refacciones ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={costos.refacciones || ''}
                    onChange={(e) => setCostos({ ...costos, refacciones: parseFloat(e.target.value) || 0 })}
                    className="w-full text-sm pl-7 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                    id="input-costo-refacciones"
                  />
                </div>
              </div>
            </div>

            {/* Total Indicator */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
              <span className="text-slate-900 font-extrabold text-sm uppercase tracking-wide">Total Estimado:</span>
              <span className="text-xl font-black text-slate-950">${costos.total.toFixed(2)}</span>
            </div>
            
            <p className="text-[10px] text-slate-400 italic">
              * Nota: El costo se calculará sumando la mano de obra y refacciones cargadas.
            </p>
          </div>
        </div>

        {/* 7. OBSERVACIONES */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="bg-slate-900 text-white px-4 py-3 font-semibold flex items-center gap-2 text-sm uppercase tracking-wide">
            <FileText className="w-4 h-4 text-blue-400" />
            7. Observaciones
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between">
            <textarea
              rows={4}
              placeholder="Detalles sobre raspones, golpes visibles, observaciones adicionales del estado físico..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 bg-slate-50/50 flex-1 min-h-[100px]"
              id="input-observaciones"
            />
          </div>
        </div>
      </div>

      {/* 8. CONDICIONES DEL SERVICIO */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-800 text-white px-4 py-3 font-semibold flex items-center gap-2 text-sm uppercase tracking-wide">
          <Settings className="w-4 h-4 text-blue-400" />
          8. Condiciones del Servicio y Garantía
        </div>
        <div className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="text-xs text-slate-600 font-medium">
              Ajustar los días de garantía aplicables para este servicio:
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={garantiaDias}
                onChange={(e) => setGarantiaDias(parseInt(e.target.value) || 0)}
                className="w-20 text-center text-sm font-bold px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                id="input-garantia"
              />
              <span className="text-xs font-bold text-slate-700">Días de garantía</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-500">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <span>El equipo será reparado previa autorización del cliente.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <span>El diagnóstico puede generar costo si no se acepta la reparación.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <span>El tiempo de entrega es estimado.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <span>No nos hacemos responsables por daños no reportados previamente al ingreso del equipo.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 9. FIRMAS DIGITALES */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 text-white px-4 py-3 font-semibold flex items-center gap-2 text-sm uppercase tracking-wide">
          <Sparkles className="w-4 h-4 text-blue-400" />
          9. Firmas Digitales (Captura interactiva)
        </div>
        <div className="p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Signature Pad 1: Cliente */}
            <div className="space-y-3">
              <SignaturePad
                id="cliente"
                title="Firma del Cliente"
                defaultValue={firmas.cliente}
                onChange={(dataUrl) => setFirmas(prev => ({ ...prev, cliente: dataUrl }))}
              />
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Nombre de quien firma</label>
                  <input
                    type="text"
                    placeholder="Nombre del Cliente"
                    value={firmas.nombreCliente}
                    onChange={(e) => setFirmas(prev => ({ ...prev, nombreCliente: e.target.value }))}
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-md bg-slate-50/50"
                    id="input-firma-cliente-nombre"
                  />
                </div>
              </div>
            </div>

            {/* Signature Pad 2: Técnico */}
            <div className="space-y-3">
              <SignaturePad
                id="tecnico"
                title="Firma del Técnico"
                defaultValue={firmas.tecnico}
                onChange={(dataUrl) => setFirmas(prev => ({ ...prev, tecnico: dataUrl }))}
              />
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Nombre del técnico responsable</label>
                  <input
                    type="text"
                    placeholder="Nombre del Técnico"
                    value={firmas.nombreTecnico}
                    onChange={(e) => setFirmas(prev => ({ ...prev, nombreTecnico: e.target.value }))}
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-md bg-slate-50/50"
                    id="input-firma-tecnico-nombre"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FORM ACTIONS */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition-all cursor-pointer flex items-center gap-1.5"
          id="btn-cancelar"
        >
          <X className="w-4 h-4" />
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-sm transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-1.5"
          id="btn-guardar"
        >
          <Save className="w-4 h-4" />
          {initialOrder ? 'Guardar Cambios' : 'Registrar Orden'}
        </button>
      </div>
    </form>
  );
}
