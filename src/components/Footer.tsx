import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Github, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative mt-20 pt-16 pb-8 overflow-hidden z-10 w-full bg-white border-t border-surface-200">
      {/* Decorative Orbs inside Footer */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-50 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent-50 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand & Intro */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-surface-900 tracking-tight">BookStore</span>
            </Link>
            <p className="text-surface-600 text-sm leading-relaxed max-w-xs">
              Nền tảng mua sắm sách trực tuyến hàng đầu, mang tri thức đến mọi nơi với hàng ngàn đầu sách chất lượng, trải nghiệm hiện đại và thân thiện.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-surface-50 border border-surface-200 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 flex items-center justify-center transition-all duration-300 text-surface-600">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-surface-50 border border-surface-200 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 flex items-center justify-center transition-all duration-300 text-surface-600">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-surface-50 border border-surface-200 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 flex items-center justify-center transition-all duration-300 text-surface-600">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-surface-50 border border-surface-200 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 flex items-center justify-center transition-all duration-300 text-surface-600">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-surface-900 font-bold mb-6 relative inline-block">
              Khám phá
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-gradient-to-r from-primary-500 to-transparent rounded-full" />
            </h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-sm text-surface-600 hover:text-primary-600 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-surface-300 group-hover:bg-primary-500 transition-colors" />
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-sm text-surface-600 hover:text-primary-600 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-surface-300 group-hover:bg-primary-500 transition-colors" />
                  Sách mới nhất
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-surface-600 hover:text-primary-600 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-surface-300 group-hover:bg-primary-500 transition-colors" />
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-surface-600 hover:text-primary-600 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-surface-300 group-hover:bg-primary-500 transition-colors" />
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-surface-900 font-bold mb-6 relative inline-block">
              Hỗ trợ khách hàng
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-gradient-to-r from-primary-500 to-transparent rounded-full" />
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-surface-600">
                <MapPin className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                <span>123 Đường Văn Thể, Quận 1, TP Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-surface-600">
                <Phone className="w-4 h-4 text-primary-500 shrink-0" />
                <span>+84 (0) 123 456 789</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-surface-600">
                <Mail className="w-4 h-4 text-primary-500 shrink-0" />
                <span>support@bookstore.vn</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-surface-900 font-bold mb-6 relative inline-block">
              Đăng ký nhận tin
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-gradient-to-r from-primary-500 to-transparent rounded-full" />
            </h3>
            <p className="text-sm text-surface-600 mb-4">
              Đừng bỏ lỡ các tựa sách mới và những khuyến mãi hấp dẫn từ chúng tôi.
            </p>
            <form className="relative group/form" onSubmit={(e) => e.preventDefault()}>
              <div className="absolute inset-0 bg-primary-100 rounded-xl blur-md opacity-0 group-hover/form:opacity-100 transition-opacity" />
              <div className="relative flex p-1 bg-white border border-surface-200 rounded-xl shadow-sm focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                <input 
                  type="email" 
                  placeholder="Nhập email của bạn..." 
                  className="bg-transparent border-none appearance-none outline-none w-full px-3 text-sm text-surface-900 placeholder-surface-400"
                />
                <button type="button" className="w-10 h-10 shrink-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white hover:scale-105 transition-transform shadow-md">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-surface-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-500">
            &copy; {new Date().getFullYear()} BookStore. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs text-surface-500 hover:text-primary-600 transition-colors">Chính sách bảo mật</Link>
            <Link to="/terms" className="text-xs text-surface-500 hover:text-primary-600 transition-colors">Điều khoản dịch vụ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
