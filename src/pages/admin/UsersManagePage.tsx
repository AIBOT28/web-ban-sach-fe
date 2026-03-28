import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';
import type { UserAdminView } from '../../lib/types';
import {
  User, Search, Trash2, Shield, UserCircle, 
  Mail, Phone, AlertCircle, CheckCircle, 
  Menu, MoreHorizontal, X, UserX
} from 'lucide-react';

export default function UsersManagePage() {
  const [users, setUsers] = useState<UserAdminView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<UserAdminView[]>('/api/Users');
      setUsers(res.data ?? []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteUser = async (userId: string) => {
    setDeleting(true);
    try {
      await api.delete(`/api/Users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showToast('Xóa người dùng thành công!', 'success');
      setShowConfirm(null);
    } catch (err: any) {
      showToast(err.message || 'Xóa người dùng thất bại', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold ${
              toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900">Quản lý người dùng</h1>
          <p className="text-sm text-surface-600 mt-1">Danh sách tất cả tài khoản của hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-surface-200 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
            <UserCircle className="w-5 h-5 text-primary-500" />
            <span className="text-sm font-bold text-surface-900">{users.length}</span>
            <span className="text-xs text-surface-500 font-medium">Người dùng</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên đăng nhập, email hoặc họ tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 bg-white text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-surface-100 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-surface-50 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 space-y-3">
            <AlertCircle className="w-12 h-12 mx-auto opacity-20" />
            <p className="font-medium">{error}</p>
            <button onClick={fetchUsers} className="text-sm font-bold text-primary-600 hover:underline">Thử lại</button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-20 text-center text-surface-400 space-y-3">
            <Search className="w-16 h-16 mx-auto opacity-10" />
            <p className="text-lg font-medium">Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-100">
                  <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider text-center">STT</th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Thông tin tài khoản</th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Liên hệ</th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Vai trò</th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {filteredUsers.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-surface-400 text-center font-medium">#{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center text-surface-500 font-bold border border-surface-200">
                          {u.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-surface-900">{u.fullName}</p>
                          <p className="text-xs text-surface-500 tracking-tight">@{u.userName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs flex items-center gap-1.5 text-surface-600">
                          <Mail className="w-3 h-3" /> {u.email}
                        </p>
                        {u.phoneNumber && (
                          <p className="text-xs flex items-center gap-1.5 text-surface-600">
                            <Phone className="w-3 h-3" /> {u.phoneNumber}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((role) => (
                          <span
                            key={role}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              role === 'Admin'
                                ? 'bg-primary-50 text-primary-700 border-primary-100'
                                : 'bg-surface-50 text-surface-600 border-surface-200'
                            }`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!u.roles.includes('Admin') && (
                        <button
                          onClick={() => setShowConfirm(u.id)}
                          className="p-2 rounded-lg text-danger-400 hover:bg-danger-50 hover:text-danger-600 transition-all group"
                          title="Xóa người dùng"
                        >
                          <UserX className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-surface-950/60 backdrop-blur-sm"
              onClick={() => !deleting && setShowConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-surface-100"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-surface-900 text-center mb-2">Xóa người dùng?</h3>
              <p className="text-surface-500 text-center mb-8 leading-relaxed">
                Hành động này <span className="text-red-600 font-bold">không thể hoàn tác</span>. Mọi thông tin liên quan đến tài khoản này (bao gồm cả lịch sử đơn hàng) sẽ bị xóa khỏi hệ thống.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(null)}
                  disabled={deleting}
                  className="flex-1 px-5 py-3 rounded-2xl border border-surface-200 text-sm font-bold text-surface-600 hover:bg-surface-50 transition-all disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={() => handleDeleteUser(showConfirm)}
                  disabled={deleting}
                  className="flex-1 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-bold shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Xác nhận xóa
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
