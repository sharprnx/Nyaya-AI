import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDocFromServer, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  logOut: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Ensure user document exists in Firestore
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDocFromServer(userRef);
          
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              displayName: currentUser.displayName || 'Unknown User',
              email: currentUser.email || 'no-email',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
        } catch (error) {
          console.error("Error setting up user profile in Firestore:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};
