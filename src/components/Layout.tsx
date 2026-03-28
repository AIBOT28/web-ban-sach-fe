import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/auth';
import { useCart } from '../lib/CartContext';
import Footer from './Footer';
import { api } from '../lib/api';
import type { Category } from '../lib/types';
import {
  BookOpen, Home, LogOut, User, Menu, X, Shield,
  LayoutDashboard, Library, Tag, ChevronDown, ShoppingCart, Package, Users, Search
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (!isAdminRoute) {
      api.get<Category[]>('/api/Categories').then(res => {
        if (res.data) setCategories(res.data);
      });
    }
  }, [isAdminRoute]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
    }
  };

  const isAdmin = user?.isAdmin;
  // removed redundant declaration later

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Admin sidebar links
  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/admin/books', icon: Library, label: 'Quản lý Sách' },
    { to: '/admin/categories', icon: Tag, label: 'Quản lý Danh mục' },
    { to: '/admin/orders', icon: Package, label: 'Quản lý Đơn hàng' },
    { to: '/admin/users', icon: Users, label: 'Quản lý Tài khoản' },
  ];

  const isActiveLink = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  // ========== ADMIN LAYOUT ==========
  if (isAdmin && isAdminRoute) {
    return (
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 glass border-r border-surface-200 fixed inset-y-0 left-0 z-30">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 h-16 border-b border-surface-100">
            <BookOpen className="w-7 h-7 text-primary-600" />
            <span className="text-lg font-bold gradient-text">BookStore</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 font-bold border border-primary-100 shadow-sm">Admin</span>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const active = isActiveLink(link.to, link.exact);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100/50'
                      : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="px-3 py-4 border-t border-surface-100">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-surface-600 hover:bg-surface-100 hover:text-surface-900 transition-all font-medium"
            >
              <Home className="w-5 h-5" />
              Về Trang chủ
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-danger-500/80 hover:bg-danger-500/10 hover:text-danger-500 transition-all w-full"
            >
              <LogOut className="w-5 h-5" />
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <aside className="fixed inset-y-0 left-0 w-72 glass z-50 flex flex-col shadow-2xl animate-fade-in-up">
              <div className="flex items-center justify-between px-6 h-16 border-b border-surface-100">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-7 h-7 text-primary-600" />
                  <span className="text-lg font-bold gradient-text">BookStore</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-surface-400 hover:text-surface-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActiveLink(link.to, link.exact);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-primary-50 text-primary-700 shadow-sm'
                          : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="px-3 py-4 border-t border-surface-100">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-surface-600 hover:bg-surface-100 font-medium">
                  <Home className="w-5 h-5" /> Về Trang chủ
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-danger-500 hover:bg-danger-50 w-full font-medium">
                  <LogOut className="w-5 h-5" /> Đăng xuất
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 lg:ml-64">
          {/* Top bar */}
          <header className="sticky top-0 z-20 glass h-16 flex items-center px-6 border-b border-surface-100">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden mr-4 text-surface-500 hover:text-surface-900">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold shadow-sm shadow-primary-500/30">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-surface-700 hidden sm:block">{user?.username}</span>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  // ========== PUBLIC / USER LAYOUT ==========
  return (
    <div className="min-h-screen bg-surface-50 bg-gradient-orbs flex flex-col pt-4">
      {/* Navbar - Floating Glass */}
      <header className="sticky top-4 z-50 transition-all duration-300 mx-4 sm:mx-6 lg:mx-auto max-w-7xl">
        <div className="glass rounded-2xl flex items-center px-4 sm:px-6 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 mr-8 group">
            <div className="p-1.5 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
              <BookOpen className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-xl font-bold text-surface-900 tracking-tight group-hover:text-primary-600 transition-colors">BookStore</span>
          </Link>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                location.pathname === '/'
                  ? 'bg-primary-50 text-primary-600 shadow-sm'
                  : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
              }`}
            >
              Trang chủ
            </Link>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCatMenuOpen(!catMenuOpen)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  catMenuOpen ? 'bg-surface-100 text-primary-600' : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                }`}
              >
                <Tag className="w-4 h-4" /> Danh mục <ChevronDown className={`w-3.5 h-3.5 transition-transform ${catMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {catMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setCatMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 mt-2 w-56 glass rounded-2xl py-2 z-50 shadow-xl border border-surface-200"
                    >
                      <Link
                        to="/books"
                        onClick={() => setCatMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-surface-600 hover:bg-surface-50 hover:text-primary-600 font-medium transition-all"
                      >
                        Tất cả sách
                      </Link>
                      {categories.map(cat => (
                        <Link
                          key={cat.id}
                          to={`/books?categoryId=${cat.id}`}
                          onClick={() => setCatMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-surface-600 hover:bg-surface-50 hover:text-primary-600 font-medium transition-all"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Header Search Bar */}
            <form onSubmit={handleSearch} className="relative ml-4 flex-1 max-w-md hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Tìm tựa sách, tác giả..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-50 border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </form>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Shopping Cart Icon */}
            {user && (
              <Link
                to="/cart"
                className="relative p-2 rounded-xl text-surface-600 hover:bg-surface-100 hover:text-primary-600 transition-all group"
                title="Giỏ hàng"
              >
                <ShoppingCart className="w-6 h-6" />
                {useCart().cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse-glow">
                    {useCart().cartCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-surface-100 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold shadow-sm shadow-primary-500/30">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-surface-700 hidden sm:block">{user.username}</span>
                  <ChevronDown className="w-4 h-4 text-surface-400" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 glass rounded-2xl py-2 z-50 shadow-xl border border-surface-200 animate-fade-in-up">
                      <div className="px-5 py-3 border-b border-surface-100 mb-2">
                        <p className="text-sm font-bold text-surface-900">{user.username}</p>
                        <p className="text-xs text-surface-500 mb-2">{user.email}</p>
                        {user.isAdmin && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        )}
                      </div>
                      {user.isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-50 hover:text-primary-600 transition-all"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Quản trị
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-50 hover:text-primary-600 transition-all"
                      >
                        <User className="w-4 h-4" /> Hồ sơ cá nhân
                      </Link>
                      <Link
                        to="/my-orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-50 hover:text-primary-600 transition-all"
                      >
                        <Package className="w-4 h-4" /> Đơn hàng của tôi
                      </Link>
                      <hr className="border-surface-100 my-2" />
                      <button
                        onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                        className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-danger-500 hover:bg-danger-50 transition-all w-full text-left"
                      >
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-900 rounded-xl hover:bg-surface-100 transition-all"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="btn-gradient px-5 py-2.5 text-sm font-medium rounded-xl shadow-md"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-surface-600 p-2 hover:bg-surface-100 rounded-lg transition-colors">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass border border-surface-200 mt-2 rounded-2xl py-3 px-4 shadow-xl animate-fade-in-up">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-surface-700 hover:bg-surface-100">
              Trang chủ
            </Link>
            {!user && (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-surface-700 hover:bg-surface-100 mt-1">
                  Đăng nhập
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-primary-600 bg-primary-50 mt-1">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="relative z-10 flex-1 mt-4">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}
