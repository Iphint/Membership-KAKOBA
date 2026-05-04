export interface User {
  id: number;
  username: string;
  email: string;
  no_telp: string;
  roles: string[];
  profile_picture?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: number;
  name_product_transaction: string;
  price_product_transaction: number;
  quantity_product_transaction: number;
  point_transaction: number;
  user_id?: number;
  username?: string;
  created_at?: string;
  type?: 'purchase' | 'redeem' | string;

  user?: User;
  items?: TransactionItem[];
}

export interface TransactionItem {
  id: number;
  transaction_id: number;
  name_product_transaction: string;
  price_product_transaction: number;
  quantity_product_transaction: number;
}

export interface ImagePromo {
  id?: number;
  image_url: string;
}

export interface Product {
  id: number;
  product_name: string;
  price_normal: number;
  discount: number;
  product_category: string;
  start_date: string;
  end_date: string;
  stock: number;
  point: number;
  is_available: boolean;
  is_featured: boolean;
  product_description: string;
  images?: string[];

  ImagePromo?: ImagePromo[];
}

export interface Point {
  id: number;
  user_id: number;
  username?: string;
  email?: string;
  used_points?: number;
  point_balance: number;

  user?: User;
}

export interface ImageEvent {
  id: number;
  event_id: number;
  image_url: string;
}

export interface Event {
  id: number;
  event_name: string;
  event_date: string;
  location: string;
  description: string;
  images?: string[];

  ImageEvent?: ImageEvent[];
}

export interface ImageView {
  id: number;
  title: string;
  sub_title: string;
  image?: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  user: User | null;
}
