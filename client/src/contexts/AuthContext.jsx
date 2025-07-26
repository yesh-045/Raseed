import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  getIdToken 
} from 'firebase/auth';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Get the ID token for backend authentication
      const idToken = await getIdToken(user);
      setUserToken(idToken);
      
      // Get Google OAuth access token for Google Cloud services
      const credential = result._tokenResponse;
      
      // Store comprehensive user info including tokens
      const userInfo = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        idToken: idToken,
        accessToken: credential?.oauthAccessToken,
        refreshToken: credential?.refreshToken,
        expiresIn: credential?.expiresIn
      };
      
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      localStorage.setItem('googleAccessToken', credential?.oauthAccessToken);
      
      return result;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      // Handle specific error codes
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup blocked. Please allow popups and try again.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('Account exists with different credentials. Please use the correct sign-in method.');
      }
      throw new Error('Failed to sign in. Please try again.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userInfo');
      localStorage.removeItem('googleAccessToken');
      setCurrentUser(null);
      setUserToken(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Get fresh ID token for authenticated requests
  const getAuthToken = async () => {
    if (currentUser) {
      try {
        const token = await getIdToken(currentUser, true); // force refresh
        setUserToken(token);
        return token;
      } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      if (user) {
        // Get fresh ID token
        try {
          const idToken = await getIdToken(user);
          setUserToken(idToken);
          
          const userInfo = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            idToken: idToken
          };
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        } catch (error) {
          console.error('Error getting ID token:', error);
        }
      } else {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('googleAccessToken');
        setUserToken(null);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    user: currentUser, // Alias for compatibility
    userToken,
    signInWithGoogle,
    logout,
    getAuthToken,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
