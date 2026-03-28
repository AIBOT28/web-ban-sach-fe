import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../lib/CartContext';
import { api } from '../lib/api';
import type { Order, CheckoutRequest, UserProfile } from '../lib/types';
import {
  ShoppingBag, MapPin, Phone, ArrowLeft, CheckCircle2,
  Truck, ShieldCheck, CreditCard, Package, AlertCircle,
  ChevronRight, BookOpen
} from 'lucide-react';

type Step = 'form' | 'success';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('form');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    api.get<UserProfile>('/api/Auth/profile')
      .then((res) => setProfile(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingProfile(false));
  }, []);

  const isProfileValid = profile?.phoneNumber && profile?.address?.detailAddress && profile?.address?.province;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isProfileValid) {
      setError('Vui lòng cập nhật đầy đủ số điện thoại và địa chỉ trước khi đặt hàng.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const checkoutForm: CheckoutRequest = {
        shippingAddress: profile!.address!,
        phoneNumber: profile!.phoneNumber!
      };
      const res = await api.post<Order>('/api/Orders/checkout', checkoutForm);
      setPlacedOrder(res.data);
      setToast({ type: 'success', text: 'Đặt hàng thành công!' });
      setStep('success');
      // Clear cart optimistically
      try { await clearCart(); } catch (_) {}
      
      // Auto hide toast after 3s
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
      setToast({ type: 'error', text: err.message || 'Đặt hàng thất bại' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  // ── Empty cart guard ──
  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-12 shadow-xl border border-surface-100"
        >
          <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 mb-3">Giỏ hàng trống</h1>
          <p className="text-surface-600 mb-8">Bạn cần có sản phẩm trong giỏ trước khi thanh toán.</p>
          <Link
            to="/"
            className="btn-gradient inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold"
          >
            <ArrowLeft className="w-5 h-5" /> Tiếp tục mua sắm
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Success screen ──
  if (step === 'success' && placedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 relative">
        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 20, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className={`fixed top-4 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 font-bold text-sm min-w-[320px] ${
                toast.type === 'success' 
                  ? 'bg-success-50 text-success-700 border-success-200 shadow-success-500/20' 
                  : 'bg-danger-50 text-danger-700 border-danger-200 shadow-danger-500/20'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              {toast.text}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-surface-100 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-14 h-14 text-green-500" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <h1 className="text-3xl font-bold text-surface-900 mb-2">Đặt hàng thành công! 🎉</h1>
            <p className="text-surface-600 mb-8">
              Cảm ơn bạn đã mua hàng! Đơn hàng #{placedOrder.id} đã được xác nhận.
            </p>

            {/* Order Summary */}
            <div className="bg-surface-50 rounded-2xl p-6 text-left mb-8 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-surface-600">Mã đơn hàng</span>
                <span className="font-bold text-surface-900">#{placedOrder.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-600">Địa chỉ giao</span>
                <span className="font-medium text-surface-900 text-right max-w-[200px]">
                  {typeof placedOrder.shippingAddress === 'string' 
                    ? placedOrder.shippingAddress 
                    : placedOrder.shippingAddress?.detailAddress + ', ' + placedOrder.shippingAddress?.ward + ', ' + placedOrder.shippingAddress?.district + ', ' + placedOrder.shippingAddress?.province}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-600">Số điện thoại</span>
                <span className="font-medium text-surface-900">{placedOrder.phoneNumber}</span>
              </div>
              <hr className="border-surface-200" />
              <div className="flex justify-between">
                <span className="font-semibold text-surface-900">Tổng tiền</span>
                <span className="font-bold text-xl text-primary-600">{formatCurrency(placedOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/my-orders"
                className="btn-gradient inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white font-bold"
              >
                <Package className="w-5 h-5" /> Xem đơn hàng của tôi
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-surface-700 font-semibold border border-surface-200 hover:bg-surface-50 hover:border-surface-300 transition-all"
              >
                <BookOpen className="w-5 h-5" /> Tiếp tục mua sắm
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ── Checkout Form ──
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-4 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 font-bold text-sm min-w-[320px] ${
              toast.type === 'success' 
                ? 'bg-success-50 text-success-700 border-success-200 shadow-success-500/20' 
                : 'bg-danger-50 text-danger-700 border-danger-200 shadow-danger-500/20'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-surface-500 mb-8">
        <Link to="/" className="hover:text-primary-600 transition-colors">Trang chủ</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/cart" className="hover:text-primary-600 transition-colors">Giỏ hàng</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-surface-900 font-medium">Thanh toán</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-5 gap-8"
      >
        {/* Left: Form */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl shadow-xl border border-surface-100 p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-surface-900 mb-6">Thông tin giao hàng</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {loadingProfile ? (
                 <div className="h-40 flex items-center justify-center">
                   <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                 </div>
              ) : (
                <>
                  {!isProfileValid && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 flex flex-col items-center text-center gap-3">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                      <p className="font-semibold text-sm">Bạn chưa cập nhật đầy đủ họ tên, địa chỉ hoặc số điện thoại. Vui lòng cập nhật trước khi đặt hàng.</p>
                      <Link to="/profile" className="btn-gradient px-6 py-2 rounded-xl text-white font-bold text-sm">Cập nhật thông tin</Link>
                    </div>
                  )}

                  {isProfileValid && profile && (
                    <div className="space-y-4">
                      {/* Name & Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-surface-50 border border-surface-100 rounded-xl p-4">
                           <p className="text-xs font-semibold text-surface-500 mb-1 uppercase tracking-wider">Họ và Tên</p>
                           <p className="font-medium text-surface-900">{profile.fullName}</p>
                        </div>
                        <div className="bg-surface-50 border border-surface-100 rounded-xl p-4">
                           <p className="text-xs font-semibold text-surface-500 mb-1 uppercase tracking-wider flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Số điện thoại</p>
                           <p className="font-medium text-surface-900">{profile.phoneNumber}</p>
                        </div>
                      </div>
                      
                      {/* Shipping Address */}
                      <div className="bg-surface-50 border border-surface-100 rounded-xl p-4">
                        <p className="text-xs font-semibold text-surface-500 mb-1 uppercase tracking-wider flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Địa chỉ giao hàng</p>
                        <p className="font-medium text-surface-900 leading-relaxed">
                          {`${profile.address?.detailAddress}, ${profile.address?.ward}, ${profile.address?.district}, ${profile.address?.province}`}
                        </p>
                      </div>

                      <div className="flex justify-end">
                        <Link to="/profile" className="text-sm font-medium text-primary-600 hover:text-primary-700">Chỉnh sửa thông tin</Link>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Truck, text: 'Giao hàng toàn quốc' },
                  { icon: ShieldCheck, text: 'Bảo mật thanh toán' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 p-3 rounded-xl bg-surface-50 border border-surface-100">
                    <Icon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <span className="text-xs text-surface-600 font-medium">{text}</span>
                  </div>
                ))}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || loadingProfile || !isProfileValid}
                className="btn-gradient w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang đặt hàng...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Xác nhận đặt hàng
                  </>
                )}
              </button>

              <Link
                to="/cart"
                className="flex items-center justify-center gap-2 text-sm text-surface-500 hover:text-surface-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại giỏ hàng
              </Link>
            </form>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl border border-surface-100 p-6 sm:p-8 sticky top-24">
            <h2 className="text-lg font-bold text-surface-900 mb-5">
              Đơn hàng của bạn
              <span className="ml-2 text-sm font-normal text-surface-500">({cart.items.length} sản phẩm)</span>
            </h2>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item.cartItemId} className="flex items-center gap-3">
                  <div className="w-12 h-16 bg-surface-50 rounded-lg overflow-hidden flex-shrink-0 border border-surface-100">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.bookTitle} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-surface-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 truncate">{item.bookTitle}</p>
                    <p className="text-xs text-surface-500">x{item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-surface-900 whitespace-nowrap">
                    {item.subTotal.toLocaleString()}đ
                  </span>
                </div>
              ))}
            </div>

            <hr className="border-surface-100 my-5" />

            <div className="space-y-3">
              <div className="flex justify-between text-sm text-surface-600">
                <span>Tạm tính</span>
                <span className="font-medium text-surface-900">{cart.totalPrice.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between text-sm text-surface-600">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-green-600">Miễn phí</span>
              </div>
              <hr className="border-surface-100" />
              <div className="flex justify-between text-base font-bold">
                <span className="text-surface-900">Tổng cộng</span>
                <span className="text-primary-600 text-lg">{cart.totalPrice.toLocaleString()}đ</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
