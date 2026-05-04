import React, { useState } from "react";
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
import { isAuthenticated} from "./utils/token";

type Page =
  | "dashboard"
  | "users"
  | "transactions"
  | "products"
  | "points"
  | "events"
  | "images";

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<Page>("dashboard");

  const isLoggedIn = isAuthenticated();

  const handleLogin = (user: User, token: string) => {
    localStorage.setItem("token_key", token);
    setCurrentUser(user);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "users":
        return <Users />;
      case "transactions":
        return <Transactions />;
      case "products":
        return <Products />;
      case "points":
        return <Points />;
      case "events":
        return <Events />;
      case "images":
        return <ImageViews />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        activePage={activePage}
        setActivePage={(page) => setActivePage(page as Page)}
      />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Topbar currentUser={currentUser} activePage={activePage} />
        <main className="flex-1 overflow-auto">{renderPage()}</main>
      </div>
    </div>
  );
};

export default App;
