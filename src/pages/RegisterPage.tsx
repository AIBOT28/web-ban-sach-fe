import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../lib/auth';
import { BookOpen, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        fullName: form.fullName,
        password: form.password,
        passwordHash: form.confirmPassword,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-orbs p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-4 shadow-md shadow-primary-500/20">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900">Tạo tài khoản</h1>
            <p className="text-sm text-surface-600 mt-1">Gia nhập BookStore ngay hôm nay</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-danger-50 border border-danger-100 text-danger-600 text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-surface-900 mb-1.5">Họ tên</label>
              <input
                id="register-fullname"
                type="text"
                className="input-field"
                placeholder="Nhập họ và tên"
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-900 mb-1.5">Tên đăng nhập</label>
              <input
                id="register-username"
                type="text"
                className="input-field"
                placeholder="Nhập tên đăng nhập"
                value={form.username}
                onChange={(e) => updateField('username', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-900 mb-1.5">Email</label>
              <input
                id="register-email"
                type="email"
                className="input-field"
                placeholder="example@email.com"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-900 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-11"
                  placeholder="Tối thiểu 6 ký tự"
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-900 mb-1.5">Xác nhận mật khẩu</label>
              <input
                id="register-confirm-password"
                type="password"
                className="input-field"
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                required
              />
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn-gradient w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Đăng ký'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-surface-500 mt-6">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Đăng nhập
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
