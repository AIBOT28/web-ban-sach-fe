import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { UserProfile, ChangePasswordRequest } from '../lib/types';
import { User, Lock, Save, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({ 
    fullName: '', email: '', username: '', phoneNumber: '', birth: '', 
    address: { province: '', district: '', ward: '', detailAddress: '' } 
  });
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({ currentPassword: '', newPassword: '' });
  const [confirmNew, setConfirmNew] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [msg, setMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [error, setError] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    api.get<UserProfile>('/api/Auth/profile')
      .then((res) => {
        if (res.data) setProfile(res.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setError('');
    try {
      await api.put('/api/Auth/profile', { 
        fullName: profile.fullName, 
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        birth: profile.birth,
        address: profile.address
      });
      setMsg('Cập nhật thông tin thành công!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg('');
    setPwError('');

    if (passwordForm.newPassword !== confirmNew) {
      setPwError('Mật khẩu mới không khớp');
      return;
    }

    setChangingPw(true);
    try {
      await api.put('/api/Auth/change-password', passwordForm);
      setPwMsg('Đổi mật khẩu thành công!');
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setConfirmNew('');
      setTimeout(() => setPwMsg(''), 3000);
    } catch (err: any) {
      setPwError(err.message);
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="glass rounded-2xl p-6 animate-pulse space-y-6">
          <div className="h-8 bg-surface-200 rounded w-1/3" />
          <div className="space-y-4">
            <div className="h-12 bg-surface-100 rounded" />
            <div className="h-12 bg-surface-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 sm:p-8 text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 mb-4">
          <span className="text-3xl font-bold text-white">{user?.username?.charAt(0).toUpperCase()}</span>
        </div>
        <h1 className="text-xl font-bold text-surface-900">{user?.username}</h1>
        <p className="text-sm text-surface-600">{user?.email}</p>
        <div className="mt-2 inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-primary-50 text-primary-700 font-medium">
          {user?.isAdmin ? 'Quản trị viên' : 'Thành viên'}
        </div>
      </motion.div>

      {/* Edit Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 sm:p-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-surface-900">Thông tin cá nhân</h2>
        </div>

        {msg && (
          <div className="mb-4 p-3 rounded-xl bg-success-50 border border-success-200 text-success-600 text-sm flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4" /> {msg}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-danger-50 border border-danger-100 text-danger-600 text-sm font-medium">{error}</div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-surface-900 mb-1.5">Tên đăng nhập</label>
            <input
              type="text"
              className="input-field opacity-60 cursor-not-allowed bg-surface-50"
              value={profile.username || ''}
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-900 mb-1.5">Họ tên</label>
            <input
              id="profile-fullname"
              type="text"
              className="input-field"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-900 mb-1.5">Email</label>
            <input
              id="profile-email"
              type="email"
              className="input-field"
              value={profile.email || ''}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-surface-900 mb-1.5">Số điện thoại</label>
              <input
                id="profile-phone"
                type="tel"
                className="input-field"
                value={profile.phoneNumber || ''}
                onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-900 mb-1.5">Ngày sinh</label>
              <input
                id="profile-birth"
                type="date"
                className="input-field"
                value={profile.birth ? profile.birth.split('T')[0] : ''}
                onChange={(e) => setProfile({ ...profile, birth: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-900 mb-1.5">Địa chỉ</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <input
                placeholder="Tỉnh / Thành phố"
                className="input-field"
                value={profile.address?.province || ''}
                onChange={(e) => setProfile({ ...profile, address: { ...(profile.address || { province: '', district: '', ward: '', detailAddress: '' }), province: e.target.value } })}
              />
              <input
                placeholder="Quận / Huyện"
                className="input-field"
                value={profile.address?.district || ''}
                onChange={(e) => setProfile({ ...profile, address: { ...(profile.address || { province: '', district: '', ward: '', detailAddress: '' }), district: e.target.value } })}
              />
              <input
                placeholder="Phường / Xã"
                className="input-field"
                value={profile.address?.ward || ''}
                onChange={(e) => setProfile({ ...profile, address: { ...(profile.address || { province: '', district: '', ward: '', detailAddress: '' }), ward: e.target.value } })}
              />
            </div>
            <input
              placeholder="Số nhà, tên đường..."
              className="input-field"
              value={profile.address?.detailAddress || ''}
              onChange={(e) => setProfile({ ...profile, address: { ...(profile.address || { province: '', district: '', ward: '', detailAddress: '' }), detailAddress: e.target.value } })}
            />
          </div>
          <button
            id="profile-save"
            type="submit"
            disabled={saving}
            className="btn-gradient px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu thay đổi
          </button>
        </form>
      </motion.div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6 sm:p-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-surface-900">Đổi mật khẩu</h2>
        </div>

        {pwMsg && (
          <div className="mb-4 p-3 rounded-xl bg-success-50 border border-success-200 text-success-600 text-sm flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4" /> {pwMsg}
          </div>
        )}
        {pwError && (
          <div className="mb-4 p-3 rounded-xl bg-danger-50 border border-danger-100 text-danger-600 text-sm font-medium">{pwError}</div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-surface-900 mb-1.5">Mật khẩu hiện tại</label>
            <input
              id="profile-current-password"
              type="password"
              className="input-field"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-900 mb-1.5">Mật khẩu mới</label>
            <input
              id="profile-new-password"
              type="password"
              className="input-field"
              placeholder="Tối thiểu 6 ký tự"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-900 mb-1.5">Xác nhận mật khẩu mới</label>
            <input
              id="profile-confirm-new-password"
              type="password"
              className="input-field"
              value={confirmNew}
              onChange={(e) => setConfirmNew(e.target.value)}
              required
            />
          </div>
          <button
            id="profile-change-password"
            type="submit"
            disabled={changingPw}
            className="btn-gradient px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-60"
          >
            {changingPw ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
            Đổi mật khẩu
          </button>
        </form>
      </motion.div>
    </div>
  );
}
