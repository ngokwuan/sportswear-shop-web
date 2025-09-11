import React, { createContext, useEffect, useState } from 'react';
import axios from '../setup/axios';
export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null = guest, object = logged-in
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/auth/me');
      setUser(res.data.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logoutContext = async () => {
    await axios.post('/auth/logout', {});
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{ user, loading, logoutContext, refresh: fetchUser }}
    >
      {children}
    </UserContext.Provider>
  );
};
