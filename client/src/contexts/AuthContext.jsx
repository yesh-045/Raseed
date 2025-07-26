import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      localStorage.setItem('userInfo', JSON.stringify({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      }));
      return result;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  // Simple mock login for development
  const login = async () => {
    try {
      // For development, create a mock user
      const mockUser = {
        uid: 'mock-user-123',
        email: 'demo@raseed.ai',
        displayName: 'Demo User',
        photoURL: 'https://via.placeholder.com/150'
      };
      
      localStorage.setItem('userInfo', JSON.stringify(mockUser));
      localStorage.setItem('mockAuth', 'true');
      setCurrentUser(mockUser);
      return mockUser;
    } catch (error) {
      console.error('Error with mock login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const mockAuth = localStorage.getItem('mockAuth');
      
      if (mockAuth === 'true') {
        // Handle mock logout
        localStorage.removeItem('userInfo');
        localStorage.removeItem('mockAuth');
        setCurrentUser(null);
        return;
      }
      
      // Handle Firebase logout
      await signOut(auth);
      localStorage.removeItem('userInfo');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Check for stubbed authentication first
    const mockAuth = localStorage.getItem('mockAuth');
    const userInfo = localStorage.getItem('userInfo');
    
    if (mockAuth === 'true' && userInfo) {
      try {
        const mockUser = JSON.parse(userInfo);
        setCurrentUser(mockUser);
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing mock user:', error);
      }
    }
    
    // Fall back to Firebase auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!mockAuth) {  // Only use Firebase auth if not in mock mode
        setCurrentUser(user);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signInWithGoogle,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
