import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on mount
    if (pb.authStore.isValid && pb.authStore.model) {
      setCurrentUser(pb.authStore.model);
    }
    setInitialLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      setCurrentUser(authData.record);
      return { success: true, user: authData.record };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const signup = async (email, password, passwordConfirm, name) => {
    try {
      const userData = {
        email,
        password,
        passwordConfirm,
        name: name || email.split('@')[0]
      };
      
      const record = await pb.collection('users').create(userData);
      
      // Auto-login after signup
      const authData = await pb.collection('users').authWithPassword(email, password);
      setCurrentUser(authData.record);
      
      return { success: true, user: authData.record };
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'Error al crear la cuenta. Por favor, inténtalo de nuevo.';

      // Handle specific PocketBase validation errors
      if (error.response?.data?.email) {
        const emailError = error.response.data.email.message || error.response.data.email.code || '';
        if (emailError.includes('unique') || emailError.includes('already in use') || emailError === 'validation_not_unique') {
          errorMessage = 'Este email ya está registrado';
        } else if (emailError.includes('invalid') || emailError.includes('format') || emailError === 'validation_invalid_email') {
          errorMessage = 'Formato de email inválido';
        } else {
          errorMessage = emailError;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    isAuthenticated: !!currentUser,
    initialLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};