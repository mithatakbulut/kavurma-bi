import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { RedirectSignedIn, RequireAuth, RequireRole } from './components/RouteGuards.jsx';
import AppLayout from './components/AppLayout.jsx';
import AuthView from './views/AuthView.jsx';
import Overview from './views/Overview.jsx';
import Subscribers from './views/Subscribers.jsx';
import Actions from './views/Actions.jsx';
import Batches from './views/Batches.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/giris" element={<AuthView />} />
            <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
              <Route path="/genel-bakis" element={<Overview />} />
              <Route path="/aboneler" element={<Subscribers />} />
              <Route path="/aksiyonlar" element={<RequireRole view="actions"><Actions /></RequireRole>} />
              <Route path="/partiler" element={<Batches />} />
            </Route>
            <Route path="/" element={<RedirectSignedIn />} />
            <Route path="*" element={<RedirectSignedIn />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
