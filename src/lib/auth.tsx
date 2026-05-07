import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "user";
export interface AuthUser {
  email: string;
  role: Role;
}

const ADMIN_EMAILS = ["janio@saneago.com.br"];
const STORAGE_KEY = "aqualoss:auth";

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string) => AuthUser;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setUser(JSON.parse(raw));
    } catch {/* noop */}
    setLoading(false);
  }, []);

  const login = (rawEmail: string): AuthUser => {
    const email = rawEmail.trim().toLowerCase();
    const role: Role = ADMIN_EMAILS.includes(email) ? "admin" : "user";
    const u = { email, role };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}

export function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}
