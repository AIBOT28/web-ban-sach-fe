import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';
import type { Order } from '../../lib/types';
import {
  Package, ChevronDown, ChevronUp, MapPin, Phone,
  Calendar, BookOpen, CheckCircle, XCircle, Truck,
  RotateCcw, Clock, Search, Filter, AlertCircle,
  RefreshCw, User, ChevronRight
} from 'lucide-react';

const ALL_STATUSES = ['Chờ xử lý', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã huỷ'];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  'Chờ xử lý': { label: 'Chờ xử lý', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
  'Đang xử lý': { label: 'Đang xử lý', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: RotateCcw },
  'Đang giao': { label: 'Đang giao', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: Truck },
  'Đã giao': { label: 'Đã giao', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle },
  'Đã huỷ': { label: 'Đã huỷ', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle },
};

function getStatus(s: string) {
  return STATUS_MAP[s] ?? { label: s, color: 'text-surface-700', bg: 'bg-surface-50', border: 'border-surface-200', icon: Package };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
}

// ─── Admin Order Row ───────────────────────────────────────────────────────────
function OrderRow({ order, onStatusChange }: { order: Order; onStatusChange: (id: number, status: string) => Promise<void> }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.status);

  const handleStatusSave = async () => {
    if (selectedStatus === order.status) return;
    setUpdating(true);
    try {
      await onStatusChange(order.id, selectedStatus);
    } finally {
      setUpdating(false);
    }
  };

  const status = getStatus(order.status);
  const StatusIcon = status.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-surface-100 shadow-sm overflow-hidden"
    >
      {/* Row Header */}
      <div
        className="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-4 cursor-pointer hover:bg-surface-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* ID + Status */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-primary-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-surface-900">Đơn #{order.id}</p>
            <p className="text-xs text-surface-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {formatDate(order.orderDate)}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.border} ${status.color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {status.label}
        </span>

        {/* Total */}
        <span className="text-sm font-bold text-surface-900 whitespace-nowrap">
          {formatCurrency(order.totalAmount)}
        </span>

        {/* Expand toggle */}
        <div className="text-surface-400 ml-auto">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Expanded Section */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-6 pb-6 border-t border-surface-100 pt-5 space-y-5">
              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 p-3 rounded-xl bg-surface-50 border border-surface-100">
                  <MapPin className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-surface-500 mb-0.5">Địa chỉ</p>
                    <p className="text-sm text-surface-900">
                      {typeof order.shippingAddress === 'string' 
                        ? order.shippingAddress 
                        : `${order.shippingAddress?.detailAddress}, ${order.shippingAddress?.ward}, ${order.shippingAddress?.district}, ${order.shippingAddress?.province}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-xl bg-surface-50 border border-surface-100">
                  <Phone className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-surface-500 mb-0.5">Điện thoại</p>
                    <p className="text-sm text-surface-900">{order.phoneNumber}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-bold text-surface-600 uppercase tracking-wider mb-2">Sản phẩm</p>
                <div className="space-y-2">
                  {order.orderItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-100">
                      <BookOpen className="w-4 h-4 text-surface-400 flex-shrink-0" />
                      <span className="flex-1 text-sm text-surface-900 truncate">{item.bookTitle}</span>
                      <span className="text-xs text-surface-500">x{item.quantity}</span>
                      <span className="text-sm font-semibold text-surface-900 whitespace-nowrap">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update */}
              <div className="pt-4 border-t border-surface-100">
                <p className="text-xs font-bold text-surface-600 uppercase tracking-wider mb-3">Cập nhật trạng thái</p>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 min-w-[160px] px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>{getStatus(s).label}</option>
                    ))}
                  </select>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStatusSave(); }}
                    disabled={updating || selectedStatus === order.status}
                    className="px-5 py-2.5 rounded-xl btn-gradient text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                  >
                    {updating ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang lưu...</>
                    ) : (
                      <><CheckCircle className="w-4 h-4" /> Lưu</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Admin Orders Page ────────────────────────────────────────────────────────
export default function OrdersManagePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchId, setSearchId] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Stats
  const statCounts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    // Admin fetches all orders — use a dedicated admin endpoint if exists;
    // here we use my-orders as fallback (replace if backend has /api/Orders/all)
    try {
      // Try admin "all orders" endpoint; if 403 it returns empty
      const res = await api.get<Order[]>('/api/Orders/my-orders');
      setOrders(res.data ?? []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.put(`/api/Orders/${id}/status`, status);
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
      showToast(`Cập nhật trạng thái đơn #${id} thành công!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Cập nhật thất bại', 'error');
    }
  };

  const filtered = orders
    .filter((o) => filterStatus === 'all' || o.status === filterStatus)
    .filter((o) => !searchId || String(o.id).includes(searchId.trim()));

  return (
    <div>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold ${
              toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900">Quản lý đơn hàng</h1>
          <p className="text-sm text-surface-600 mt-1">Theo dõi và cập nhật trạng thái đơn hàng</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-700 hover:bg-surface-100 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {ALL_STATUSES.map((s) => {
          const st = getStatus(s);
          const Icon = st.icon;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                filterStatus === s
                  ? `${st.bg} ${st.border} shadow-sm`
                  : 'bg-white border-surface-100 hover:border-surface-200 hover:bg-surface-50'
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${filterStatus === s ? st.color : 'text-surface-400'}`} />
              <p className={`text-xl font-bold ${filterStatus === s ? st.color : 'text-surface-900'}`}>
                {statCounts[s] ?? 0}
              </p>
              <p className={`text-xs font-medium mt-0.5 ${filterStatus === s ? st.color : 'text-surface-500'}`}>
                {st.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-surface-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          >
            <option value="all">Tất cả trạng thái</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{getStatus(s).label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-surface-100 p-5 animate-pulse flex gap-4">
              <div className="w-10 h-10 bg-surface-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-200 rounded w-1/4" />
                <div className="h-3 bg-surface-200 rounded w-1/3" />
              </div>
              <div className="h-5 bg-surface-200 rounded w-20" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500">Không tìm thấy đơn hàng nào.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered
            .slice()
            .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
            .map((order) => (
              <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} />
            ))}
        </div>
      )}
    </div>
  );
}
