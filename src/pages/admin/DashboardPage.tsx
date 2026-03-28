import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../../lib/api';
import type { Book, Category, PagedResult } from '../../lib/types';
import { Library, Tag, TrendingUp, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<PagedResult<Book>>('/api/Books?page=1&size=5'),
      api.get<Category[]>('/api/Categories'),
    ])
      .then(([booksRes, catsRes]) => {
        if (booksRes.data) {
          setTotalBooks(booksRes.data.totalCount);
          setRecentBooks(booksRes.data.items);
        }
        if (catsRes.data) {
          setTotalCategories(catsRes.data.length);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const stats = [
    {
      label: 'Tổng số sách',
      value: totalBooks,
      icon: Library,
      gradient: 'from-violet-500 to-purple-600',
      link: '/admin/books',
    },
    {
      label: 'Danh mục',
      value: totalCategories,
      icon: Tag,
      gradient: 'from-cyan-500 to-blue-600',
      link: '/admin/categories',
    },
  ];

  return (
    <div>
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-surface-900">Dashboard</h1>
        <p className="text-sm text-surface-600 mt-1">Tổng quan hệ thống quản lý sách</p>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={stat.link}
                className="block glass rounded-2xl p-6 group hover:border-primary-500/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-surface-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm text-surface-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-surface-900">
                  {loading ? (
                    <span className="inline-block w-16 h-8 bg-surface-200 rounded animate-pulse" />
                  ) : (
                    stat.value
                  )}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Books */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-surface-900">Sách mới nhất</h2>
          </div>
          <Link
            to="/admin/books"
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
          >
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl animate-pulse">
                <div className="w-12 h-12 bg-surface-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-200 rounded w-1/3" />
                  <div className="h-3 bg-surface-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : recentBooks.length === 0 ? (
          <p className="text-center text-surface-400 py-8">Chưa có sách nào</p>
        ) : (
          <div className="space-y-2">
            {recentBooks.map((book) => (
              <div
                key={book.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-50 transition-all border border-transparent hover:border-surface-200"
              >
                <div className="w-12 h-12 rounded-lg bg-surface-100 overflow-hidden flex-shrink-0 border border-surface-200">
                  {book.mainImageUrl ? (
                    <img src={book.mainImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Library className="w-5 h-5 text-surface-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">{book.title}</p>
                  <p className="text-xs text-surface-600">{book.categoryName || 'Không phân loại'}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-primary-600">{formatCurrency(book.price)}</p>
                  <p className="text-xs text-surface-500">SL: {book.stockQuantity}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
