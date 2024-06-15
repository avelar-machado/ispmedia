import React, { createContext, useState, useContext, ReactNode } from "react";

type AuthContextType = {
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (token: string) => {
    setIsLoggedIn(true);
    // Aqui você podemos armazenar o token em algum lugar seguro, como AsyncStorage
  };

  const logout = () => {
    setIsLoggedIn(false);
    // Aqui você podemos remover o token do armazenamento seguro
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
