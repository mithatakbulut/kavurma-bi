import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import data from '../data.js';

export const ROLE_VIEWS = {
  admin: ['overview', 'subscribers', 'actions', 'batches'],
  operations: ['overview', 'subscribers', 'actions', 'batches'],
  viewer: ['overview', 'subscribers', 'batches']
};

export const ACTOR_ROLES = ['admin', 'operations'];
export const SESSION_KEY = data.auth.sessionKey;

const AuthContext = createContext(null);

const readSession = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const valid = parsed
      && ROLE_VIEWS[parsed.role]
      && [parsed.email, parsed.name, parsed.title].every((value) => typeof value === 'string');
    if (!valid) throw new Error('invalid demo session');
    return { email: parsed.email, role: parsed.role, name: parsed.name, title: parsed.title };
  } catch {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* storage may be unavailable */ }
    return null;
  }
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const signIn = useCallback((email, password) => {
    const normalized = email.trim().toLowerCase();
    const user = data.auth.users.find(
      (candidate) => candidate.email.toLowerCase() === normalized && candidate.password === password
    );
    if (!user) return null;
    const record = { email: user.email, role: user.role, name: user.name, title: user.title };
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(record));
    } catch {
      /* The demo still works in memory when storage is unavailable. */
    }
    setSession(record);
    return record;
  }, []);

  const signOut = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* Nothing to clear when storage is unavailable. */
    }
    setSession(null);
  }, []);

  const value = useMemo(() => ({
    session,
    signIn,
    signOut,
    canAct: Boolean(session) && ACTOR_ROLES.includes(session.role),
    canView: (view) => Boolean(session) && ROLE_VIEWS[session.role].includes(view)
  }), [session, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
