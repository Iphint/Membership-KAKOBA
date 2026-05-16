import React, { useState } from "react";
import { ChevronDown, User, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { User as UserType } from "../types";
import { removeToken } from "@/utils/token";

interface TopbarProps {
  currentUser: UserType | null;
  activePage: string;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Welcome back! Here's what's happening.",
  },
  users: { title: "User Management", subtitle: "Manage all registered users." },
  transactions: {
    title: "Transactions",
    subtitle: "View and manage all transactions.",
  },
  products: {
    title: "Products",
    subtitle: "Manage promo products and featured items.",
  },
  points: { title: "Points", subtitle: "Track and manage user reward points." },
  events: { title: "Events", subtitle: "Create and manage membership events." },
  notifications: {
    title: "Notifications",
    subtitle: "Manage push notification tokens.",
  },
  images: {
    title: "Image Views",
    subtitle: "Manage banner images and promotions.",
  },
};

const Topbar: React.FC<TopbarProps> = ({
  currentUser,
  activePage
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const pageInfo = pageTitles[activePage] || pageTitles.dashboard;

  const handleLogout = () => {
    removeToken();
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-4 lg:px-6 py-4 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div className="ml-10 lg:ml-0">
          <h1 className="text-lg lg:text-xl font-bold text-slate-800">
            {pageInfo.title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {pageInfo.subtitle}
          </p>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 hover:bg-orange-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-700 leading-tight">
                  {currentUser?.username || "Admin"}
                </p>
                <p className="text-xs text-slate-400">
                  {currentUser?.roles || "ADMIN"}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-700">
                    {currentUser?.username}
                  </p>
                  <p className="text-xs text-slate-400">{currentUser?.email}</p>
                </div>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
