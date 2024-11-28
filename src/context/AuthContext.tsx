import { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  // Ajoutez ici vos propriétés d'authentification
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Pour l'instant, on retourne juste un état d'authentification statique
  const value = {
    isAuthenticated: true
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
