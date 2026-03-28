import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';
import type { Book, Category, PagedResult } from '../../lib/types';
import {
  Plus, Pencil, Trash2, X, Search, ChevronLeft, ChevronRight,
  Library, Upload, Star, Image as ImageIcon, CheckCircle, AlertTriangle
} from 'lucide-react';

interface BookForm {
  title: string;
  description: string;
  price: string;
  discountRate: string;
  stockQuantity: string;
  categoryId: string;
}

const emptyForm: BookForm = {
  title: '',
  description: '',
  price: '',
  discountRate: '0',
  stockQuantity: '',
  categoryId: '',
};

export default function BooksManagePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const pageSize = 10;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<BookForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formFiles, setFormFiles] = useState<File[]>([]);

  // Image upload
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageBookId, setImageBookId] = useState<number | null>(null);
  const [imageBook, setImageBook] = useState<Book | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Delete & toast
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBooks = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
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
  }, [search, page]);

  useEffect(() => {
    api.get<Category[]>('/api/Categories').then((res) => {
      if (res.data) setCategories(res.data);
    });
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // ===== Book CRUD =====
  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormFiles([]);
    setShowModal(true);
  };

  const openEdit = (book: Book) => {
    setEditId(book.id);
    setForm({
      title: book.title,
      description: book.description || '',
      price: book.price.toString(),
      discountRate: book.discountRate.toString(),
      stockQuantity: book.stockQuantity.toString(),
      categoryId: book.categoryId.toString(),
    });
    setFormFiles([]);
    setShowModal(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      id: editId || 0,
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      discountRate: parseInt(form.discountRate),
      stockQuantity: parseInt(form.stockQuantity),
      categoryId: parseInt(form.categoryId),
    };
    try {
      if (editId) {
        await api.put(`/api/Books/${editId}`, payload);
        if (formFiles.length > 0) {
          await api.upload(`/api/Books/${editId}/images`, formFiles);
        }
        showToast('success', 'Cập nhật sách thành công!');
      } else {
        const res = await api.post<Book>('/api/Books', payload);
        if (formFiles.length > 0 && res.data?.id) {
          await api.upload(`/api/Books/${res.data.id}/images`, formFiles);
        }
        showToast('success', 'Thêm sách thành công!');
      }
      setShowModal(false);
      fetchBooks();
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/Books/${id}`);
      showToast('success', 'Xóa sách thành công!');
      setDeleteConfirm(null);
      fetchBooks();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // ===== Images =====
  const openImageModal = (book: Book) => {
    setImageBookId(book.id);
    setImageBook(book);
    setUploadFiles([]);
    setShowImageModal(true);
  };

  const refreshBookImages = async () => {
    if (!imageBookId) return;
    const res = await api.get<Book>(`/api/Books/${imageBookId}`);
    if (res.data) {
      setImageBook(res.data);
      fetchBooks();
    }
  };

  const handleUploadImages = async () => {
    if (!imageBookId || uploadFiles.length === 0) return;
    setUploading(true);
    try {
      await api.upload(`/api/Books/${imageBookId}/images`, uploadFiles);
      showToast('success', `Upload ${uploadFiles.length} ảnh thành công!`);
      setUploadFiles([]);
      await refreshBookImages();
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSetMain = async (imageId: number) => {
    if (!imageBookId) return;
    try {
      await api.put(`/api/Books/images/${imageId}/set-main?bookId=${imageBookId}`);
      showToast('success', 'Đã đặt ảnh bìa!');
      await refreshBookImages();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await api.delete(`/api/Books/images/${imageId}`);
      showToast('success', 'Đã xóa ảnh!');
      await refreshBookImages();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const updateForm = (field: keyof BookForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4 inline mr-2" /> : <AlertTriangle className="w-4 h-4 inline mr-2" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Quản lý Sách</h1>
          <p className="text-sm text-surface-600 mt-1">{totalCount} sách trong hệ thống</p>
        </div>
        <button
          id="add-book-btn"
          onClick={openCreate}
          className="btn-gradient px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Thêm sách
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            id="admin-search-books"
            type="text"
            className="input-field pl-10"
            placeholder="Tìm kiếm sách..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-gradient px-4 py-2 rounded-xl text-sm">Tìm</button>
      </form>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50/50">
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-4">Sách</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-4 hidden md:table-cell">Danh mục</th>
                <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-4">Giá</th>
                <th className="text-center text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-4 hidden sm:table-cell">Kho</th>
                <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-surface-100">
                    <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-surface-100 rounded-lg animate-pulse" /><div className="h-4 bg-surface-100 rounded w-32 animate-pulse" /></div></td>
                    <td className="px-4 py-4 hidden md:table-cell"><div className="h-4 bg-surface-100 rounded w-20 animate-pulse" /></td>
                    <td className="px-4 py-4"><div className="h-4 bg-surface-100 rounded w-24 ml-auto animate-pulse" /></td>
                    <td className="px-4 py-4 hidden sm:table-cell"><div className="h-4 bg-surface-100 rounded w-10 mx-auto animate-pulse" /></td>
                    <td className="px-4 py-4"><div className="h-4 bg-surface-100 rounded w-24 ml-auto animate-pulse" /></td>
                  </tr>
                ))
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-surface-400">
                    <Library className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Không tìm thấy sách nào</p>
                  </td>
                </tr>
              ) : (
                books.map((book, index) => (
                  <motion.tr
                    key={book.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-surface-100 hover:bg-surface-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-100 overflow-hidden flex-shrink-0 border border-surface-200">
                          {book.mainImageUrl ? (
                            <img src={book.mainImageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Library className="w-4 h-4 text-surface-300" /></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-surface-900 truncate max-w-[200px]">{book.title}</p>
                          <p className="text-xs text-surface-500 md:hidden">{book.categoryName || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-surface-600">{book.categoryName || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-semibold text-primary-600">{formatCurrency(book.price)}</p>
                      {book.discountRate > 0 && (
                        <p className="text-xs text-danger-600">-{book.discountRate}%</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className={`text-sm font-medium ${book.stockQuantity > 0 ? 'text-success-600' : 'text-danger-600'}`}>
                        {book.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openImageModal(book)}
                          className="p-2 rounded-lg hover:bg-primary-50 text-surface-400 hover:text-primary-600 transition-all"
                          title="Quản lý ảnh"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(book)}
                          className="p-2 rounded-lg hover:bg-primary-50 text-surface-400 hover:text-primary-600 transition-all"
                          title="Sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {deleteConfirm === book.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(book.id)} className="px-2 py-1 text-xs bg-danger-50 text-danger-600 rounded-lg hover:bg-danger-100 border border-danger-200">Xóa</button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-xs bg-surface-100 text-surface-600 rounded-lg">Hủy</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(book.id)}
                            className="p-2 rounded-lg hover:bg-danger-50 text-surface-400 hover:text-danger-600 transition-all"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg glass hover:bg-surface-800/60 disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-surface-600 px-3 font-medium">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg bg-white border border-surface-200 hover:bg-surface-50 disabled:opacity-30 transition-all shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ===== Book Create/Edit Modal ===== */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="fixed inset-0 bg-black/60" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-surface-900">
                  {editId ? 'Sửa thông tin sách' : 'Thêm sách mới'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBook} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">Tên sách *</label>
                  <input
                    id="book-title-input"
                    type="text"
                    className="input-field"
                    placeholder="Nhập tên sách"
                    value={form.title}
                    onChange={(e) => updateForm('title', e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">Danh mục *</label>
                  <select
                    id="book-category-select"
                    className="input-field"
                    value={form.categoryId}
                    onChange={(e) => updateForm('categoryId', e.target.value)}
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">Giá (VNĐ) *</label>
                    <input
                      id="book-price-input"
                      type="number"
                      min="0"
                      step="1000"
                      className="input-field"
                      placeholder="0"
                      value={form.price}
                      onChange={(e) => updateForm('price', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">Giảm (%)</label>
                    <input
                      id="book-discount-input"
                      type="number"
                      min="0"
                      max="100"
                      className="input-field"
                      placeholder="0"
                      value={form.discountRate}
                      onChange={(e) => updateForm('discountRate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">Tồn kho *</label>
                    <input
                      id="book-stock-input"
                      type="number"
                      min="0"
                      className="input-field"
                      placeholder="0"
                      value={form.stockQuantity}
                      onChange={(e) => updateForm('stockQuantity', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">Mô tả</label>
                  <textarea
                    id="book-description-input"
                    className="input-field min-h-[100px] resize-y"
                    placeholder="Mô tả chi tiết về sách..."
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">Ảnh sản phẩm (Tùy chọn)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setFormFiles(Array.from(e.target.files || []))}
                    className="input-field file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:font-bold file:cursor-pointer hover:file:bg-primary-100"
                  />
                  {formFiles.length > 0 && (
                    <p className="text-xs text-surface-500 mt-2 font-medium">
                      Đã chọn {formFiles.length} ảnh
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm rounded-xl text-surface-900 hover:bg-surface-100 transition-all font-bold">
                    Hủy
                  </button>
                  <button
                    id="book-save-btn"
                    type="submit"
                    disabled={saving}
                    className="btn-gradient px-5 py-2 rounded-xl text-sm flex items-center gap-2 disabled:opacity-60 shadow-lg shadow-primary-500/20"
                  >
                    {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {editId ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Image Management Modal ===== */}
      <AnimatePresence>
        {showImageModal && imageBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="fixed inset-0 bg-black/60" onClick={() => setShowImageModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-surface-900">Quản lý ảnh</h3>
                  <p className="text-sm text-surface-600 mt-0.5">{imageBook.title}</p>
                </div>
                <button onClick={() => setShowImageModal(false)} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Upload section */}
              <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Upload className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-surface-900">Upload ảnh mới</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                    className="flex-1 text-sm text-surface-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-600 file:font-medium file:cursor-pointer hover:file:bg-primary-100"
                  />
                  <button
                    onClick={handleUploadImages}
                    disabled={uploading || uploadFiles.length === 0}
                    className="btn-gradient px-4 py-2 rounded-xl text-sm flex items-center gap-2 disabled:opacity-40"
                  >
                    {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload ({uploadFiles.length})
                  </button>
                </div>
              </div>

              {/* Image grid */}
              {imageBook.images && imageBook.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {imageBook.images.map((img) => (
                    <div
                      key={img.id}
                      className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                        img.isMain ? 'border-primary-500 shadow-md shadow-primary-500/10' : 'border-surface-200'
                      }`}
                    >
                      <div className="aspect-square">
                        <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      {img.isMain && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary-500 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                          <Star className="w-3 h-3" /> Bìa
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!img.isMain && (
                          <button
                            onClick={() => handleSetMain(img.id)}
                            className="px-3 py-1.5 bg-primary-500/80 text-white text-xs rounded-lg hover:bg-primary-500 transition-all"
                          >
                            Đặt bìa
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          className="px-3 py-1.5 bg-danger-500/80 text-white text-xs rounded-lg hover:bg-danger-500 transition-all"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-surface-400">
                  <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p>Chưa có ảnh nào</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
