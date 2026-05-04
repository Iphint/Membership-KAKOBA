import { User, Transaction, Product, Point, Event, ImageView } from '../types';

export const mockUsers: User[] = [
  { id: 1, username: 'AdminSuper', email: 'admin@gmail.com', no_telp: '081234567890', roles: 'ADMIN', created_at: '2025-01-10' },
  { id: 2, username: 'JohnDoe', email: 'john@gmail.com', no_telp: '082345678901', roles: 'USER', created_at: '2025-02-15' },
  { id: 3, username: 'JaneSmith', email: 'jane@gmail.com', no_telp: '083456789012', roles: 'USER', created_at: '2025-02-20' },
  { id: 4, username: 'BudiSantoso', email: 'budi@gmail.com', no_telp: '084567890123', roles: 'USER', created_at: '2025-03-01' },
  { id: 5, username: 'SitiRahayu', email: 'siti@gmail.com', no_telp: '085678901234', roles: 'USER', created_at: '2025-03-05' },
  { id: 6, username: 'AndiPratama', email: 'andi@gmail.com', no_telp: '086789012345', roles: 'USER', created_at: '2025-03-10' },
  { id: 7, username: 'DewiAnggraini', email: 'dewi@gmail.com', no_telp: '087890123456', roles: 'USER', created_at: '2025-03-15' },
];

export const mockTransactions: Transaction[] = [
  { id: 1, name_product_transaction: 'Organic Coffee Beans', price_product_transaction: 80000, quantity_product_transaction: 2, point_transaction: 160, user_id: 2, username: 'JohnDoe', created_at: '2025-03-01', type: 'purchase' },
  { id: 2, name_product_transaction: 'Eco-Friendly Water Bottle', price_product_transaction: 70000, quantity_product_transaction: 1, point_transaction: 70, user_id: 3, username: 'JaneSmith', created_at: '2025-03-03', type: 'purchase' },
  { id: 3, name_product_transaction: 'Premium Tea Set', price_product_transaction: 150000, quantity_product_transaction: 1, point_transaction: 150, user_id: 4, username: 'BudiSantoso', created_at: '2025-03-05', type: 'purchase' },
  { id: 4, name_product_transaction: 'Redeem Voucher 50K', price_product_transaction: 50000, quantity_product_transaction: 1, point_transaction: -300, user_id: 2, username: 'JohnDoe', created_at: '2025-03-08', type: 'redeem' },
  { id: 5, name_product_transaction: 'Natural Soap Bundle', price_product_transaction: 45000, quantity_product_transaction: 3, point_transaction: 135, user_id: 5, username: 'SitiRahayu', created_at: '2025-03-10', type: 'purchase' },
  { id: 6, name_product_transaction: 'Bamboo Cutlery Set', price_product_transaction: 35000, quantity_product_transaction: 2, point_transaction: 70, user_id: 6, username: 'AndiPratama', created_at: '2025-03-12', type: 'purchase' },
  { id: 7, name_product_transaction: 'Redeem Gift Card', price_product_transaction: 100000, quantity_product_transaction: 1, point_transaction: -500, user_id: 3, username: 'JaneSmith', created_at: '2025-03-14', type: 'redeem' },
  { id: 8, name_product_transaction: 'Organic Honey Jar', price_product_transaction: 65000, quantity_product_transaction: 1, point_transaction: 65, user_id: 7, username: 'DewiAnggraini', created_at: '2025-03-16', type: 'purchase' },
];

export const mockProducts: Product[] = [
  { id: 1, product_name: 'Organic Coffee Beans', price_normal: 80000, discount: 20, product_category: 'Food', start_date: '2025-03-01', end_date: '2025-04-30', stock: 50, is_available: true, is_featured: true, product_description: 'Premium fair-trade coffee beans, 250g bag.' },
  { id: 2, product_name: 'Eco-Friendly Water Bottle', price_normal: 70000, discount: 30, product_category: 'Lifestyle', start_date: '2025-03-01', end_date: '2025-03-31', stock: 40, is_available: true, is_featured: true, product_description: 'Reusable stainless steel water bottle.' },
  { id: 3, product_name: 'Premium Tea Set', price_normal: 150000, discount: 15, product_category: 'Food', start_date: '2025-03-15', end_date: '2025-05-15', stock: 25, is_available: true, is_featured: false, product_description: 'Artisan tea collection with 6 varieties.' },
  { id: 4, product_name: 'Natural Soap Bundle', price_normal: 45000, discount: 10, product_category: 'Beauty', start_date: '2025-02-15', end_date: '2025-04-15', stock: 100, is_available: true, is_featured: false, product_description: 'Handcrafted natural soap with essential oils.' },
  { id: 5, product_name: 'Bamboo Cutlery Set', price_normal: 35000, discount: 25, product_category: 'Lifestyle', start_date: '2025-03-10', end_date: '2025-04-10', stock: 0, is_available: false, is_featured: false, product_description: 'Sustainable bamboo cutlery for eco living.' },
  { id: 6, product_name: 'Organic Honey Jar', price_normal: 65000, discount: 5, product_category: 'Food', start_date: '2025-03-20', end_date: '2025-05-20', stock: 30, is_available: true, is_featured: true, product_description: 'Pure forest honey, 500g.' },
];

