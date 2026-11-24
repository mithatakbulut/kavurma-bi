import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import data from '../data.js';
import { useAuth } from '../context/AuthContext.jsx';
import BrandMark from '../components/BrandMark.jsx';

export default function AuthView() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [reveal, setReveal] = useState(false);
  const passwordRef = useRef(null);

  useEffect(() => {
    document.title = 'Kavurma · Giriş';
  }, []);

  const returnTo = location.state?.from;
  const destination = returnTo && returnTo.startsWith('/') && returnTo !== '/giris' ? returnTo : '/genel-bakis';

  if (session) {
    return <Navigate to={destination} replace />;
  }

  const clearError = () => setError('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const record = signIn(email, password);
    if (!record) {
      setError('E-posta veya şifre hatalı.');
      passwordRef.current?.focus();
      passwordRef.current?.select();
      return;
    }
    setError('');
    setEmail('');
    setPassword('');
    setReveal(false);
    navigate(destination, { replace: true });
  };

  const fillAccount = (user) => {
    setEmail(user.email);
    setPassword(user.password);
    setError('');
    setReveal(false);
    passwordRef.current?.focus();
  };

  return (
    <section className="auth" aria-labelledby="auth-title">
      <div className="auth-frame">
        <header className="auth-brand">
          <BrandMark />
          <div>
            <span className="brand-name">Kavurma</span>
            <span className="brand-scope">Kadıköy · İstanbul</span>
          </div>
          <span className="auth-badge">Demo</span>
        </header>

        <div className="auth-sheet">
          <div className="auth-intro">
            <p className="auth-kicker">Demo girişi</p>
            <h1 id="auth-title">Abonelik panosuna giriş</h1>
            <p className="auth-lead">
              Kavurma Roasters için hazırlanmış statik bir demo. Giriş bilgileri yalnızca tarayıcıda kontrol edilir;
              sunucu, gerçek kullanıcı hesabı veya şifre doğrulaması yoktur.
            </p>

            <div className="demo-accounts">
              <div className="demo-head">
                <h2>Demo hesapları</h2>
                <span>Doldurmak için bir hesap seç</span>
              </div>
              <ul className="demo-list">
                {data.auth.users.map((user) => (
                  <li key={user.email}>
                    <button className="demo-account" type="button" onClick={() => fillAccount(user)}>
                      <span className="demo-top">
                        <span className="demo-name">{user.name}</span>
                        <span className="pill neutral">{user.roleLabel}</span>
                      </span>
                      <span className="demo-cred">
                        <span>{user.email}</span>
                        <span>{user.password}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <form className="auth-form" id="signin-form" noValidate onSubmit={handleSubmit}>
            <div className="auth-form-head">
              <h2>Giriş yap</h2>
              <p>Rolüne göre pano görünümü açılır.</p>
            </div>

            <div className="auth-field">
              <label htmlFor="auth-email">E-posta</label>
              <input
                id="auth-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                spellCheck="false"
                required
                aria-describedby="auth-error"
                aria-invalid={error ? 'true' : undefined}
                value={email}
                onChange={(event) => { setEmail(event.target.value); clearError(); }}
              />
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="auth-password">Şifre</label>
                <button
                  className="auth-reveal"
                  type="button"
                  aria-pressed={reveal}
                  aria-controls="auth-password"
                  onClick={() => setReveal((current) => !current)}
                >
                  {reveal ? 'Gizle' : 'Göster'}
                </button>
              </div>
              <input
                ref={passwordRef}
                id="auth-password"
                name="password"
                type={reveal ? 'text' : 'password'}
                autoComplete="current-password"
                required
                aria-describedby="auth-error"
                aria-invalid={error ? 'true' : undefined}
                value={password}
                onChange={(event) => { setPassword(event.target.value); clearError(); }}
              />
            </div>

            <p className="auth-error" id="auth-error" role="alert" hidden={!error}>{error}</p>
            <button className="btn primary auth-submit" type="submit">Giriş yap</button>
            <p className="auth-hint">
              Oturum yalnızca bu sekmede, <code>sessionStorage</code> içinde tutulur. Sekmeyi kapatınca kapanır.
            </p>
          </form>
        </div>

        <p className="auth-foot">Kavurma Roasters · demo verisi · gerçek müşteri bilgisi içermez</p>
      </div>
    </section>
  );
}
