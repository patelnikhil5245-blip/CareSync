import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(() => JSON.parse(localStorage.getItem('mb_user')  || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('mb_token') || null);
  const [dark,  setDark]  = useState(() => localStorage.getItem('mb_dark') === 'true');

  useEffect(() => {
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else       delete axios.defaults.headers.common['Authorization'];
  }, [token]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('mb_dark', dark);
  }, [dark]);

  const login = (userData, jwt) => {
    setUser(userData); setToken(jwt);
    localStorage.setItem('mb_user', JSON.stringify(userData));
    localStorage.setItem('mb_token', jwt);
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('mb_user');
    localStorage.removeItem('mb_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, dark, toggleDark: () => setDark(d => !d) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
