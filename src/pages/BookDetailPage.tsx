import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useCart } from '../lib/CartContext';
import type { Book } from '../lib/types';
import { ArrowLeft, BookOpen, Tag, Package, ImageIcon, ShoppingCart, Minus, Plus, CheckCircle, AlertCircle } from 'lucide-react';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get<Book>(`/api/Books/${id}`)
      .then((res) => {
        if (res.data) {
          setBook(res.data);
          setSelectedImage(res.data.mainImageUrl || '');
        }
      })
      .catch(() => setBook(null))
      .finally(() => setLoading(false));
  }, [id]);

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const calcFinalPrice = (price: number, discount: number) => {
    return price - (price * discount) / 100;
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!book) return;

    if (book.stockQuantity <= 0) {
      setMsg({ type: 'error', text: 'Sách đã hết hàng' });
      return;
    }
    if (quantity > book.stockQuantity) {
      setMsg({ type: 'error', text: `Chỉ còn ${book.stockQuantity} sản phẩm trong kho` });
      return;
    }

    setAdding(true);
    setMsg(null);
    try {
      const message = await addToCart(book.id, quantity);
      setMsg({ type: 'success', text: message });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
      setTimeout(() => setMsg(null), 3000);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="glass rounded-2xl p-6 sm:p-8 animate-pulse">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-surface-200/50 rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-surface-200/50 rounded w-3/4" />
              <div className="h-4 bg-surface-200/50 rounded w-1/4" />
              <div className="h-10 bg-surface-200/50 rounded w-1/3" />
              <div className="space-y-2 mt-8">
                <div className="h-3 bg-surface-200/50 rounded" />
                <div className="h-3 bg-surface-200/50 rounded" />
                <div className="h-3 bg-surface-200/50 rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <Package className="w-16 h-16 text-surface-300 mx-auto mb-4" />
        <h2 className="text-xl text-surface-400">Không tìm thấy sách</h2>
        <Link to="/" className="inline-block mt-4 text-primary-600 hover:text-primary-700 text-sm">
          ← Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Back link */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600 transition-colors mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 sm:p-8"
      >
        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            {/* Main image */}
            <div className="aspect-square bg-surface-100 rounded-xl overflow-hidden mb-4 border border-surface-200">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={book.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-20 h-20 text-surface-200" />
                </div>
              )}
            </div>

            {/* Thumbnail gallery */}
            {book.images && book.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {book.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.imageUrl)}
                    className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img.imageUrl
                      ? 'border-primary-500'
                      : 'border-surface-200 hover:border-surface-300'
                      }`}
                  >
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {book.categoryName && (
              <div className="flex items-center gap-1.5 mb-3">
                <Tag className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-primary-400 font-medium">{book.categoryName}</span>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 mb-4">{book.title}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              {book.discountRate > 0 ? (
                <>
                  <span className="text-3xl font-bold gradient-text">
                    {formatCurrency(calcFinalPrice(book.price, book.discountRate))}
                  </span>
                  <span className="text-lg text-surface-400 line-through">
                    {formatCurrency(book.price)}
                  </span>
                  <span className="px-2 py-0.5 bg-danger-50 text-danger-600 text-sm font-bold rounded-lg border border-danger-100">
                    -{book.discountRate}%
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold gradient-text">
                  {formatCurrency(book.price)}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl bg-surface-50 border border-surface-200 w-fit">
              <Package className="w-4 h-4 text-surface-400" />
              <span className="text-sm text-surface-600">
                Còn: <span className={`font-semibold ${book.stockQuantity > 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  {book.stockQuantity > 0 ? `${book.stockQuantity} sản phẩm` : 'Hết hàng'}
                </span>
              </span>
            </div>

            {/* Add to Cart Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center bg-surface-50 rounded-2xl p-1 border border-surface-200 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-white rounded-xl transition-all"
                >
                  <Minus className="w-5 h-5 text-surface-600" />
                </button>
                <span className="w-12 text-center font-bold text-lg text-surface-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(book.stockQuantity, quantity + 1))}
                  className="p-2 hover:bg-white rounded-xl transition-all text-surface-600"
                  disabled={quantity >= book.stockQuantity}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding || book.stockQuantity === 0}
                className="btn-gradient flex-1 py-4 px-8 rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 disabled:opacity-60"
              >
                {adding ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ShoppingCart className="w-5 h-5" />
                )}
                {book.stockQuantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
              </button>
            </div>

            {/* Notification */}
            <AnimatePresence>
              {msg && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`p-4 rounded-2xl mb-8 flex items-center gap-3 font-medium transition-all ${msg.type === 'success'
                    ? 'bg-success-50 text-success-700 border border-success-100 shadow-sm shadow-success-500/10'
                    : 'bg-danger-50 text-danger-700 border border-danger-100 shadow-sm shadow-danger-500/10'
                    }`}
                >
                  {msg.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span className="flex-1">{msg.text}</span>
                  {msg.type === 'success' && (
                    <Link to="/cart" className="text-sm underline underline-offset-4 hover:opacity-80">
                      Xem giỏ hàng
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Description */}
            {book.description && (
              <div>
                <h3 className="text-sm font-semibold text-surface-800 mb-2">Mô tả sách</h3>
                <div className="text-sm text-surface-600 leading-relaxed whitespace-pre-wrap">
                  {book.description}
                </div>
              </div>
            )}

            {/* Images count */}
            {book.images && book.images.length > 0 && (
              <div className="flex items-center gap-2 mt-6 text-sm text-surface-400">
                <ImageIcon className="w-4 h-4" />
                {book.images.length} hình ảnh
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