export const mockPoints: Point[] = [
  { id: 1, user_id: 2, username: 'JohnDoe', email: 'john@gmail.com', total_points: 2350, used_points: 300 },
  { id: 2, user_id: 3, username: 'JaneSmith', email: 'jane@gmail.com', total_points: 1800, used_points: 500 },
  { id: 3, user_id: 4, username: 'BudiSantoso', email: 'budi@gmail.com', total_points: 950, used_points: 0 },
  { id: 4, user_id: 5, username: 'SitiRahayu', email: 'siti@gmail.com', total_points: 1350, used_points: 200 },
  { id: 5, user_id: 6, username: 'AndiPratama', email: 'andi@gmail.com', total_points: 720, used_points: 0 },
  { id: 6, user_id: 7, username: 'DewiAnggraini', email: 'dewi@gmail.com', total_points: 540, used_points: 100 },
];

export const mockEvents: Event[] = [
  { id: 1, event_name: 'Tech Expo 2025', event_date: '2025-07-10T10:00:00.000Z', location: 'Jakarta Convention Center', description: 'Annual technology exposition featuring the latest innovations in digital transformation, AI, and smart solutions.' },
  { id: 2, event_name: 'Green Living Festival', event_date: '2025-08-05T09:00:00.000Z', location: 'Senayan City Park, Jakarta', description: 'A festival dedicated to sustainable living, eco-friendly products, and environmental awareness.' },
  { id: 3, event_name: 'Membership Gala Night', event_date: '2025-09-20T18:00:00.000Z', location: 'Grand Hyatt Jakarta', description: 'Exclusive gala night for premium members with special rewards, entertainment and networking.' },
  { id: 4, event_name: 'Health & Wellness Expo', event_date: '2025-10-15T08:00:00.000Z', location: 'Bali Nusa Dua Convention Center', description: 'Comprehensive wellness expo featuring fitness, nutrition, mental health and holistic lifestyle.' },
];

export const mockImageViews: ImageView[] = [
  { id: 1, title: 'Redeem Point', sub_title: 'Point bisa di tukar dengan produk eksklusif', image: undefined },
  { id: 2, title: 'Exclusive Membership', sub_title: 'Dapatkan keuntungan lebih sebagai member premium', image: undefined },
  { id: 3, title: 'Earn Points Every Purchase', sub_title: 'Setiap pembelian mendapatkan poin reward', image: undefined },
];

export const chartTransactionData = [
  { month: 'Jan', purchase: 4200000, redeem: 800000 },
  { month: 'Feb', purchase: 5800000, redeem: 1200000 },
  { month: 'Mar', purchase: 3900000, redeem: 950000 },
  { month: 'Apr', purchase: 7100000, redeem: 1500000 },
  { month: 'Mei', purchase: 6400000, redeem: 1800000 },
  { month: 'Jun', purchase: 8200000, redeem: 2100000 },
];

export const chartUserGrowth = [
  { month: 'Jan', users: 45 },
  { month: 'Feb', users: 78 },
  { month: 'Mar', users: 105 },
  { month: 'Apr', users: 142 },
  { month: 'Mei', users: 189 },
  { month: 'Jun', users: 234 },
];

export const chartPointsData = [
  { name: 'JohnDoe', points: 2350 },
  { name: 'JaneSmith', points: 1800 },
  { name: 'SitiRahayu', points: 1350 },
  { name: 'BudiSantoso', points: 950 },
  { name: 'AndiPratama', points: 720 },
  { name: 'DewiAnggraini', points: 540 },
];

export const chartCategoryData = [
  { name: 'Food', value: 3 },
  { name: 'Lifestyle', value: 2 },
  { name: 'Beauty', value: 1 },
];
