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
                ? 'bg-success-50 text-success-700 border-success-200 shadow-success-500/20' 
                : 'bg-danger-50 text-danger-700 border-danger-200 shadow-danger-500/20'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="glass rounded-2xl p-6 border border-surface-200 sticky top-24">
            <h3 className="text-lg font-bold text-surface-900 mb-6 flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary-500" /> Bộ lọc
            </h3>

            {/* Selected Filters */}
            {(search || categoryId) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {search && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-lg border border-primary-100 uppercase tracking-tight">
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
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-50 text-accent-700 text-xs font-bold rounded-lg border border-accent-100 uppercase tracking-tight">
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
                <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-4">Danh mục sách</p>
                <nav className="flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.delete('categoryId');
                      next.set('page', '1');
                      setSearchParams(next);
                    }}
                    className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      !categoryId 
                        ? 'bg-primary-50 text-primary-700 font-bold border border-primary-100 shadow-sm shadow-primary-500/10'
                        : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
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
                      className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        categoryId === cat.id.toString()
                          ? 'bg-primary-50 text-primary-700 font-bold border border-primary-100 shadow-sm shadow-primary-500/10'
                          : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
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
        <div className="flex-1">
          {/* Header Info */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-surface-900">
                {search ? `Tìm kiếm: "${search}"` : categoryId ? `Danh mục: ${categories.find(c => c.id.toString() === categoryId)?.name}` : 'Tất cả sản phẩm'}
              </h1>
              <p className="text-sm text-surface-500 mt-1 font-medium">
                Tìm thấy <span className="text-primary-600 font-bold">{totalCount}</span> cuốn sách
              </p>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-white border border-surface-200 rounded-2xl overflow-hidden animate-pulse shadow-sm">
                  <div className="aspect-[3/4] bg-surface-100" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-surface-200 rounded w-3/4" />
                    <div className="h-3 bg-surface-100 rounded w-1/2" />
                    <div className="h-5 bg-surface-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-surface-50 rounded-3xl border-2 border-dashed border-surface-200"
            >
              <Package className="w-16 h-16 text-surface-300 mx-auto mb-4" />
              <p className="text-surface-500 text-lg font-bold">Không có kết quả nào phù hợp</p>
              <p className="text-surface-400 text-sm mt-1">Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book, index) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/books/${book.id}`}
                      className="group flex flex-col h-full bg-white border border-surface-200 rounded-3xl overflow-hidden hover:border-primary-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    >
                      {/* Image */}
                      <div className="aspect-[3/4] bg-surface-100 relative overflow-hidden">
                        {book.mainImageUrl ? (
                          <img
                            src={book.mainImageUrl}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-50 to-surface-200 group-hover:scale-105 transition-transform duration-700">
                            <BookOpen className="w-12 h-12 text-surface-300" />
                          </div>
                        )}
                        {book.discountRate > 0 && (
                          <div className="absolute top-3 right-3 bg-gradient-to-r from-danger-500 to-rose-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl shadow-md">
                            -{book.discountRate}%
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-5 flex flex-col flex-1 bg-white">
                        {book.categoryName && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50" />
                            <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">{book.categoryName}</span>
                          </div>
                        )}
                        <h3 className="text-base font-bold text-surface-900 line-clamp-2 group-hover:text-primary-600 transition-colors mb-3 leading-snug">
                          {book.title}
                        </h3>
                        
                        <div className="mt-auto pt-4 flex items-end justify-between border-t border-surface-100">
                          <div>
                            {book.discountRate > 0 ? (
                              <div className="flex flex-col">
                                <span className="text-xs text-surface-400 line-through mb-1 font-medium">
                                  {formatCurrency(book.price)}
                                </span>
                                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                                  {formatCurrency(calcFinalPrice(book.price, book.discountRate))}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xl font-black text-surface-900">
                                {formatCurrency(book.price)}
                              </span>
                            )}
                          </div>
                          
                          <button
                            onClick={(e) => handleQuickAdd(e, book)}
                            disabled={addingId === book.id || book.stockQuantity === 0}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              book.stockQuantity === 0
                                ? 'bg-surface-100 text-surface-400 cursor-not-allowed'
                                : 'bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white shadow-sm'
                            }`}
                          >
                            {addingId === book.id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <ShoppingCart className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 pb-8">
                  <button
                    onClick={() => updatePage(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded-lg bg-white border border-surface-200 text-surface-600 hover:bg-primary-50 hover:text-primary-600 disabled:opacity-40 transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

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
                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                          page === pageNum
                            ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30'
                            : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => updatePage(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg bg-white border border-surface-200 text-surface-600 hover:bg-primary-50 hover:text-primary-600 disabled:opacity-40 transition-all shadow-sm"
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
