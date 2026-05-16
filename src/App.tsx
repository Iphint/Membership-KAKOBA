import React, { useMemo, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { User } from "./types";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Transactions from "./pages/Transactions";
import Products from "./pages/Products";
import Points from "./pages/Points";
import Events from "./pages/Events";
import ImageViews from "./pages/ImageViews";
import Register from "./pages/Register";
import { isAuthenticated, setToken } from "./utils/token";

type Page =
  | "dashboard"
  | "users"
  | "transactions"
  | "products"
  | "points"
  | "events"
  | "images";

const routePages: Record<string, Page> = {
  "/dashboard": "dashboard",
  "/users": "users",
  "/transactions": "transactions",
  "/products": "products",
  "/points": "points",
  "/events": "events",
  "/images": "images",
};

const getActivePage = (pathname: string): Page => {
  return routePages[pathname] ?? "dashboard";
};

interface AuthenticatedLayoutProps {
  currentUser: User | null;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  currentUser,
}) => {
  const location = useLocation();
  const activePage = useMemo(
    () => getActivePage(location.pathname),
    [location.pathname]
  );

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activePage={activePage} />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Topbar currentUser={currentUser} activePage={activePage} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

interface LoginRouteProps {
  onLogin: (user: User, token: string) => void;
}

const LoginRoute: React.FC<LoginRouteProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = (user: User, token: string) => {
    onLogin(user, token);
    const from = location.state?.from?.pathname || "/dashboard";
    navigate(from, { replace: true });
  };

  return <Login onLogin={handleLogin} />;
};

const AppRoutes: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User, token: string) => {
    setToken(token);
    setCurrentUser(user);
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginRoute onLogin={handleLogin} />} />
      <Route path="/register" element={<Register />} />
      <Route element={<AuthenticatedLayout currentUser={currentUser} />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/products" element={<Products />} />
        <Route path="/points" element={<Points />} />
        <Route path="/events" element={<Events />} />
        <Route path="/images" element={<ImageViews />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
