import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Award,
  Calendar,
  Image,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { removeToken } from "@/utils/token";

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "transactions", label: "Transactions", icon: ShoppingCart },
  { id: "products", label: "Products", icon: Package },
  { id: "points", label: "Points", icon: Award },
  { id: "events", label: "Events", icon: Calendar },
  { id: "images", label: "Banner", icon: Image },
];

const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    return () => {
      removeToken()
      window.location.href = "/login";
    };
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shrink-0">
          <Award className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-white font-bold text-lg leading-tight block">
              MemberHub
            </span>
            <span className="text-orange-300 text-xs">Admin Panel</span>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className={`px-3 mb-2 ${collapsed ? "text-center" : ""}`}>
          {!collapsed && (
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-2 mb-1">
              Menu
            </p>
          )}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 mx-1 rounded-xl transition-all duration-200 mb-0.5 group relative
                ${
                  isActive
                    ? "bg-linear-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }
                ${
                  collapsed
                    ? "justify-center w-12 mx-auto"
                    : "w-[calc(100%-8px)]"
                }
              `}
              title={collapsed ? item.label : ""}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-white"
                }`}
              />
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div
        className={`p-3 border-t border-white/10 ${
          collapsed ? "flex justify-center" : ""
        }`}
      >
        <button
          onClick={handleLogout()}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 group
            ${collapsed ? "justify-center w-12" : "w-full"}
          `}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white shadow-lg"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-linear-to-b from-slate-900 to-slate-800 z-50 transition-transform duration-300 shadow-2xl
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-linear-to-b from-slate-900 to-slate-800 transition-all duration-300 shadow-2xl z-30
          ${collapsed ? "w-20" : "w-64"}
        `}
      >
        <SidebarContent />
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-20 w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-orange-500 transition-all duration-200 shadow-lg border border-slate-600"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>

      {/* Spacer */}
      <div
        className={`hidden lg:block shrink-0 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      />
    </>
  );
};

export default Sidebar;
