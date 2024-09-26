import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        try {
          const userResponse = await fetch(`/api/users?userId=${parsedUser._id}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser({
              ...userData.user,
              lastEditedAt: userData.user.lastEditedAt
            });
            localStorage.setItem('user', JSON.stringify(userData.user));
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
