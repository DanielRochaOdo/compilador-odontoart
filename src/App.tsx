import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CatalogPage } from './pages/CatalogPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { useAuth } from './hooks/useAuth';

function ProtectedAdminRoute({ children }: { children: ReactElement }) {
  const { loading, roleLoading, isAdmin, user } = useAuth();

  if (loading || (user && roleLoading)) return <div className="centered">Carregando...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <div className="centered">Usuário sem permissão administrativa.</div>;

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminDashboardPage />
          </ProtectedAdminRoute>
        }
      />
    </Routes>
  );
}

