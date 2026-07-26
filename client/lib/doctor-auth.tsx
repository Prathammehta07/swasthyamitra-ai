import React, { createContext, useContext, useMemo, useState } from "react";

export type Doctor = { 
  id: string; 
  email: string; 
  name: string; 
  username: string;
  specialization: string;
  phone: string;
};

type DoctorAuthCtx = {
  doctor: Doctor | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, password: string, name: string, specialization: string, email: string, phone: string) => Promise<void>;
  logout: () => void;
  token: string | null;
};

const DoctorAuthContext = createContext<DoctorAuthCtx | null>(null);

const doctorSessionKey = "doctor_auth_session_v1";
const doctorTokenKey = "doctor_auth_token_v1";

export function DoctorAuthProvider({ children }: { children: React.ReactNode }) {
  const [doctor, setDoctor] = useState<Doctor | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(doctorSessionKey) || "null");
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(doctorTokenKey);
    } catch {
      return null;
    }
  });

  async function login(email: string, password: string) {
    try {
      const response = await fetch('/api/doctor/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Login successful, data:', data); // Debug log
      
      const doctorData: Doctor = {
        id: data.doctor._id,
        email: data.doctor.email,
        name: data.doctor.name,
        username: data.doctor.username,
        specialization: data.doctor.specialization,
        phone: data.doctor.phone,
      };

      setDoctor(doctorData);
      setToken(data.token);
      localStorage.setItem(doctorSessionKey, JSON.stringify(doctorData));
      localStorage.setItem(doctorTokenKey, data.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async function register(username: string, password: string, name: string, specialization: string, email: string, phone: string) {
    const response = await fetch('/api/doctor/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, name, specialization, email, phone }),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      } else {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
    }

    try {
      const data = await response.json();
      const doctorData: Doctor = {
        id: data.doctor._id,
        email: data.doctor.email,
        name: data.doctor.name,
        username: data.doctor.username,
        specialization: data.doctor.specialization,
        phone: data.doctor.phone,
      };

    setDoctor(doctorData);
    setToken(data.token);
    localStorage.setItem(doctorSessionKey, JSON.stringify(doctorData));
    localStorage.setItem(doctorTokenKey, data.token);
    } catch (e) {
      throw new Error('Failed to parse registration response');
    }
  }

  function logout() {
    setDoctor(null);
    setToken(null);
    localStorage.removeItem(doctorSessionKey);
    localStorage.removeItem(doctorTokenKey);
  }

  const value = useMemo(() => ({ doctor, login, register, logout, token }), [doctor, token]);
  return <DoctorAuthContext.Provider value={value}>{children}</DoctorAuthContext.Provider>;
}

export function useDoctorAuth() {
  const ctx = useContext(DoctorAuthContext);
  if (!ctx) throw new Error("useDoctorAuth must be used within DoctorAuthProvider");
  return ctx;
}