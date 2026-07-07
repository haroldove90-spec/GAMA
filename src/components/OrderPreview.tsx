import { useState, useEffect, useRef } from 'react';
import { ServiceOrder } from '../types';
import { Phone, Mail, MapPin, ShieldCheck, Check, Laptop, Volume2, Monitor, Home } from 'lucide-react';

interface OrderPreviewProps {
  order: ServiceOrder;
  idToCapture: string;
}

export default function OrderPreview({ order, idToCapture }: OrderPreviewProps) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const parentWidth = containerRef.current.parentElement?.clientWidth || window.innerWidth;
      // Subtract some padding to look nice on mobile
      const targetPadding = window.innerWidth < 640 ? 16 : 48;
      const availableWidth = parentWidth - targetPadding;
      if (availableWidth < 800) {
        setScale(availableWidth / 800);
      } else {
        setScale(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Also trigger on a small timeout to make sure parent elements are fully laid out
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'audio': return <Volume2 className="w-5 h-5 text-slate-700" />;
      case 'video': return <Monitor className="w-5 h-5 text-slate-700" />;
      case 'computacion': return <Laptop className="w-5 h-5 text-slate-700" />;
      case 'linea_blanca': return <Home className="w-5 h-5 text-slate-700" />;
      default: return null;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="bg-slate-100 p-2 sm:p-6 overflow-hidden flex justify-center items-start w-full" 
      id="preview-outer-container"
    >
      <div 
        className="relative overflow-visible flex justify-center items-start"
        style={{
          width: `${800 * scale}px`,
          height: `${1100 * scale}px`,
        }}
      >
        <div
          style={{
            width: '800px',
            height: '1100px',
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            flexShrink: 0,
          }}
        >
          {/* Container forced to Letter Aspect Ratio inside PDF Generator, styled beautifully here */}
          <div
            id={idToCapture}
            className="bg-white w-[800px] min-h-[1100px] p-6 shadow-md relative text-slate-800 font-sans select-none flex flex-col justify-between"
            style={{ boxSizing: 'border-box' }}
          >
        <div>
          {/* HEADER SECTION */}
          <div className="flex justify-between items-start mb-4" id="preview-header">
            {/* Un-clipped Gama Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-24 h-16 flex-shrink-0 flex items-center justify-center bg-white rounded-lg p-1 border border-slate-200/55 shadow-sm">
                <img 
                  src="/gama.png" 
                  alt="GAMA Logo" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              {/* Brand Center */}
              <div>
                <h1 className="text-xl font-extrabold text-[#002D54] leading-none uppercase tracking-wide">
                  Centro de Reparación
                </h1>
                <h2 className="text-lg font-bold text-[#00829A] leading-tight uppercase tracking-normal">
                  y Mantenimiento
                </h2>
                
                {/* Slanted badge matching the image logo */}
                <div className="flex items-center gap-2 mt-1">
                  <div className="bg-[#002D54] text-white px-5 py-1.5 font-black text-xl italic tracking-wider transform -skew-x-12 rounded-sm shadow-sm">
                    GAMA
                  </div>
                  <div className="border-l-2 border-slate-300 h-8 mx-1"></div>
                  <div className="text-left">
                    <span className="block text-[10px] text-slate-500 font-semibold uppercase leading-none">Formato Único</span>
                    <span className="text-xs font-black text-[#002D54] tracking-wider uppercase leading-none">Orden de Servicio</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Badge (Right dark card) */}
            <div className="bg-[#002D54] text-white rounded-2xl p-4 w-[280px] text-[11px] shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#00829A] flex-shrink-0" />
                <span className="font-semibold">Tel: 554045 5815</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#00829A] flex-shrink-0" />
                <span className="truncate">gamaortega757@gmail.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#00829A] mt-0.5 flex-shrink-0" />
                <span className="leading-tight text-slate-200">
                  Calle Barcelona entre Sabadell y Bilbao, San Juan Xalpa, Iztapalapa
                </span>
              </div>
            </div>
          </div>

          {/* ORDER NO & DATE ROW */}
          <div className="flex justify-end gap-6 mb-4 text-xs font-bold text-slate-700 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">No. de Orden:</span>
              <div className="border-b border-slate-400 px-3 py-0.5 text-[#002D54] text-sm font-black min-w-[80px] text-center">
                {order.noOrden}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Fecha:</span>
              <div className="border-b border-slate-400 px-3 py-0.5 text-[#002D54] font-black min-w-[100px] text-center">
                {order.fecha}
              </div>
            </div>
          </div>

          {/* SECTION GRID 1 (CLIENTE) & 2 (EQUIPO) */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            {/* 1. DATOS DEL CLIENTE */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col justify-between">
              <div className="bg-[#00829A] text-white px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide">
                <span className="bg-white/20 p-0.5 rounded-full text-white">👤</span>
                1. Datos del Cliente
              </div>
              <div className="p-3 space-y-2 text-xs flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-4 items-center">
                  <span className="text-slate-500 font-semibold col-span-1">Nombre:</span>
                  <span className="text-slate-800 font-bold col-span-3 border-b border-slate-100 pb-0.5 truncate">
                    {order.cliente.nombreCompleto}
                  </span>
                </div>
                <div className="grid grid-cols-4 items-center">
                  <span className="text-slate-500 font-semibold col-span-1">Teléfono:</span>
                  <span className="text-slate-800 font-bold col-span-3 border-b border-slate-100 pb-0.5">
                    {order.cliente.telefono}
                  </span>
                </div>
                <div className="grid grid-cols-4 items-center">
                  <span className="text-slate-500 font-semibold col-span-1">Correo:</span>
                  <span className="text-slate-800 font-medium col-span-3 border-b border-slate-100 pb-0.5 truncate">
                    {order.cliente.correo || 'N/A'}
                  </span>
                </div>
                <div className="grid grid-cols-4 items-start">
                  <span className="text-slate-500 font-semibold col-span-1 mt-0.5">Dirección:</span>
                  <span className="text-slate-800 leading-tight col-span-3 min-h-[32px] text-[11px]">
                    {order.cliente.direccion || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. DATOS DEL EQUIPO */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col justify-between">
              <div className="bg-[#002D54] text-white px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide">
                <span className="bg-white/20 p-0.5 rounded-full text-white">💻</span>
                2. Datos del Equipo
              </div>
              <div className="p-3 space-y-2 text-xs flex-1 flex flex-col justify-between">
                {/* Equipment Type Display */}
                <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-md border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Tipo:</span>
                  <div className="flex gap-2 text-[10px]">
                    {['audio', 'video', 'computacion', 'linea_blanca'].map((t) => {
                      const isSelected = order.equipo.tipo === t;
                      const label = t === 'computacion' ? 'Computación' : t === 'linea_blanca' ? 'Línea blanca' : t.charAt(0).toUpperCase() + t.slice(1);
                      return (
                        <div
                          key={t}
                          className={`flex items-center gap-0.5 px-1 py-0.5 rounded ${
                            isSelected ? 'bg-[#002D54] text-white font-bold' : 'text-slate-400 bg-slate-100'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          <span>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Brand and Model */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold leading-none mb-0.5">Marca</span>
                    <span className="font-bold border-b border-slate-100 pb-0.5">{order.equipo.marca}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold leading-none mb-0.5">Modelo</span>
                    <span className="font-bold border-b border-slate-100 pb-0.5">{order.equipo.modelo}</span>
                  </div>
                </div>

                {/* Serial No */}
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-semibold leading-none mb-0.5">No. de serie</span>
                  <span className="font-bold border-b border-slate-100 pb-0.5">{order.equipo.noSerie || 'S/N'}</span>
                </div>

                {/* Accessories */}
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-semibold leading-none mb-0.5">Accesorios entregados</span>
                  <span className="text-slate-600 truncate text-[11px] min-h-[14px]">
                    {order.equipo.accesorios || 'Ninguno'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. DESCRIPCIÓN DE LA FALLA */}
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm mb-3">
            <div className="bg-[#00829A] text-white px-3 py-1 text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide">
              <span className="bg-white/20 p-0.5 rounded-full text-white">⚠️</span>
              3. Descripción de la Falla <span className="text-[10px] font-normal lowercase italic">(reportado por el cliente)</span>
            </div>
            <div className="p-3 text-xs min-h-[60px] leading-relaxed text-slate-700 bg-slate-50/50 whitespace-pre-wrap">
              {order.descripcionFalla}
            </div>
          </div>

          {/* GRID SECTION 4 (DIAGNÓSTICO) & 5 (SERVICIO) */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            {/* 4. DIAGNÓSTICO TÉCNICO */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
              <div className="bg-[#002D54] text-white px-3 py-1 text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide">
                <span className="bg-white/20 p-0.5 rounded-full text-white">🔍</span>
                4. Diagnóstico Técnico
              </div>
              <div className="p-3 text-xs flex-1 min-h-[80px] leading-relaxed text-slate-700 whitespace-pre-wrap bg-slate-50/50">
                {order.diagnosticoTecnico || 'Pendiente de revisión técnica.'}
              </div>
            </div>

            {/* 5. SERVICIO A REALIZAR */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col justify-between">
              <div className="bg-[#00829A] text-white px-3 py-1 text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide">
                <span className="bg-white/20 p-0.5 rounded-full text-white">🔧</span>
                5. Servicio a Realizar
              </div>
              <div className="p-3 text-xs flex-1 flex flex-col justify-between gap-2">
                {/* Checkboxes layout */}
                <div className="grid grid-cols-2 gap-y-1 bg-slate-50 p-2 rounded-md border border-slate-100">
                  {[
                    { label: 'Revisión', val: order.servicio.revision },
                    { label: 'Reparación', val: order.servicio.reparacion },
                    { label: 'Mantenimiento', val: order.servicio.mantenimiento },
                    { label: 'Mant. Correctivo', val: order.servicio.mantenimientoCorrectivo }
                  ].map((srv, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center ${
                        srv.val ? 'bg-[#00829A] border-[#00829A] text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {srv.val && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700">{srv.label}</span>
                    </div>
                  ))}
                </div>

                {/* Service description */}
                <div className="flex-1 flex flex-col">
                  <span className="text-[10px] text-slate-400 font-semibold mb-1">Descripción del servicio</span>
                  <span className="text-slate-600 text-[11px] leading-snug flex-1 whitespace-pre-wrap">
                    {order.servicio.descripcion || 'Por especificar según diagnóstico.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* GRID SECTION 6 (COSTOS) & 7 (OBSERVACIONES) */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            {/* 6. COSTOS ESTIMADOS */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col justify-between">
              <div className="bg-[#00829A] text-white px-3 py-1 text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide">
                <span className="bg-white/20 p-0.5 rounded-full text-white">💵</span>
                6. Costos Estimados
              </div>
              <div className="p-3 text-xs flex-1 flex flex-col justify-between space-y-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                    <span className="text-slate-500 font-semibold">Mano de Obra:</span>
                    <span className="font-bold text-slate-800">${order.costos.manoObra.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                    <span className="text-slate-500 font-semibold">Refacciones:</span>
                    <span className="font-bold text-slate-800">${order.costos.refacciones.toFixed(2)}</span>
                  </div>
                </div>

                {/* Grand Total Row */}
                <div className="bg-[#002D54]/5 p-2 rounded border border-[#002D54]/10 flex justify-between items-center">
                  <span className="text-[#002D54] font-black text-xs uppercase tracking-wider">TOTAL ESTIMADO:</span>
                  <span className="text-lg font-black text-[#002D54]">${order.costos.total.toFixed(2)}</span>
                </div>

                <p className="text-[9px] text-slate-400 italic leading-none pt-1">
                  * El costo final puede variar de acuerdo con el diagnóstico y piezas necesarias.
                </p>
              </div>
            </div>

            {/* 7. OBSERVACIONES */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
              <div className="bg-[#002D54] text-white px-3 py-1 text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide">
                <span className="bg-white/20 p-0.5 rounded-full text-white">💬</span>
                7. Observaciones
              </div>
              <div className="p-3 text-xs flex-1 min-h-[85px] leading-relaxed text-slate-600 whitespace-pre-wrap bg-slate-50/50">
                {order.observaciones || 'Sin observaciones adicionales.'}
              </div>
            </div>
          </div>

          {/* 8. CONDICIONES DEL SERVICIO */}
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm mb-4">
            <div className="bg-[#00829A] text-white px-3 py-1 text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide">
              <span className="bg-white/20 p-0.5 rounded-full text-white">📜</span>
              8. Condiciones del Servicio
            </div>
            <div className="p-3 grid grid-cols-1 gap-1 text-[10px] text-slate-600 leading-snug">
              <div className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00829A] mt-0.5 flex-shrink-0" />
                <span>El equipo será reparado previa autorización del cliente.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00829A] mt-0.5 flex-shrink-0" />
                <span>El diagnóstico puede generar costo si no se acepta la reparación.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00829A] mt-0.5 flex-shrink-0" />
                <span>El tiempo de entrega es estimado.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00829A] mt-0.5 flex-shrink-0" />
                <span>
                  Garantía de <strong className="text-[#002D54] font-black underline px-1">{order.garantiaDias} días</strong> sobre la reparación realizada.
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00829A] mt-0.5 flex-shrink-0" />
                <span>No nos hacemos responsables por daños no reportados previamente.</span>
              </div>
            </div>
          </div>

          {/* SIGNATURES SECTION */}
          <div className="grid grid-cols-2 gap-6 mt-4">
            {/* Firma del Cliente */}
            <div className="flex flex-col items-center">
              <div className="w-full border-b-2 border-slate-300 h-20 flex items-center justify-center relative overflow-hidden bg-slate-50/50 rounded-t-md">
                {order.firmas.cliente ? (
                  <img src={order.firmas.cliente} alt="Firma Cliente" className="max-h-full object-contain pointer-events-none" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-slate-300 text-[10px] italic">Sin firma registrada</span>
                )}
              </div>
              <div className="text-center mt-1 w-full space-y-0.5">
                <span className="block text-[11px] font-black text-[#002D54] uppercase tracking-wider">Firma del Cliente</span>
                <div className="text-[10px] text-slate-500 flex justify-between px-1">
                  <span className="truncate max-w-[140px]">Nombre: <strong className="text-slate-800">{order.firmas.nombreCliente}</strong></span>
                  <span>Fecha: <strong className="text-slate-800">{order.firmas.fechaCliente || order.fecha}</strong></span>
                </div>
              </div>
            </div>

            {/* Firma del Técnico */}
            <div className="flex flex-col items-center">
              <div className="w-full border-b-2 border-slate-300 h-20 flex items-center justify-center relative overflow-hidden bg-slate-50/50 rounded-t-md">
                {order.firmas.tecnico ? (
                  <img src={order.firmas.tecnico} alt="Firma Técnico" className="max-h-full object-contain pointer-events-none" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-slate-300 text-[10px] italic">Sin firma registrada</span>
                )}
              </div>
              <div className="text-center mt-1 w-full space-y-0.5">
                <span className="block text-[11px] font-black text-[#002D54] uppercase tracking-wider">Firma del Técnico</span>
                <div className="text-[10px] text-slate-500 flex justify-between px-1">
                  <span className="truncate max-w-[140px]">Nombre: <strong className="text-slate-800">{order.firmas.nombreTecnico}</strong></span>
                  <span>Fecha: <strong className="text-slate-800">{order.firmas.fechaTecnico || order.fecha}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRINT FOOTER BAR */}
        <div className="bg-[#002D54] text-white p-2.5 rounded-xl mt-6 flex justify-between items-center text-[10px] tracking-wide" id="preview-footer">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-[#00829A] text-sm">🛡️</span>
            <span>GRACIAS POR SU CONFIANZA</span>
          </div>
          <div className="font-extrabold uppercase text-[9px] text-slate-300">
            CUIDAMOS TU TECNOLOGÍA, GARANTIZAMOS TU SATISFACCIÓN
          </div>
          {/* Right inline icons */}
          <div className="flex gap-1.5 opacity-80">
            <span>🔊</span>
            <span>📺</span>
            <span>💻</span>
            <span>🧺</span>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
