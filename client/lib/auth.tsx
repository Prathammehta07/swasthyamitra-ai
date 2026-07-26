import React, { createContext, useContext, useMemo, useState } from "react";
import { z } from "zod";

export type User = { id: string; email: string; name: string };

type AuthCtx = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

const usersKey = "auth_users_v1";
const sessionKey = "auth_session_v1";

async function hash(input: string) {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(sessionKey) || "null");
    } catch {
      return null;
    }
  });

  async function login(email: string, password: string) {
    const db: Record<string, any> = JSON.parse(
      localStorage.getItem(usersKey) || "{}",
    );
    const rec = db[email.toLowerCase()];
    if (!rec) throw new Error("Account not found");
    const hp = await hash(password);
    if (rec.hash !== hp) throw new Error("Invalid credentials");
    const u: User = { id: rec.id, email: rec.email, name: rec.name };
    setUser(u);
    localStorage.setItem(sessionKey, JSON.stringify(u));
  }

  async function signup(name: string, email: string, password: string) {
    const emailNorm = email.toLowerCase();
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
    });
    schema.parse({ name, email, password });
    const db: Record<string, any> = JSON.parse(
      localStorage.getItem(usersKey) || "{}",
    );
    if (db[emailNorm]) throw new Error("Email already registered");
    const hp = await hash(password);
    const rec = {
      id: crypto.randomUUID(),
      name,
      email: emailNorm,
      hash: hp,
      createdAt: Date.now(),
    };
    db[emailNorm] = rec;
    localStorage.setItem(usersKey, JSON.stringify(db));
    const u: User = { id: rec.id, email: rec.email, name: rec.name };
    setUser(u);
    localStorage.setItem(sessionKey, JSON.stringify(u));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(sessionKey);
  }

  const value = useMemo(() => ({ user, login, signup, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
