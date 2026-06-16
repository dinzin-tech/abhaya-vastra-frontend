// import React, { createContext, useState, useEffect } from "react";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [isLoggedIn, setIsLoggedIn] = useState(true);

//   // Check if token exists on page load
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       setIsLoggedIn(true);
//     } else {
//       setIsLoggedIn(true);
//     }
//   }, []);

//   // Login: save token and profile ID
//   const login = (token, profileId = null) => {
//     localStorage.setItem("token", token);
//     if (profileId) {
//       localStorage.setItem("profile_id", profileId);
//     }
//     setIsLoggedIn(true);
//   };

// // Logout: remove token and profile info
//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("profile_id");
//     setIsLoggedIn(false);
//   };

//   return (
//     <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


import React, { createContext, useState, useEffect, useCallback } from "react";
import API from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      console.log('Checking auth, token exists:', !!token);
      if (token) {
        try {
          // Fetch user data using the API instance
          // console.log('Fetching user data...');
          const response = await API.get('/user');
          // console.log('User data fetched:', response.data);
          setUser(response.data);
          setToken(token); // Make sure token is set in state
        } catch (error) {
          console.error('Authentication check failed:', error);
          // If the token is invalid, clear it
          if (error.response && error.response.status === 401) {
            // console.log('Invalid token, removing from storage');
            localStorage.removeItem('authToken');
          }
        }
      } else {
        console.log('No auth token found');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (data) => {
    // console.log('Login data received:', data);
    const { access_token, user: userData } = data;
    
    if (!access_token || !userData) {
      console.error('Invalid login data - missing token or user data');
      return false;
    }
    
    try {
      // Save token to localStorage
      localStorage.setItem('authToken', access_token);
      // console.log('Token saved to localStorage');
      
      // Set user data in state
      setUser(userData);
      setToken(access_token);
      
      // Set default authorization header for future requests
      API.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // console.log('User state updated:', { user: userData, token: access_token });
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  }, []);

  // Logout function
  const logout = useCallback(async (navigate = null) => {
    try {
      // Call the logout API
      await API.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, we should still clear local auth state
    } finally {
      // Clear user data and token
      localStorage.removeItem('authToken');
      setUser(null);
      setToken(null);
      
      // Redirect to home page if navigate function is provided
      if (navigate && typeof navigate === 'function') {
        navigate('/');
      } else if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
  }, []);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    const isAuth = !!user && !!token;
    console.log('isAuthenticated check:', { hasUser: !!user, hasToken: !!token, isAuth });
    return isAuth;
  }, [user, token]);

  // Create a memoized value to prevent unnecessary re-renders
  const authValue = React.useMemo(() => ({
    user,
    token,
    isLoading,
    isLoggedIn: !!user && !!token, // Direct boolean value instead of function
    login,
    logout,
    setUser
  }), [user, token, isLoading, login, logout]);

  // Debug effect to log auth state changes
  React.useEffect(() => {
    console.log('Auth state updated');
  }, [user, token, authValue.isLoggedIn]);

  const value = {
    ...authValue,
    isAuthenticated: isAuthenticated()
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
