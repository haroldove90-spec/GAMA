import { useState } from 'react';
import { ServiceOrder, OrderStatus, EquipmentType } from '../types';
import { 
  Search, Filter, Plus, Calendar, Smartphone, FileText, Trash2, Edit3, 
  Share2, ArrowUpRight, CheckCircle2, AlertCircle, RefreshCw, Layers, Sparkles 
} from 'lucide-react';

interface OrderListProps {
  orders: ServiceOrder[];
  onSelectOrder: (order: ServiceOrder) => void;
  onEditOrder: (order: ServiceOrder) => void;
  onDeleteOrder: (id: string) => void;
  onNewOrder: () => void;
  onShareWhatsApp: (order: ServiceOrder) => void;
  onShareSocial: (order: ServiceOrder) => void;
}

export default function OrderList({
  orders,
  onSelectOrder,
  onEditOrder,
  onDeleteOrder,
  onNewOrder,
  onShareWhatsApp,
  onShareSocial
}: OrderListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentType | 'all'>('all');

  // Stats calculation
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pendiente' || o.status === 'proceso').length;
  const completedOrders = orders.filter(o => o.status === 'completado' || o.status === 'entregado').length;
  const totalRevenue = orders
    .filter(o => o.status === 'completado' || o.status === 'entregado')
    .reduce((sum, o) => sum + o.costos.total, 0);

  // Filtering logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.cliente.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.noOrden.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cliente.telefono.includes(searchTerm) ||
      order.equipo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.equipo.modelo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesEquipment = equipmentFilter === 'all' || order.equipo.tipo === equipmentFilter;

    return matchesSearch && matchesStatus && matchesEquipment;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Pendiente
          </span>
        );
      case 'proceso':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            En Proceso
          </span>
        );
      case 'completado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completado
          </span>
        );
      case 'entregado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200">
            <Layers className="w-3.5 h-3.5" />
            Entregado
          </span>
        );
    }
  };

  const getEquipmentEmoji = (type: EquipmentType) => {
    switch (type) {
      case 'audio': return '🔊';
      case 'video': return '📺';
      case 'computacion': return '💻';
      case 'linea_blanca': return '🧺';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-6 pb-20" id="order-list-dashboard">
      
      {/* STATS TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-dashboard">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Órdenes Registradas</span>
            <span className="text-2xl font-black text-slate-900">{totalOrders}</span>
          </div>
          <span className="p-2 bg-slate-100 text-slate-800 rounded-lg text-lg">📁</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pendientes / Proceso</span>
            <span className="text-2xl font-black text-amber-600">{pendingOrders}</span>
          </div>
          <span className="p-2 bg-amber-50 text-amber-600 rounded-lg text-lg">⏳</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completadas / Entregadas</span>
            <span className="text-2xl font-black text-green-600">{completedOrders}</span>
          </div>
          <span className="p-2 bg-green-50 text-green-600 rounded-lg text-lg">✅</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ingresos Estimados</span>
            <span className="text-2xl font-black text-blue-600">${totalRevenue.toFixed(2)}</span>
          </div>
          <span className="p-2 bg-blue-50 text-blue-600 rounded-lg text-lg">💵</span>
        </div>
      </div>

      {/* FILTERS & SEARCH ROW */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Control de Órdenes
            </h2>
            <p className="text-xs text-slate-500">Busque, filtre y gestione todas sus órdenes de reparación</p>
          </div>
          <button
            onClick={onNewOrder}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:scale-101 active:scale-99"
            id="btn-create-order"
          >
            <Plus className="w-4 h-4" />
            Nueva Orden
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          {/* Search */}
          <div className="relative sm:col-span-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Buscar por cliente, teléfono, orden o equipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              id="input-search-orders"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
              id="select-filter-status"
            >
              <option value="all">Todos los Estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="proceso">En Proceso</option>
              <option value="completado">Completados</option>
              <option value="entregado">Entregados</option>
            </select>
          </div>

          {/* Equipment Filter */}
          <div className="sm:col-span-3 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={equipmentFilter}
              onChange={(e) => setEquipmentFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
              id="select-filter-equipment"
            >
              <option value="all">Todos los Equipos</option>
              <option value="audio">Audio 🔊</option>
              <option value="video">Video 📺</option>
              <option value="computacion">Computación 💻</option>
              <option value="linea_blanca">Línea Blanca 🧺</option>
            </select>
          </div>
        </div>
      </div>

      {/* MAIN CARDS LIST */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center space-y-4" id="empty-state-container">
          <div className="p-4 bg-slate-50 text-slate-400 rounded-full text-3xl">
            📋
          </div>
          <div className="max-w-xs space-y-1">
            <h3 className="font-bold text-slate-900">No se encontraron órdenes</h3>
            <p className="text-xs text-slate-400">
              {orders.length === 0 
                ? 'Aún no has registrado ninguna orden de servicio.' 
                : 'Prueba ajustando los términos de búsqueda o filtros.'}
            </p>
          </div>
          {orders.length === 0 && (
            <button
              onClick={onNewOrder}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md shadow-blue-500/10"
              id="btn-empty-create"
            >
              Registrar Primera Orden
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="orders-grid">
          {filteredOrders.map((order) => {
            const hasSrvs = [
              order.servicio.revision && 'Revisión',
              order.servicio.reparacion && 'Reparación',
              order.servicio.mantenimiento && 'Mantenimiento',
              order.servicio.mantenimientoCorrectivo && 'Mant. Correctivo'
            ].filter(Boolean);

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4 group hover:border-blue-500"
                id={`order-card-${order.id}`}
              >
                {/* Card Top Block */}
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        Orden #{order.noOrden}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {order.fecha}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-sm truncate max-w-[240px]" title={order.cliente.nombreCompleto}>
                      {order.cliente.nombreCompleto}
                    </h3>
                    <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
                      <span className="text-base">{getEquipmentEmoji(order.equipo.tipo)}</span>
                      <span>{order.equipo.marca} {order.equipo.modelo}</span>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Services & Falla preview */}
                <div className="space-y-1.5 border-t border-b border-slate-50 py-2.5 text-xs text-slate-600">
                  <p className="line-clamp-2 italic leading-relaxed text-slate-500">
                    <span className="font-bold text-slate-700 not-italic block mb-0.5 text-[10px] uppercase tracking-wider">Falla reportada:</span>
                    "{order.descripcionFalla}"
                  </p>
                  
                  {hasSrvs.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {hasSrvs.map((srv, index) => (
                        <span key={index} className="text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded">
                          {srv}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Bottom / Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase leading-none mb-0.5">Costo Total</span>
                    <span className="text-base font-black text-slate-900">${order.costos.total.toFixed(2)}</span>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1.5">
                    {/* Share WhatsApp */}
                    <button
                      onClick={() => onShareWhatsApp(order)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg border border-slate-100 shadow-2xs hover:border-green-200 transition-all cursor-pointer"
                      title="Enviar por WhatsApp"
                      id={`btn-share-wa-${order.id}`}
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>

                    {/* Share other networks */}
                    <button
                      onClick={() => onShareSocial(order)}
                      className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg border border-slate-100 shadow-2xs hover:border-sky-200 transition-all cursor-pointer"
                      title="Compartir en redes"
                      id={`btn-share-social-${order.id}`}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Preview / PDF */}
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-100 shadow-2xs hover:border-blue-300 transition-all cursor-pointer"
                      title="Ver y Exportar PDF"
                      id={`btn-preview-${order.id}`}
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEditOrder(order)}
                      className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-100 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
                      title="Editar orden"
                      id={`btn-edit-${order.id}`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (confirm(`¿Está seguro de que desea eliminar la Orden #${order.noOrden}?`)) {
                          onDeleteOrder(order.id);
                        }
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-slate-100 shadow-2xs hover:border-red-200 hover:text-red-600 transition-all cursor-pointer"
                      title="Eliminar orden"
                      id={`btn-delete-${order.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
