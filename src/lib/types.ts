// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Paged result
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
}

// Book
export interface BookImage {
  id: number;
  imageUrl: string;
  isMain: boolean;
}

export interface Book {
  id: number;
  title: string;
  description?: string;
  price: number;
  discountRate: number;
  stockQuantity: number;
  categoryId: number;
  categoryName?: string;
  mainImageUrl?: string;
  images: BookImage[];
}

// Category
export interface Category {
  id: number;
  name: string;
}

// Auth
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  passwordHash: string; // confirm password field name from API
}

export interface Address {
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
}

export interface UserProfile {
  fullName: string;
  email?: string;
  username?: string;
  phoneNumber?: string;
  birth?: string;
  address?: Address;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// CartDTO (Backend response)
export interface CartItem {
  cartItemId: number;
  bookId: number;
  bookTitle: string;
  imageUrl?: string;
  unitPrice: number;
  discountRate: number;
  finalPrice: number;
  quantity: number;
  subTotal: number;
}

export interface Cart {
  items: CartItem[];
  totalPrice: number;
}

export interface AddToCartRequest {
  bookId: number;
  quantity: number;
}

// Order
export interface OrderItem {
  bookId: number;
  bookTitle: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  shippingAddress: Address | string;
  phoneNumber: string;
  orderItems: OrderItem[];
}

export interface CheckoutRequest {
  shippingAddress: Address | string;
  phoneNumber: string;
}

// JWT Token decoded payload
export interface TokenPayload {
  email: string;
  given_name: string; // username
  nameid: string; // userId
  role: string | string[]; // "Admin" or "User" or array
  exp: number;
  iss: string;
  aud: string;
}

// User info derived from token
export interface UserInfo {
  userId: string;
  username: string;
  email: string;
  roles: string[];
  isAdmin: boolean;
}

export interface UserAdminView {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  roles: string[];
}
