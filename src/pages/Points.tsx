import React, { useEffect, useState } from "react";
import { Search, Award, TrendingUp, TrendingDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Point } from "@/types";
import { getPoints } from "@/api/point";

const Points: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [_, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchPoints = async () => {
    try {
      setLoading(true);
      const data = await getPoints();
      setPoints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setPoints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  const filtered = points.filter(
    (p) =>
      (p.user?.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.user?.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPoints = points.reduce((s, p) => s + (p.point_balance || 0), 0);

  const totalUsed = 0;
  const avgPoints = points.length ? Math.round(totalPoints / points.length) : 0;

  const chartData = points.map((p) => ({
    name: (p.user?.username || "").slice(0, 8),
    points: p.point_balance || 0,
    used: 0,
  }));

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Points Earned",
            value: totalPoints.toLocaleString(),
            icon: Award,
            color: "bg-gradient-to-br from-orange-500 to-orange-600",
          },
          {
            label: "Total Points Used",
            value: totalUsed.toLocaleString(),
            icon: TrendingDown,
            color: "bg-gradient-to-br from-purple-500 to-purple-600",
          },
          {
            label: "Active Balance",
            value: (totalPoints - totalUsed).toLocaleString(),
            icon: TrendingUp,
            color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
          },
          {
            label: "Average per User",
            value: avgPoints.toLocaleString(),
            icon: Award,
            color: "bg-gradient-to-br from-blue-500 to-blue-600",
          },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                <div
                  className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center`}
                >
                  <Icon className="w-4.5 h-4.5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-1">Points Distribution</h3>
        <p className="text-xs text-slate-400 mb-5">
          Total vs Used points per user
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 5, bottom: 0, left: -10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                fontSize: "12px",
              }}
            />
            <Bar
              dataKey="points"
              name="Total Points"
              fill="#f97316"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="used"
              name="Used Points"
              fill="#8b5cf6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Rank
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Username
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Total Points
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                  Used
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Balance
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((point, idx) => {
                const balance = point.point_balance - (point.used_points || 0);
                const progress = (balance / point.point_balance) * 100;
                const rankColors = [
                  "bg-yellow-400",
                  "bg-slate-400",
                  "bg-orange-600",
                ];
                return (
                  <tr
                    key={point.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          idx < 3
                            ? rankColors[idx]
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {idx + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-orange-500">
                          {point.user?.username}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            {point.username}
                          </p>
                          <p className="text-xs text-slate-400">
                            {point.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-orange-500">
                        {(point.used_points || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-purple-500 font-medium">
                        {(point.used_points || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-emerald-500">
                        {point.point_balance || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="w-32">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Balance</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-linear-to-r from-orange-400 to-orange-600 h-2 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No point records found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Points;
