import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

// User interface
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  referralCode?: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
  isAuthenticated: false,
});

// Provider props interface
interface AuthProviderProps {
  children: ReactNode;
}

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (token) {
          // Set default axios auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user profile
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/me`);
          
          if (response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        email,
        password,
      });
      
      const { token, user } = response.data;
      
      // Store token and set default headers
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      
      return user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        name,
        email,
        password,
      });
      
      const { token, user } = response.data;
      
      // Store token and set default headers
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      
      return user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      
      // Clear local storage and auth headers
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error: any) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, { email });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Password reset failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, data);
      
      setUser(response.data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Profile update failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 