import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useCart } from '../lib/CartContext';
import type { Book, Category, PagedResult } from '../lib/types';
import { Search, BookOpen, ChevronLeft, ChevronRight, Package, ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const pageSize = 12;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('size', pageSize.toString());

    api.get<PagedResult<Book>>(`/api/Books?${params.toString()}`)
      .then((res) => {
        if (res.data) {
          setBooks(res.data.items);
          setTotalCount(res.data.totalCount);
        }
      })
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const calcFinalPrice = (price: number, discount: number) => {
    return price - (price * discount) / 100;
  };

  const handleQuickAdd = async (e: React.MouseEvent, book: Book) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (book.stockQuantity <= 0) {
      setToast({ type: 'error', text: `Sách "${book.title}" đã hết hàng` });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setAddingId(book.id);
    try {
      await addToCart(book.id, 1);
      setToast({ type: 'success', text: `Đã thêm "${book.title}" vào giỏ hàng` });
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      setToast({ type: 'error', text: err.message });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative">
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
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Hero Banner */}
      <div className="relative mb-16 pt-8 pb-12 overflow-hidden rounded-3xl">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-100 rounded-full blur-[100px] -z-10" />
        
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 relative z-10 bg-white/80 backdrop-blur-xl p-6 md:p-12 rounded-3xl border border-surface-200 shadow-xl overflow-hidden">
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Nền tảng đọc sách #1
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-surface-900">
              Khơi nguồn <br className="hidden lg:block"/> 
              <span className="gradient-text">Tri thức vô tận</span>
            </h1>
            
            <p className="text-lg text-surface-600 max-w-xl mx-auto lg:mx-0">
              Đắm chìm vào không gian văn hóa đa dạng với hàng ngàn đầu sách chọn lọc. Mở sách ra, mở ra cả thế giới.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              <Link 
                to="/books"
                className="btn-gradient w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-1 transition-all flex items-center justify-center"
              >
                Khám phá ngay
              </Link>
              <Link 
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-surface-700 bg-surface-50 border border-surface-200 hover:bg-surface-100 hover:text-primary-600 transition-all text-center shadow-sm"
              >
                Đăng ký thành viên
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-surface-100">
              <div>
                <p className="text-2xl font-bold text-surface-900">10K+</p>
                <p className="text-xs text-surface-500 font-medium tracking-wider uppercase mt-1">Đầu sách</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">50K+</p>
                <p className="text-xs text-surface-500 font-medium tracking-wider uppercase mt-1">Độc giả</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">4.9/5</p>
                <p className="text-xs text-surface-500 font-medium tracking-wider uppercase mt-1">Đánh giá</p>
              </div>
            </div>
          </motion.div>
          
          {/* 3D Floating Images - Light Mode */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 relative h-[400px] w-full hidden md:block"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md h-full flex items-center justify-center pointer-events-none" style={{ perspective: '1000px' }}>
              {/* Center Main Book */}
              <motion.div 
                animate={{ y: [0, -15, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute z-30 w-52 h-72 bg-white rounded-lg shadow-2xl border border-surface-200 flex flex-col items-center justify-center overflow-hidden"
                style={{ transformStyle: 'preserve-3d', transform: 'rotateY(-15deg) rotateX(10deg)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-50 to-transparent"></div>
                <BookOpen className="w-16 h-16 text-primary-500 mb-4" />
                <div className="w-24 h-2 bg-surface-200 rounded mb-2"></div>
                <div className="w-16 h-2 bg-surface-200 rounded"></div>
              </motion.div>
              
              {/* Left Book */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute z-20 w-44 h-60 bg-white/90 rounded-lg shadow-xl border border-surface-200 flex items-center justify-center -translate-x-32 translate-y-12 backdrop-blur-sm"
                style={{ transformStyle: 'preserve-3d', transform: 'rotateY(-25deg) rotateZ(-5deg)' }}
              >
                <div className="rotate-90 text-surface-300 font-bold text-3xl tracking-widest leading-none">NOVEL</div>
              </motion.div>

              {/* Right Book */}
              <motion.div 
                animate={{ y: [0, -12, 0] }} 
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute z-10 w-44 h-60 bg-white/90 rounded-lg shadow-xl border border-surface-200 flex items-center justify-center translate-x-32 -translate-y-4 backdrop-blur-md"
                style={{ transformStyle: 'preserve-3d', transform: 'rotateY(15deg) rotateZ(5deg)' }}
              >
                 <div className="rotate-90 text-surface-300 font-bold text-3xl tracking-widest leading-none">SCI-FI</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Featured Books Section Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold text-surface-900 flex items-center gap-3 w-full md:w-auto">
            Sách mới nhất
            <div className="h-px bg-surface-200 flex-1 ml-4 hidden md:block"></div>
          </h2>
          
          <Link to="/books" className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1 group">
            Xem tất cả <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Results info */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-surface-500">
          Tìm thấy <span className="text-primary-600 font-semibold">{totalCount}</span> cuốn sách
        </p>
      </div>

      {/* Book grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white/50 border border-surface-100 rounded-3xl overflow-hidden animate-pulse">
              <div className="aspect-[3/4] bg-surface-50" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-surface-50 rounded w-3/4" />
                <div className="h-3 bg-surface-50 rounded w-1/2" />
                <div className="h-5 bg-surface-50 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-surface-50/50 rounded-[40px] border-2 border-dashed border-surface-100"
        >
          <Package className="w-12 h-12 text-surface-200 mx-auto mb-4" />
          <p className="text-surface-500 text-lg font-bold">Không tìm thấy sách nào</p>
          <p className="text-surface-400 text-sm mt-1">Hãy thử tìm với từ khóa khác</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {books.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/books/${book.id}`}
                className="group flex flex-col h-full bg-white/40 hover:bg-white border border-surface-100 rounded-[32px] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1.5"
              >
                {/* Image Container */}
                <div className="aspect-[3.5/4] bg-surface-50 relative overflow-hidden m-2 rounded-[24px]">
                  {book.mainImageUrl ? (
                    <img
                      src={book.mainImageUrl}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-100">
                      <BookOpen className="w-10 h-10 text-surface-200" />
                    </div>
                  )}
                  {book.discountRate > 0 && (
                    <div className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                      -{book.discountRate}%
                    </div>
                  )}
                </div>

                {/* Info Container */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-surface-900 line-clamp-2 group-hover:text-primary-600 transition-colors mb-2 leading-tight">
                    {book.title}
                  </h3>
                  
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                      {book.discountRate > 0 ? (
                        <>
                          <span className="text-[10px] text-surface-400 line-through font-medium">
                            {formatCurrency(book.price)}
                          </span>
                          <span className="text-base font-black text-primary-600">
                            {formatCurrency(calcFinalPrice(book.price, book.discountRate))}
                          </span>
                        </>
                      ) : (
                        <span className="text-base font-black text-surface-900">
                          {formatCurrency(book.price)}
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => handleQuickAdd(e, book)}
                      disabled={addingId === book.id || book.stockQuantity === 0}
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        book.stockQuantity === 0
                          ? 'bg-surface-50 text-surface-300 cursor-not-allowed'
                          : 'bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white shadow-sm'
                      }`}
                    >
                      {addingId === book.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ShoppingCart className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-16 pb-12">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-10 h-10 rounded-2xl bg-white border border-surface-100 text-surface-400 hover:text-primary-600 hover:border-primary-100 disabled:opacity-25 transition-all flex items-center justify-center shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) pageNum = i + 1;
              else if (page <= 3) pageNum = i + 1;
              else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = page - 2 + i;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-2xl text-xs font-black transition-all ${
                    page === pageNum
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 scale-110'
                      : 'bg-white border border-surface-100 text-surface-400 hover:border-primary-100 hover:text-primary-600'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-10 h-10 rounded-2xl bg-white border border-surface-100 text-surface-400 hover:text-primary-600 hover:border-primary-100 disabled:opacity-25 transition-all flex items-center justify-center shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
