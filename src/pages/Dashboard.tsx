import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Users, ShoppingCart, Award, TrendingUp, Package, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { mockUsers, mockTransactions, mockPoints, mockEvents, mockProducts, chartTransactionData, chartUserGrowth, chartPointsData, chartCategoryData } from '../data/mockData';

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa'];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }: any) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl lg:text-3xl font-bold text-slate-800 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    {trend !== undefined && (
      <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
        {trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
        {Math.abs(trend)}% from last month
      </div>
    )}
  </div>
);

const Dashboard: React.FC = () => {
  const totalRevenue = mockTransactions
    .filter(t => t.type === 'purchase')
    .reduce((sum, t) => sum + t.price_product_transaction * t.quantity_product_transaction, 0);

  const totalPoints = mockPoints.reduce((sum, p) => sum + p.total_points, 0);
  const activeProducts = mockProducts.filter(p => p.is_available).length;
  const recentTransactions = mockTransactions.slice(-5).reverse();
  const upcomingEvents = mockEvents.slice(0, 3);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={mockUsers.length}
          subtitle="Registered members"
          icon={Users}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          trend={12}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue).replace('Rp', 'Rp ')}
          subtitle="All transactions"
          icon={TrendingUp}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          trend={8}
        />
        <StatCard
          title="Active Products"
          value={activeProducts}
          subtitle={`${mockProducts.length} total products`}
          icon={Package}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          trend={5}
        />
        <StatCard
          title="Total Points"
          value={totalPoints.toLocaleString()}
          subtitle="Across all members"
          icon={Award}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          trend={15}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Transaction Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-800">Transaction Overview</h3>
              <p className="text-xs text-slate-400 mt-0.5">Purchase vs Redeem (6 months)</p>
            </div>
            <span className="text-xs bg-orange-50 text-orange-500 px-3 py-1 rounded-full font-medium">2025</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartTransactionData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="colorPurchase" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRedeem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000000}M`} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="purchase" name="Purchase" stroke="#f97316" strokeWidth={2.5} fill="url(#colorPurchase)" dot={false} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="redeem" name="Redeem" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#colorRedeem)" dot={false} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="mb-5">
            <h3 className="font-bold text-slate-800">Product Categories</h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribution by category</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={chartCategoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                {chartCategoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {chartCategoryData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-slate-600">{item.name}</span>
                </div>
                <span className="text-xs font-semibold text-slate-800">{item.value} items</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* User Growth */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="mb-5">
            <h3 className="font-bold text-slate-800">User Growth</h3>
            <p className="text-xs text-slate-400 mt-0.5">New registrations per month</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartUserGrowth} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Bar dataKey="users" name="New Users" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Points */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800">Top Point Earners</h3>
            <p className="text-xs text-slate-400 mt-0.5">Highest point holders</p>
          </div>
          <div className="space-y-3">
            {chartPointsData.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-slate-700 truncate">{item.name}</span>
                    <span className="text-xs font-bold text-orange-500 ml-2">{item.points.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${(item.points / 2350) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800">Recent Transactions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Latest activity</p>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === 'redeem' ? 'bg-purple-100' : 'bg-orange-100'}`}>
                  {tx.type === 'redeem' ? (
                    <Award className="w-4 h-4 text-purple-500" />
                  ) : (
                    <ShoppingCart className="w-4 h-4 text-orange-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{tx.name_product_transaction}</p>
                  <p className="text-xs text-slate-400">{tx.username}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-xs font-bold ${tx.type === 'redeem' ? 'text-purple-500' : 'text-emerald-500'}`}>
                    {tx.type === 'redeem' ? '-' : '+'}{Math.abs(tx.point_transaction)} pts
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Upcoming Events</h3>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{event.event_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{event.location}</p>
                  <p className="text-xs text-orange-500 font-medium mt-1">
                    {new Date(event.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-white mb-4">Platform Overview</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Transactions', value: mockTransactions.length, icon: ShoppingCart, color: 'bg-orange-500' },
              { label: 'Purchase Orders', value: mockTransactions.filter(t => t.type === 'purchase').length, icon: TrendingUp, color: 'bg-emerald-500' },
              { label: 'Redeems', value: mockTransactions.filter(t => t.type === 'redeem').length, icon: Award, color: 'bg-purple-500' },
              { label: 'Active Events', value: mockEvents.length, icon: Calendar, color: 'bg-blue-500' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white/10 rounded-xl p-3">
                  <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center mb-2`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
