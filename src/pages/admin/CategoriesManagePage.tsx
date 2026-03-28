import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';
import type { Category } from '../../lib/types';
import { Plus, Pencil, Trash2, X, Tag, CheckCircle, AlertTriangle } from 'lucide-react';

export default function CategoriesManagePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCategories = () => {
    setLoading(true);
    api.get<Category[]>('/api/Categories')
      .then((res) => { if (res.data) setCategories(res.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setFormName('');
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditItem(cat);
    setFormName(cat.name);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await api.put('/api/Categories', { id: editItem.id, name: formName });
        showToast('success', 'Cập nhật danh mục thành công!');
      } else {
        await api.post('/api/Categories', { id: 0, name: formName });
        showToast('success', 'Thêm danh mục thành công!');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/Categories/${id}`);
      showToast('success', 'Xóa danh mục thành công!');
      setDeleteConfirm(null);
      fetchCategories();
    } catch (err: any) {
      showToast('error', err.message);
    }
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Quản lý Danh mục</h1>
          <p className="text-sm text-surface-600 mt-1">Thêm, sửa, xóa danh mục sách</p>
        </div>
        <button
          id="add-category-btn"
          onClick={openCreate}
          className="btn-gradient px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Thêm danh mục
        </button>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50/50">
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">ID</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Tên danh mục</th>
                <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-surface-100">
                    <td className="px-6 py-4"><div className="h-4 bg-surface-100 rounded w-8 animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-surface-100 rounded w-32 animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-surface-100 rounded w-20 ml-auto animate-pulse" /></td>
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-surface-400">
                    <Tag className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p>Chưa có danh mục nào</p>
                  </td>
                </tr>
              ) : (
                categories.map((cat, index) => (
                  <motion.tr
                    key={cat.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-surface-100 hover:bg-surface-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-surface-500">{cat.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary-600" />
                        <span className="text-sm font-medium text-surface-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(cat)}
                          className="p-2 rounded-lg hover:bg-primary-50 text-surface-400 hover:text-primary-600 transition-all"
                          title="Sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {deleteConfirm === cat.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(cat.id)} className="px-2 py-1 text-xs bg-danger-50 text-danger-600 rounded-lg hover:bg-danger-100 border border-danger-200">Xóa</button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-xs bg-surface-100 text-surface-600 rounded-lg hover:bg-surface-200">Hủy</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(cat.id)}
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

      {/* Modal */}
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
              className="glass rounded-2xl p-6 w-full max-w-md relative z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-surface-900">
                  {editItem ? 'Sửa danh mục' : 'Thêm danh mục mới'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">Tên danh mục</label>
                  <input
                    id="category-name-input"
                    type="text"
                    className="input-field"
                    placeholder="Nhập tên danh mục"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm rounded-xl text-surface-900 hover:bg-surface-100 transition-all font-bold">
                    Hủy
                  </button>
                  <button
                    id="category-save-btn"
                    type="submit"
                    disabled={saving}
                    className="btn-gradient px-5 py-2 rounded-xl text-sm flex items-center gap-2 disabled:opacity-60 shadow-lg shadow-primary-500/20"
                  >
                    {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {editItem ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
