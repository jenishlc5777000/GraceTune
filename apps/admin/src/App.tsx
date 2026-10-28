import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AdminLayout } from './components/AdminLayout';
import { Appearance } from './pages/Appearance';
import { Login } from './pages/Login';
import { useSession } from './store/session';

function RequireAdmin({ children }: { children: ReactNode }) {
  const user = useSession((s) => s.user);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: <Navigate to="/settings/appearance" replace /> },
      { path: 'settings/appearance', element: <Appearance /> },
      { path: '*', element: <Navigate to="/settings/appearance" replace /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
