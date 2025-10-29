import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User as BaseUser } from "../types/types";

interface HistoryItem {
  id: number;
  category: string;
  subCategory: string;
  prompt: string;
  response: string;
  date: string;
}

interface ExtendedUser extends BaseUser {
  role: "student" | "admin";
  history: HistoryItem[];
}

interface UserContextType {
  user: ExtendedUser | null;
  login: (user: Omit<ExtendedUser, "history">) => void;
  logout: () => void;
  addToHistory: (item: Omit<HistoryItem, "id" | "date">) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = (userData: Omit<ExtendedUser, "history">) => {
    const newUser: ExtendedUser = { ...userData, history: [] };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const addToHistory = (item: Omit<HistoryItem, "id" | "date">) => {
    if (!user) return;
    const newItem: HistoryItem = {
      ...item,
      id: Date.now(),
      date: new Date().toLocaleString(),
    };
    setUser({ ...user, history: [newItem, ...user.history] });
  };

  return (
    <UserContext.Provider value={{ user, login, logout, addToHistory }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};

export default UserContext;
