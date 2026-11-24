import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function RequireAuth({ children }) {
  const { session } = useAuth();
  const location = useLocation();
  if (!session) {
    return <Navigate to="/giris" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  return children;
}

export function RequireRole({ view, children }) {
  const { session, canView } = useAuth();
  const showToast = useToast();
  const allowed = Boolean(session) && canView(view);

  useEffect(() => {
    if (session && !allowed) {
      showToast('Bu görünüm için yetkiniz yok; genel bakışa yönlendirildiniz.');
    }
  }, [session, allowed, showToast]);

  if (!session) return <Navigate to="/giris" replace />;
  if (!allowed) return <Navigate to="/genel-bakis" replace />;
  return children;
}

export function RedirectSignedIn() {
  const { session } = useAuth();
  return <Navigate to={session ? '/genel-bakis' : '/giris'} replace />;
}
