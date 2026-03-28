import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../lib/CartContext';
import { 
  ShoppingBag, Trash2, Plus, Minus, ArrowLeft, 
  CreditCard, ShoppingCart, Truck, ShieldCheck 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CartPage() {
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleUpdateQty = async (itemId: number, newQty: number) => {
    if (newQty < 1) return;
    setUpdatingId(itemId);
    try {
      await updateQuantity(itemId, newQty);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && !cart) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-surface-600 font-medium">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-12 shadow-xl border border-surface-100"
        >
          <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-primary-500 opacity-50" />
          </div>
          <h1 className="text-3xl font-bold text-surface-900 mb-4">Giỏ hàng đang trống</h1>
          <p className="text-surface-600 mb-8 max-w-sm mx-auto">
            Có vẻ như bạn chưa thêm cuốn sách nào vào giỏ hàng. Hãy khám phá kho sách của chúng tôi ngay!
          </p>
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-surface-900">Giỏ hàng của bạn</h1>
          <p className="text-surface-600 mt-1">Bạn có {cart.items.length} mặt hàng trong giỏ</p>
        </div>
        <button 
          onClick={() => { if(window.confirm('Xóa toàn bộ giỏ hàng?')) clearCart(); }}
          className="text-danger-600 hover:text-danger-700 text-sm font-semibold flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-danger-50 transition-all"
        >
          <Trash2 className="w-4 h-4" /> Làm trống giỏ
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode='popLayout'>
            {cart.items.map((item) => (
              <motion.div
                key={item.cartItemId}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-surface-100 flex gap-4 sm:gap-6 items-center"
              >
                {/* Image */}
                <div className="w-20 h-28 sm:w-24 sm:h-32 bg-surface-50 rounded-xl overflow-hidden flex-shrink-0 border border-surface-100">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.bookTitle} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-surface-200" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link to={`/books/${item.bookId}`} className="text-lg font-bold text-surface-900 hover:text-primary-600 transition-colors block truncate">
                    {item.bookTitle}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-primary-600 font-bold">{item.finalPrice.toLocaleString()}đ</span>
                    {item.discountRate > 0 && (
                      <span className="text-sm text-surface-400 line-through">
                        {item.unitPrice.toLocaleString()}đ
                      </span>
                    )}
                  </div>

                  {/* Qty Counter - Mobile */}
                  <div className="flex lg:hidden items-center gap-3 mt-4">
                    <div className="flex items-center bg-surface-50 rounded-xl p-1 border border-surface-200">
                      <button 
                        onClick={() => handleUpdateQty(item.cartItemId, item.quantity - 1)}
                        className="p-1.5 hover:bg-white rounded-lg transition-all"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-surface-900">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQty(item.cartItemId, item.quantity + 1)}
                        className="p-1.5 hover:bg-white rounded-lg transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Qty Counter - Desktop */}
                <div className="hidden lg:flex items-center bg-surface-50 rounded-xl p-1 border border-surface-200">
                  <button 
                    onClick={() => handleUpdateQty(item.cartItemId, item.quantity - 1)}
                    disabled={updatingId === item.cartItemId || item.quantity <= 1}
                    className="p-1.5 hover:bg-white rounded-lg transition-all disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-surface-900">
                    {updatingId === item.cartItemId ? '...' : item.quantity}
                  </span>
                  <button 
                    onClick={() => handleUpdateQty(item.cartItemId, item.quantity + 1)}
                    disabled={updatingId === item.cartItemId}
                    className="p-1.5 hover:bg-white rounded-lg transition-all disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="text-right flex flex-col items-end gap-2 sm:gap-4 ml-2">
                  <span className="font-bold text-surface-900 whitespace-nowrap">{(item.subTotal).toLocaleString()}đ</span>
                  <button 
                    onClick={() => removeItem(item.cartItemId)}
                    className="p-2 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary Side */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-surface-100 sticky top-24">
            <h2 className="text-xl font-bold text-surface-900 mb-6">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-surface-600">
                <span>Tạm tính</span>
                <span className="text-surface-900 font-medium">{cart.totalPrice.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between text-surface-600">
                <span>Phí vận chuyển</span>
                <span className="text-success-600 font-medium">Miễn phí</span>
              </div>
              <hr className="border-surface-100" />
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng</span>
                <span className="text-primary-600 uppercase italic">{(cart.totalPrice).toLocaleString()}đ</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="btn-gradient w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30"
            >
              <CreditCard className="w-5 h-5" /> Tiến hành thanh toán
            </Link>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-surface-500">
                <Truck className="w-5 h-5 text-primary-500" />
                <span>Giao hàng nhanh toàn quốc</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-surface-500">
                <ShieldCheck className="w-5 h-5 text-primary-500" />
                <span>Bảo mật thông tin thanh toán</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
