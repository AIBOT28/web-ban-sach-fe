import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Order } from '../lib/types';
import {
  Package, ChevronRight, ChevronDown, ChevronUp,
  BookOpen, MapPin, Phone, Calendar, Clock,
  ShoppingBag, CheckCircle, XCircle, Truck, RotateCcw,
  AlertCircle
} from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  Pending: { label: 'Chờ xử lý', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  Processing: { label: 'Đang xử lý', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: RotateCcw },
  Shipped: { label: 'Đang giao', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', icon: Truck },
  Delivered: { label: 'Đã giao', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: CheckCircle },
  Cancelled: { label: 'Đã huỷ', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: XCircle },
};

function getStatus(status: string) {
  return STATUS_MAP[status] ?? { label: status, color: 'text-surface-700', bg: 'bg-surface-50 border-surface-200', icon: Package };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const status = getStatus(order.status);
  const StatusIcon = status.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-surface-100 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div
        className="flex flex-wrap items-center gap-3 p-4 sm:p-6 cursor-pointer hover:bg-surface-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="text-sm font-bold text-surface-900">Đơn hàng #{order.id}</span>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {status.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-surface-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(order.orderDate)}
            </span>
            <span className="flex items-center gap-1">
              <Package className="w-3.5 h-3.5" />
              {order.orderItems.length} sản phẩm
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-base font-bold text-primary-600">{formatCurrency(order.totalAmount)}</p>
        </div>

        <div className="text-surface-400">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-6 pb-6 pt-0 border-t border-surface-100">
              {/* Delivery Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                <div className="flex items-start gap-2 p-3 rounded-xl bg-surface-50 border border-surface-100">
                  <MapPin className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-surface-600 mb-0.5">Địa chỉ giao hàng</p>
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
                    <p className="text-xs font-semibold text-surface-600 mb-0.5">Số điện thoại</p>
                    <p className="text-sm text-surface-900">{order.phoneNumber}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <h3 className="text-sm font-bold text-surface-700 mb-3">Sản phẩm trong đơn</h3>
              <div className="space-y-2">
                {order.orderItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-100"
                  >
                    <div className="w-10 h-14 bg-white rounded-lg border border-surface-200 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-surface-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/books/${item.bookId}`}
                        className="text-sm font-medium text-surface-900 hover:text-primary-600 transition-colors truncate block"
                      >
                        {item.bookTitle}
                      </Link>
                      <p className="text-xs text-surface-500">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-surface-900 whitespace-nowrap">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 pt-4 border-t border-surface-100 flex justify-between items-center">
                <span className="text-sm text-surface-600">Tổng cộng</span>
                <span className="text-lg font-bold text-primary-600">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Order[]>('/api/Orders/my-orders')
      .then((res) => {
        setOrders(res.data ?? []);
      })
      .catch((err: any) => {
        setError(err.message || 'Không thể tải đơn hàng');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-surface-500 mb-8">
        <Link to="/" className="hover:text-primary-600 transition-colors">Trang chủ</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-surface-900 font-medium">Đơn hàng của tôi</span>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-primary-50 border border-primary-100">
          <Package className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Đơn hàng của tôi</h1>
          <p className="text-sm text-surface-600 mt-0.5">Theo dõi và quản lý đơn hàng của bạn</p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-surface-100 p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-200 rounded w-1/4" />
                  <div className="h-3 bg-surface-200 rounded w-1/3" />
                </div>
                <div className="h-5 bg-surface-200 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && orders.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-12 shadow-xl border border-surface-100 text-center"
        >
          <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-primary-400" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 mb-3">Chưa có đơn hàng nào</h2>
          <p className="text-surface-600 mb-8 max-w-sm mx-auto">
            Bạn chưa đặt hàng lần nào. Hãy khám phá kho sách phong phú của chúng tôi!
          </p>
          <Link
            to="/"
            className="btn-gradient inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold"
          >
            <BookOpen className="w-5 h-5" /> Mua sắm ngay
          </Link>
        </motion.div>
      )}

      {/* Orders List */}
      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders
            .slice()
            .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
            .map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
        </div>
      )}
    </div>
  );
}
