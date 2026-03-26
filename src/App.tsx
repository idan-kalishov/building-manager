import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useAuthStore } from "./lib/auth-store";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Buildings from "./pages/Buildings";
import Leads from "./pages/Leads";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import BuildingDetail from "./pages/BuildingDetail";

export default function App() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400 text-lg">
        טוען...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="buildings" element={<Buildings />} />
          <Route path="buildings/:id" element={<BuildingDetail />} />
          <Route path="leads" element={<Leads />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
