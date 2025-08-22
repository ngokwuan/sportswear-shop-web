import React, { useEffect, useState } from 'react';
import axios from '../setup/axios';
const UserContext = React.createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Lấy user từ localStorage nếu có
    const storedUser = localStorage.getItem('user');
    return storedUser
      ? JSON.parse(storedUser)
      : { isAuthenticated: false, token: '', account: {} };
  });

  // Khi login, lưu vào localStorage
  const loginContext = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Khi logout, xóa khỏi localStorage
  const logoutContext = () => {
    setUser({ isAuthenticated: false, token: '', account: {} });
    localStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{ user, loginContext, logoutContext }}>
      {children}
    </UserContext.Provider>
  );
};
export { UserContext };
