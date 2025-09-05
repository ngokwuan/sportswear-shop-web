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
  // const loginContext = (userData) => {
  //   const userToStore = {
  //     isAuthenticated: true,
  //     token: userData.token,
  //     account: {
  //       id: userData.user.id, // Đảm bảo có id user
  //       name: userData.user.name,
  //       email: userData.user.email,
  //       // other user info
  //     },
  //   };
  //   setUser(userToStore);
  //   localStorage.setItem('user', JSON.stringify(userToStore));
  // };
  // Trong UserContext
  const loginContext = (userData) => {
    console.log('loginContext received:', userData); // Debug log
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData); // hoặc logic tương tự
  };

  // Khi logout, xóa khỏi localStorage
  const logoutContext = () => {
    setUser({ isAuthenticated: false, token: '', account: {} });
    localStorage.removeItem('user');
  };

  // Kiểm tra token khi app khởi động
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/auth/me');

        if (response.data && response.data.user) {
          // Token hợp lệ, cập nhật user state với thông tin mới từ server
          const updatedUser = {
            isAuthenticated: true,
            token: user.token,
            account: response.data.user,
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.log('Token không hợp lệ:', error);

        logoutContext();
      }
    };

    if (user.isAuthenticated && user.token) {
      checkAuth();
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, loginContext, logoutContext }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext };
