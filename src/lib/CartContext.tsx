import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from './api';
import { useAuth } from './auth';
import type { Cart, CartItem, ApiResponse } from './types';

interface CartContextType {
  cart: Cart | null;
  cartCount: number;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (bookId: number, quantity: number) => Promise<string>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get<Cart>('/api/Carts');
      if (res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi lấy giỏ hàng:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (bookId: number, quantity: number): Promise<string> => {
    if (!user) throw new Error('Vui lòng đăng nhập để thêm vào giỏ hàng');
    try {
      const res = await api.post<string>('/api/Carts/items', { bookId, quantity });
      await fetchCart();
      return res.message || 'Đã thêm vào giỏ hàng';
    } catch (err: any) {
      throw new Error(err.message || 'Không thể thêm vào giỏ hàng');
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      await api.put(`/api/Carts/items/${cartItemId}`, quantity);
      await fetchCart();
    } catch (err: any) {
      throw new Error(err.message || 'Không thể cập nhật số lượng');
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      await api.delete(`/api/Carts/items/${cartItemId}`);
      await fetchCart();
    } catch (err: any) {
      throw new Error(err.message || 'Không thể xóa sản phẩm');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/api/Carts');
      setCart(null);
    } catch (err: any) {
      throw new Error(err.message || 'Không thể làm trống giỏ hàng');
    }
  };

  const cartCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ 
      cart, 
      cartCount, 
      loading, 
      fetchCart, 
      addToCart, 
      updateQuantity, 
      removeItem, 
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
