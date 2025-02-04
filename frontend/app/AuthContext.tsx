import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Typy pre kontext
interface AuthContextType {
  token: string | null;
  saveToken: (token: string) => Promise<void>;
  removeToken: () => Promise<void>;
}

// Vytvorenie kontextu
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Poskytovateľ kontextu
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  // Načítanie tokenu pri štarte aplikácie
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (e) {
        console.error('Error loading token:', e);
      }
    };
    loadToken();
  }, []);

  // Funkcia na uloženie tokenu
  const saveToken = async (newToken: string) => {
    try {
      await AsyncStorage.setItem('authToken', newToken);
      setToken(newToken);
    } catch (e) {
      console.error('Error saving token:', e);
    }
  };

  // Funkcia na vymazanie tokenu
  const removeToken = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      setToken(null);
    } catch (e) {
      console.error('Error removing token:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ token, saveToken, removeToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook na použitie AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
