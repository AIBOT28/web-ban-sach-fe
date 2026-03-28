import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useCart } from '../lib/CartContext';
import type { Book, Category, PagedResult } from '../lib/types';
import { BookOpen, ChevronLeft, ChevronRight, Package, ShoppingCart, CheckCircle, AlertCircle, Filter, X } from 'lucide-react';

export default function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Read params from URL
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || null;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 12;

  useEffect(() => {
    api.get<Category[]>('/api/Categories').then((res) => {
      if (res.data) setCategories(res.data);
    });
  }, []);

  const fetchBooks = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categoryId) params.set('categoryId', categoryId);
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
  }, [search, categoryId, page]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const updatePage = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', newPage.toString());
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const calcFinalPrice = (price: number, discount: number) => {
    return price - (price * discount) / 100;
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
                ? 'bg-success-50 text-success-700 border-success-100 shadow-success-500/10' 
                : 'bg-danger-50 text-danger-700 border-danger-100 shadow-danger-500/10'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-success-500" /> : <AlertCircle className="w-5 h-5 text-danger-500" />}
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile Categories (Visible only on < md) */}
        <div className="md:hidden mb-6 flex overflow-x-auto hide-scrollbar gap-2 pb-2">
          <button
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.delete('categoryId');
              next.set('page', '1');
              setSearchParams(next);
            }}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !categoryId 
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                : 'bg-surface-50 text-surface-600 border border-surface-200'
            }`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set('categoryId', cat.id.toString());
                next.set('page', '1');
                setSearchParams(next);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                categoryId === cat.id.toString()
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-surface-50 text-surface-600 border border-surface-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sidebar Filters (Visible only on md+) */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-surface-100 sticky top-24 shadow-sm">
            <h3 className="text-base font-bold text-surface-900 mb-6 flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary-500" /> Bộ lọc
            </h3>

            {/* Selected Filters Chips */}
            {(search || categoryId) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {search && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-50 text-surface-700 text-[10px] font-bold rounded-lg border border-surface-200 uppercase tracking-tight">
                    "{search}"
                    <button onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.delete('search');
                      setSearchParams(next);
                    }}>
                      <X className="w-3 h-3 cursor-pointer" />
                    </button>
                  </span>
                )}
                {categoryId && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-50 text-surface-700 text-[10px] font-bold rounded-lg border border-surface-200 uppercase tracking-tight">
                    {categories.find(c => c.id.toString() === categoryId)?.name || 'Danh mục'}
                    <button onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.delete('categoryId');
                      setSearchParams(next);
                    }}>
                      <X className="w-3 h-3 cursor-pointer" />
                    </button>
                  </span>
                )}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-4">Danh mục sách</p>
                <nav className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.delete('categoryId');
                      next.set('page', '1');
                      setSearchParams(next);
                    }}
                    className={`text-left px-3 py-2 rounded-xl text-sm transition-all ${
                      !categoryId 
                        ? 'bg-primary-50 text-primary-600 font-bold border border-primary-100/50'
                        : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                    }`}
                  >
                    Tất cả sách
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        next.set('categoryId', cat.id.toString());
                        next.set('page', '1');
                        setSearchParams(next);
                      }}
                      className={`text-left px-3 py-2 rounded-xl text-sm transition-all ${
                        categoryId === cat.id.toString()
                          ? 'bg-primary-50 text-primary-600 font-bold border border-primary-100/50'
                          : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-surface-900">
                {search ? `Tìm kiếm: "${search}"` : categoryId ? `Danh mục: ${categories.find(c => c.id.toString() === categoryId)?.name}` : 'Tất cả sản phẩm'}
              </h1>
              <p className="text-sm text-surface-500 mt-0.5 font-medium">
                Tìm thấy <span className="text-primary-600 font-bold">{totalCount}</span> cuốn sách
              </p>
            </div>
          </div>

          {/* Results Grid */}
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
              <p className="text-surface-500 text-lg font-bold">Không có kết quả nào</p>
              <p className="text-surface-400 text-sm mt-1">Hãy thử điều chỉnh bộ lọc của bạn</p>
            </motion.div>
          ) : (
            <>
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

              {/* Minimalist Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-16 pb-12">
                  <button
                    onClick={() => updatePage(page - 1)}
                    disabled={page === 1}
                    className="w-10 h-10 rounded-2xl bg-white border border-surface-100 text-surface-400 hover:text-primary-600 hover:border-primary-100 disabled:opacity-25 transition-all flex items-center justify-center"
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
                          onClick={() => updatePage(pageNum)}
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
                    onClick={() => updatePage(page + 1)}
                    disabled={page === totalPages}
                    className="w-10 h-10 rounded-2xl bg-white border border-surface-100 text-surface-400 hover:text-primary-600 hover:border-primary-100 disabled:opacity-25 transition-all flex items-center justify-center"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
}
