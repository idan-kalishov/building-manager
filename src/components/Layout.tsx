import { Outlet, Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen" dir="rtl">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col p-4 gap-2">
        <h1 className="text-xl font-bold mb-6 text-center">🏢 ניהול בניינים</h1>
        <Link to="/" className="p-2 rounded hover:bg-gray-700">
          📊 דשבורד
        </Link>
        <Link to="/buildings" className="p-2 rounded hover:bg-gray-700">
          🏗️ בניינים
        </Link>
        <Link to="/leads" className="p-2 rounded hover:bg-gray-700">
          📌 לידים
        </Link>
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
      {/* Main */}
      <main className="flex-1 overflow-auto bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}
