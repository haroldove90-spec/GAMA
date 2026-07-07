import { useState, useEffect } from 'react';
import { ServiceOrder } from './types';
import OrderList from './components/OrderList';
import OrderForm from './components/OrderForm';
import OrderPreview from './components/OrderPreview';
import { downloadOrderPDF, getOrderPDFBlob, formatWhatsAppMessage } from './utils/pdfGenerator';
import { 
  Wrench, Share2, Smartphone, Download, Edit3, ArrowLeft, 
  Check, Copy, Sparkles, HelpCircle 
} from 'lucide-react';

// Default mock seed data for demonstration
const SEED_ORDERS: ServiceOrder[] = [
  {
    id: 'seed-1',
    noOrden: '1001',
    fecha: '02/07/2026',
    cliente: {
      nombreCompleto: 'Alejandra Gómez Ramos',
      telefono: '5532145678',
      correo: 'alejandra.g@gmail.com',
      direccion: 'Av. Canal de Garay #12, Iztapalapa, CDMX'
    },
    equipo: {
      tipo: 'audio',
      marca: 'Sony',
      modelo: 'Genezi MHC-V77',
      noSerie: 'SN-SNY-99812',
      accesorios: 'Cable de alimentación, Control remoto'
    },
    descripcionFalla: 'No enciende. El cliente reporta que se escuchó un tronido interno y comenzó a salir un ligero olor a quemado al intentar conectarlo tras un apagón de luz.',
    diagnosticoTecnico: 'Fusible de entrada de fuente de alimentación fundido, daño térmico en puente rectificador secundario y capacitores electrolíticos inflados. Requiere reconstrucción de sección caliente.',
    servicio: {
      revision: true,
      reparacion: true,
      mantenimiento: true,
      mantenimientoCorrectivo: false,
      descripcion: 'Reemplazo de puente rectificador de diodos, cambio de capacitores de fuente, reemplazo de fusible térmico y limpieza interna profunda.'
    },
    costos: {
      manoObra: 450,
      refacciones: 280,
      total: 730
    },
    observaciones: 'El chasis exterior presenta raspones leves en las esquinas inferiores. El panel de botones táctiles está algo rígido pero funciona perfectamente.',
    garantiaDias: 60,
    firmas: {
      cliente: '', // Seed without signature to allow live test
      tecnico: '',
      nombreCliente: 'Alejandra Gómez Ramos',
      nombreTecnico: 'Ing. Gabriel Ortega',
      fechaCliente: '02/07/2026',
      fechaTecnico: '02/07/2026'
    },
    status: 'pendiente',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'seed-2',
    noOrden: '1002',
    fecha: '03/07/2026',
    cliente: {
      nombreCompleto: 'Ricardo Mendoza Lozano',
      telefono: '5587654321',
      correo: 'richie.m@yahoo.com',
      direccion: 'Calle Sabadell #40, Lomas de San Lorenzo, CDMX'
    },
    equipo: {
      tipo: 'computacion',
      marca: 'HP',
      modelo: 'Pavilion 15-dk001',
      noSerie: 'CND0129FGG',
      accesorios: 'Cargador original de 135W'
    },
    descripcionFalla: 'Se calienta en exceso. Al abrir aplicaciones o juegos pesados, el ventilador zumba con fuerza, la temperatura llega a los 95°C y el equipo se apaga repentinamente.',
    diagnosticoTecnico: 'Pasta térmica original completamente cristalizada y seca. Acumulación densa de pelusa que bloquea el disipador de cobre. Rodamiento del ventilador secundario seco, causando ruido excesivo.',
    servicio: {
      revision: true,
      reparacion: false,
      mantenimiento: true,
      mantenimientoCorrectivo: true,
      descripcion: 'Mantenimiento correctivo térmico completo: Desensamble general, limpieza de disipador, lubricación de rodamiento de ventilador y cambio de pasta térmica por Artic MX-4 de alta conductividad.'
    },
    costos: {
      manoObra: 350,
      refacciones: 150,
      total: 500
    },
    observaciones: 'La batería original presenta un ligero desgaste pero retiene carga por 2 horas. Faltan gomas de soporte antideslizantes en la parte inferior de la carcasa.',
    garantiaDias: 30,
    firmas: {
      cliente: '',
      tecnico: '',
      nombreCliente: 'Ricardo Mendoza Lozano',
      nombreTecnico: 'Aux. Técnico GAMA',
      fechaCliente: '03/07/2026',
      fechaTecnico: '03/07/2026'
    },
    status: 'proceso',
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  }
];

