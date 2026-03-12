import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const navItems = [
    { path: "/", label: "משימות", icon: "📋", exact: true },
    { path: "/buildings", label: "בניינים", icon: "🏗️" },
    { path: "/leads", label: "לידים", icon: "📌" },
  ];

  return (
    <div className="flex h-screen overflow-hidden" dir="rtl">
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex w-56 flex-shrink-0 bg-gray-900 text-white flex-col p-4 gap-2">
        <h1 className="text-xl font-bold mb-6 text-center">🏢 ניהול בניינים</h1>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`p-2 rounded transition-colors ${
              (
                item.exact
                  ? location.pathname === item.path
                  : isActive(item.path)
              )
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-700"
            }`}
          >
            {item.icon} {item.label}
          </Link>
        ))}
        <button
          onClick={() => {
            signOut(auth);
            navigate("/login");
          }}
          className="mt-auto p-2 rounded hover:bg-red-700 text-right"
        >
          🚪 התנתק
        </button>
      </aside>

      {/* ===== MOBILE SIDEBAR OVERLAY ===== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <aside
            className="absolute right-0 top-0 h-full w-64 bg-gray-900 text-white flex flex-col p-4 gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-bold">🏢 ניהול בניינים</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 text-2xl"
              >
                ×
              </button>
            </div>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`p-3 rounded transition-colors text-base ${
                  (
                    item.exact
                      ? location.pathname === item.path
                      : isActive(item.path)
                  )
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-700"
                }`}
              >
                {item.icon} {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                signOut(auth);
                navigate("/login");
              }}
              className="mt-auto p-3 rounded hover:bg-red-700 text-right"
            >
              🚪 התנתק
            </button>
          </aside>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between bg-gray-900 text-white px-4 py-3 flex-shrink-0">
          <span className="font-bold text-base">🏢 ניהול בניינים</span>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col gap-1 p-1"
          >
            <span className="block w-6 h-0.5 bg-white" />
            <span className="block w-6 h-0.5 bg-white" />
            <span className="block w-6 h-0.5 bg-white" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </main>

        {/* ===== MOBILE BOTTOM NAV ===== */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-30">
          {navItems.map((item) => {
            const active = item.exact
              ? location.pathname === item.path
              : isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 flex flex-col items-center justify-center py-2 text-xs gap-1 transition-colors ${
                  active ? "text-blue-600" : "text-gray-500"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
