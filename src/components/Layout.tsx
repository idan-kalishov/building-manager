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
    { path: "/suppliers", label: "ספקים", icon: "🔧" },
    { path: "/contacts-import", label: "ייצוא לג'ימייל", icon: "📤" },
  ];

  return (
    <div className="flex h-screen overflow-hidden" dir="rtl">
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex w-60 flex-shrink-0 flex-col bg-gray-950 text-white">
        {/* Logo area */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-base">
              🏢
            </div>
            <h1 className="text-sm font-semibold tracking-wide text-white">
              ניהול בניינים
            </h1>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = item.exact
              ? location.pathname === item.path
              : isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                {active && (
                  <span className="mr-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={() => {
              signOut(auth);
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
          >
            <span className="text-base w-5 text-center">🚪</span>
            <span className="font-medium">התנתק</span>
          </button>
        </div>
      </aside>

      {/* ===== MOBILE SIDEBAR OVERLAY ===== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <aside
            className="absolute right-0 top-0 h-full w-64 bg-gray-950 text-white flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile logo */}
            <div className="px-5 py-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  🏢
                </div>
                <h1 className="text-sm font-semibold">ניהול בניינים</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Mobile nav */}
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
              {navItems.map((item) => {
                const active = item.exact
                  ? location.pathname === item.path
                  : isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all ${
                      active
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="text-base w-5 text-center">
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 py-4 border-t border-white/10">
              <button
                onClick={() => {
                  signOut(auth);
                  navigate("/login");
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                <span className="text-base w-5 text-center">🚪</span>
                <span className="font-medium">התנתק</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between bg-gray-950 text-white px-4 py-3 flex-shrink-0 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-sm">
              🏢
            </div>
            <span className="font-semibold text-sm">ניהול בניינים</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col gap-1.5 p-1.5 rounded-md hover:bg-white/10 transition-colors"
          >
            <span className="block w-5 h-0.5 bg-white rounded" />
            <span className="block w-5 h-0.5 bg-white rounded" />
            <span className="block w-5 h-0.5 bg-white rounded" />
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
                className={`flex-1 flex flex-col items-center justify-center py-2.5 text-xs gap-1 transition-colors ${
                  active ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <span
                  className={`text-lg leading-none ${active ? "scale-110" : ""} transition-transform`}
                >
                  {item.icon}
                </span>
                <span className={`${active ? "font-semibold" : "font-normal"}`}>
                  {item.label}
                </span>
                {active && (
                  <span className="absolute bottom-0 w-8 h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