export default function App() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'form' | 'preview'>('list');
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // PWA states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);

  // Listen to beforeinstallprompt and manage installation state
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if running as standalone
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setShowInstallBtn(false);
    } else {
      // By default, let the install button be visible so users can open our custom PWA guide even if event has not fired yet!
      setShowInstallBtn(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install: ${outcome}`);
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          setShowInstallBtn(false);
        }
      } catch (err) {
        console.error('Error in install flow:', err);
      }
    } else {
      // Trigger the custom instructions modal for platforms that do not support beforeinstallprompt (like iOS)
      setShowPwaModal(true);
    }
  };

  // Load orders from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('gama_service_orders');
    if (saved) {
      try {
        setOrders(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing saved orders, loading defaults:', e);
        setOrders(SEED_ORDERS);
        localStorage.setItem('gama_service_orders', JSON.stringify(SEED_ORDERS));
      }
    } else {
      // Seed initial data
      setOrders(SEED_ORDERS);
      localStorage.setItem('gama_service_orders', JSON.stringify(SEED_ORDERS));
    }
  }, []);

  // Sync to local storage on change
  const saveOrdersToStorage = (newOrders: ServiceOrder[]) => {
    setOrders(newOrders);
    localStorage.setItem('gama_service_orders', JSON.stringify(newOrders));
  };

  // Generate next sequential order number
  const getNextOrderNo = (): string => {
    if (orders.length === 0) return '1001';
    
    // Find maximum order number
    const numbers = orders
      .map(o => parseInt(o.noOrden))
      .filter(num => !isNaN(num));
      
    if (numbers.length === 0) return '1001';
    const max = Math.max(...numbers);
    return (max + 1).toString();
  };

  // Add or Edit Order Save Callback
  const handleSaveOrder = (savedOrder: ServiceOrder) => {
    let updatedOrders: ServiceOrder[];
    
    if (isEditing) {
      updatedOrders = orders.map(o => o.id === savedOrder.id ? savedOrder : o);
    } else {
      updatedOrders = [savedOrder, ...orders];
    }
    
    saveOrdersToStorage(updatedOrders);
    
    // Go directly to preview of this newly saved order
    setSelectedOrder(savedOrder);
    setCurrentView('preview');
    setIsEditing(false);
  };

  // Delete order
  const handleDeleteOrder = (id: string) => {
    const updated = orders.filter(o => o.id !== id);
    saveOrdersToStorage(updated);
  };

  // Trigger New Order View
  const handleNewOrder = () => {
    setSelectedOrder(null);
    setIsEditing(false);
    setCurrentView('form');
  };

  // Trigger Edit View
  const handleEditOrder = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setIsEditing(true);
    setCurrentView('form');
  };

  // Export to PDF directly
  const handleDownloadPDF = async (order: ServiceOrder) => {
    setIsGeneratingPDF(true);
    try {
      await downloadOrderPDF(`print-capture-${order.id}`, order.noOrden);
    } catch (e) {
      alert('Error al generar el PDF. Por favor intente de nuevo.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Share message to WhatsApp API
  const handleShareWhatsApp = (order: ServiceOrder) => {
    const message = formatWhatsAppMessage(order);
    const cleanPhone = order.cliente.telefono.replace(/\s+/g, '').replace('+', '');
    // WhatsApp Send API URL
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  // Share to external networks using native mobile sharing
  const handleShareSocial = async (order: ServiceOrder) => {
    const message = formatWhatsAppMessage(order);
    
    // Try to use native file sharing if PDF exists and browser supports sharing files
    try {
      const blob = await getOrderPDFBlob(`print-capture-${order.id}`);
      const file = new File([blob], `Orden_de_Servicio_GAMA_${order.noOrden}.pdf`, { type: 'application/pdf' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Orden GAMA #${order.noOrden}`,
          text: `Hola, le compartimos la Orden de Servicio GAMA #${order.noOrden}.`,
        });
        return;
      }
    } catch (e) {
      console.warn('Native file share failed, falling back to text sharing', e);
    }

    // Text share fallback
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Orden GAMA #${order.noOrden}`,
          text: message,
        });
      } catch (err) {
        console.error('Error sharing text:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(message);
        setCopiedOrderId(order.id);
        alert('Resumen de orden copiado al portapapeles. ¡Ahora puedes pegarlo y compartirlo en cualquier red social!');
        setTimeout(() => setCopiedOrderId(null), 3000);
      } catch (err) {
        alert('No se pudo copiar el texto automáticamente. Puede descargarlo como PDF para compartir.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Brand Navbar */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Un-clipped high fidelity local logo */}
          <img 
            src="/gama.png" 
            alt="Logo GAMA" 
            className="w-14 h-11 object-contain rounded-lg cursor-pointer bg-white p-1 hover:scale-105 transition-transform border border-slate-700 shadow-md"
            onClick={() => setCurrentView('list')}
            referrerPolicy="no-referrer"
          />
          <div>
            <h1 className="text-sm sm:text-base font-extrabold leading-tight tracking-tight uppercase text-blue-400">
              Centro de reparación y mantenimiento
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">
              Gestión de servicios
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {showInstallBtn && (
              <button
                onClick={handleInstallClick}
                className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-900 px-3.5 py-2 rounded-xl text-xs font-black tracking-wide uppercase transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/15 animate-bounce"
                id="btn-install-pwa"
              >
                <Smartphone className="w-3.5 h-3.5" />
                Instalar App
              </button>
            )}
            <button
              onClick={() => setCurrentView('list')}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                currentView === 'list' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              id="nav-btn-list"
            >
              Historial
            </button>
            <button
              onClick={handleNewOrder}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                currentView === 'form' && !isEditing 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 shadow-sm'
              }`}
              id="nav-btn-new"
            >
              Nueva Orden
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-6">
        {currentView === 'list' && (
          <OrderList
            orders={orders}
            onSelectOrder={(order) => {
              setSelectedOrder(order);
              setCurrentView('preview');
            }}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteOrder}
            onNewOrder={handleNewOrder}
            onShareWhatsApp={handleShareWhatsApp}
            onShareSocial={handleShareSocial}
          />
        )}

        {currentView === 'form' && (
          <OrderForm
            onSave={handleSaveOrder}
            onCancel={() => {
              setCurrentView('list');
              setSelectedOrder(null);
              setIsEditing(false);
            }}
            initialOrder={selectedOrder}
            nextOrderNo={getNextOrderNo()}
          />
        )}

        {currentView === 'preview' && selectedOrder && (
          <div className="max-w-4xl mx-auto px-4 pb-20 space-y-4">
            
            {/* Top Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <button
                onClick={() => {
                  setCurrentView('list');
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                id="btn-preview-back"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al Historial
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {/* Edit */}
                <button
                  onClick={() => handleEditOrder(selectedOrder)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  id="btn-preview-edit"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar
                </button>

                {/* WhatsApp */}
                <button
                  onClick={() => handleShareWhatsApp(selectedOrder)}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  id="btn-preview-wa"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  WhatsApp
                </button>

                {/* Share social */}
                <button
                  onClick={() => handleShareSocial(selectedOrder)}
                  className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  id="btn-preview-share"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {copiedOrderId === selectedOrder.id ? '¡Copiado!' : 'Compartir'}
                </button>

                {/* PDF Download */}
                <button
                  disabled={isGeneratingPDF}
                  onClick={() => handleDownloadPDF(selectedOrder)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-55 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                  id="btn-preview-pdf"
                >
                  {isGeneratingPDF ? (
                    <span className="flex items-center gap-1">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Generando...
                    </span>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Descargar PDF
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Helper tips */}
            <div className="bg-slate-100 border border-slate-200/50 p-3.5 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
              <span className="text-base text-blue-600 mt-0.5">💡</span>
              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">Sugerencia para envío móvil:</span>
                <p className="leading-relaxed">
                  Para enviar por WhatsApp, te recomendamos pulsar <strong>"Descargar PDF"</strong> para guardar el archivo en tu dispositivo, y luego pulsar <strong>"WhatsApp"</strong> para abrir la conversación de tu cliente y enviarle el archivo adjunto junto con el resumen de texto autogenerado.
                </p>
              </div>
            </div>

            {/* High fidelity image preview sheet */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-md">
              <OrderPreview 
                order={selectedOrder} 
                idToCapture={`print-capture-${selectedOrder.id}`} 
              />
            </div>
          </div>
        )}
      </main>

      {/* App Footer */}
      <footer className="bg-slate-900 text-slate-400 text-center py-4 text-xs border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>&copy; 2026 GAMA Centro de Reparación y Mantenimiento.</span>
          <span className="text-[11px] text-slate-500">Formato de Órdenes Digitales Optimizado para Dispositivos Móviles</span>
        </div>
      </footer>

      {/* PWA Instruction Modal */}
      {showPwaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden text-slate-800 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <img src="/gamaicono.png" alt="Icono Gama" className="w-8 h-8 rounded-lg bg-white p-0.5 object-contain" />
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wide">Instalar App Gama</h3>
                  <p className="text-[10px] text-slate-300">Lleva el centro de reparación en tu bolsillo</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPwaModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                ✕
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <p className="text-xs text-slate-500 leading-relaxed">
                Nuestra aplicación se puede instalar como una <strong>PWA (Progressive Web App)</strong> para que funcione sin conexión, cargue al instante y tenga acceso directo desde tu pantalla de inicio.
              </p>
              
              <div className="space-y-4">
                {/* Android / Chrome */}
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50 flex gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-lg p-2 h-fit text-sm">🤖</div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-700">En Android / Google Chrome:</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      Pulsa el botón de menú <strong className="text-slate-700">(tres puntos verticalmente)</strong> en la barra superior derecha de Chrome y selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla principal"</strong>.
                    </p>
                  </div>
                </div>
                
                {/* iOS / Safari */}
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50 flex gap-3">
                  <div className="bg-amber-100 text-amber-600 rounded-lg p-2 h-fit text-sm">🍎</div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-700">En iPhone / iPad (Safari):</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      Pulsa el botón de <strong>"Compartir"</strong> <span className="text-slate-700 font-bold">(el cuadro con una flecha apuntando hacia arriba)</span> en el menú inferior y desplázate hacia abajo para seleccionar <strong>"Agregar a inicio"</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowPwaModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
