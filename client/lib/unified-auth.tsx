import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { z } from "zod";
import { safeJsonResponse } from "./utils";

export type UserRole = "patient" | "doctor" | "guest";

export type UnifiedUser = {
  id: string;
  email?: string;
  name: string;
  role: UserRole;
  profile?: any;
  token?: string;
};

type UnifiedAuthCtx = {
  user: UnifiedUser | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  registerPatient: (patientData: any) => Promise<void>;
  registerDoctor: (doctorData: any) => Promise<void>;
  guestLogin: (name?: string) => void;
  logout: () => void;
  updateUser: (user: UnifiedUser) => void;
  isAuthenticated: boolean;
  isPatient: boolean;
  isDoctor: boolean;
  isGuest: boolean;
};

const UnifiedAuthContext = createContext<UnifiedAuthCtx | null>(null);

const USERS_KEY = "unified_auth_users_v1";
const SESSION_KEY = "unified_auth_session_v1";

async function hash(input: string) {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Ensure demo accounts are always available in localStorage
// This is called synchronously before every login attempt
export async function ensureDemoAccounts() {
  const db: Record<string, any> = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  const patientKey = "patient_patient@test.com";
  const doctorKey1 = "doctor_test@gmail.com";
  const doctorKey2 = "doctor_doc@gmail.com";

  const needsUpdate = !db[patientKey] || !db[doctorKey1] || !db[doctorKey2];

  if (needsUpdate) {
    // Seed patient demo account
    if (!db[patientKey]) {
      db[patientKey] = {
        id: "patient-demo-1",
        name: "John Patient",
        email: "patient@test.com",
        hash: await hash("test@123"),
        role: "patient",
        profile: {
          phone: "1234567890",
          dateOfBirth: "1990-01-01",
          gender: "male",
          address: "123 Main St, Healthcare City, HC 12345",
          emergencyContact: { name: "Jane Patient", phone: "1234567891", relationship: "Spouse" },
          bloodGroup: "O+",
          medicalHistory: ["Hypertension", "Diabetes Type 2"],
          allergies: ["Penicillin", "Shellfish"],
          currentMedications: ["Metformin", "Lisinopril"]
        },
        createdAt: Date.now()
      };
    }

    // Seed doctor demo account 1
    if (!db[doctorKey1]) {
      db[doctorKey1] = {
        id: "doctor-demo-1",
        name: "Dr. Sarah Doctor",
        email: "test@gmail.com",
        hash: await hash("test@123"),
        role: "doctor",
        profile: { username: "drsarah", specialization: "General Medicine", phone: "1234567892" },
        createdAt: Date.now()
      };
    }

    // Seed doctor demo account 2
    if (!db[doctorKey2]) {
      db[doctorKey2] = {
        id: "doctor-demo-2",
        name: "Dr. Smith",
        email: "doc@gmail.com",
        hash: await hash("doc@123"),
        role: "doctor",
        profile: { username: "docuser", specialization: "Cardiology", phone: "9876543210" },
        createdAt: Date.now()
      };
    }

    localStorage.setItem(USERS_KEY, JSON.stringify(db));
  }
}

export function UnifiedAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UnifiedUser | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  });

  // Seed demo accounts on mount
  useEffect(() => {
    ensureDemoAccounts();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  async function login(email: string, password: string, role: UserRole) {
    // For patient and doctor roles, try backend first, then fallback to local
    if (role === "patient" || role === "doctor") {
      try {
        const endpoint = role === "patient" ? "/api/patient/login" : "/api/doctor/login";
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        
        const data = await safeJsonResponse(response);
        const userData = role === "patient" ? data.patient : data.doctor;
        
        const unifiedUser: UnifiedUser = {
          id: userData._id || userData.id,
          email: userData.email,
          name: userData.name,
          role: role,
          profile: userData,
          token: data.token
        };
        
        setUser(unifiedUser);
        return;
      } catch (error) {
        console.warn('Backend login failed, falling back to local storage:', error);
      }
    }
    
    // Local authentication - ensure demo data is available before lookup
    await ensureDemoAccounts();
    
    const db: Record<string, any> = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
    const userKey = `${role}_${email.toLowerCase()}`;
    const rec = db[userKey];
    
    if (!rec) throw new Error("Account not found. Please register first or check your credentials.");
    
    const hp = await hash(password);
    if (rec.hash !== hp) throw new Error("Invalid credentials");
    
    const unifiedUser: UnifiedUser = {
      id: rec.id,
      email: rec.email,
      name: rec.name,
      role: role,
      profile: rec.profile || {}
    };
    
    setUser(unifiedUser);
  }

  async function registerPatient(patientData: {
    name: string; email: string; password: string; phone: string;
    dateOfBirth: string; gender: string; address: string;
    emergencyContact: any; bloodGroup?: string;
    medicalHistory?: string[]; allergies?: string[]; currentMedications?: string[];
  }) {
    const schema = z.object({
      name: z.string().min(2, "Full Name must be at least 2 characters"),
      email: z.string().email("Please enter a valid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      phone: z.string().min(10, "Phone number must be at least 10 digits"),
    });

    try {
      schema.parse(patientData);
    } catch (zodErr: any) {
      if (zodErr?.errors?.[0]?.message) {
        throw new Error(zodErr.errors[0].message);
      }
      if (Array.isArray(zodErr?.issues) && zodErr.issues[0]?.message) {
        throw new Error(zodErr.issues[0].message);
      }
      throw zodErr;
    }
    
    try {
      const response = await fetch("/api/patient/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData)
      });
      
      const data = await safeJsonResponse(response);
      const unifiedUser: UnifiedUser = {
        id: data.patient._id || data.patient.id,
        email: data.patient.email, name: data.patient.name,
        role: "patient", profile: data.patient, token: data.token
      };
      setUser(unifiedUser);
    } catch (error) {
      console.warn('Backend registration failed, falling back to local storage:', error);
      const emailNorm = patientData.email.toLowerCase();
      const db: Record<string, any> = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
      const userKey = `patient_${emailNorm}`;
      if (db[userKey]) throw new Error("Email already registered");
      
      const hp = await hash(patientData.password);
      const rec = {
        id: crypto.randomUUID(), name: patientData.name, email: emailNorm, hash: hp,
        role: "patient" as const,
        profile: {
          phone: patientData.phone, dateOfBirth: patientData.dateOfBirth,
          gender: patientData.gender, address: patientData.address,
          emergencyContact: patientData.emergencyContact, bloodGroup: patientData.bloodGroup,
          medicalHistory: patientData.medicalHistory || [],
          allergies: patientData.allergies || [],
          currentMedications: patientData.currentMedications || []
        },
        createdAt: Date.now(),
      };
      db[userKey] = rec;
      localStorage.setItem(USERS_KEY, JSON.stringify(db));
      const unifiedUser: UnifiedUser = {
        id: rec.id, email: rec.email, name: rec.name,
        role: "patient", profile: rec.profile
      };
      setUser(unifiedUser);
    }
  }

  async function registerDoctor(doctorData: {
    username: string; password: string; name: string;
    specialization: string; email: string; phone: string;
  }) {
    const schema = z.object({
      name: z.string().min(2, "Full Name must be at least 2 characters"),
      email: z.string().email("Please enter a valid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      username: z.string().min(3, "Username must be at least 3 characters"),
      specialization: z.string().min(2, "Please select a specialization"),
    });

    try {
      schema.parse(doctorData);
    } catch (zodErr: any) {
      if (zodErr?.errors?.[0]?.message) {
        throw new Error(zodErr.errors[0].message);
      }
      if (Array.isArray(zodErr?.issues) && zodErr.issues[0]?.message) {
        throw new Error(zodErr.issues[0].message);
      }
      throw zodErr;
    }
    
    try {
      const response = await fetch("/api/doctor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doctorData)
      });
      
      const data = await safeJsonResponse(response);
      const unifiedUser: UnifiedUser = {
        id: data.doctor._id || data.doctor.id,
        email: data.doctor.email, name: data.doctor.name,
        role: "doctor", profile: data.doctor, token: data.token
      };
      setUser(unifiedUser);
    } catch (error) {
      console.warn('Backend registration failed, falling back to local storage:', error);
      const emailNorm = doctorData.email.toLowerCase();
      const db: Record<string, any> = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
      const userKey = `doctor_${emailNorm}`;
      if (db[userKey]) throw new Error("Email already registered");
      
      const hp = await hash(doctorData.password);
      const rec = {
        id: crypto.randomUUID(), name: doctorData.name, email: emailNorm, hash: hp,
        role: "doctor" as const,
        profile: { username: doctorData.username, specialization: doctorData.specialization, phone: doctorData.phone },
        createdAt: Date.now(),
      };
      db[userKey] = rec;
      localStorage.setItem(USERS_KEY, JSON.stringify(db));
      const unifiedUser: UnifiedUser = {
        id: rec.id, email: rec.email, name: rec.name,
        role: "doctor", profile: rec.profile
      };
      setUser(unifiedUser);
    }
  }

  function guestLogin(name: string = "Guest User") {
    const guestUser: UnifiedUser = {
      id: `guest_${Date.now()}`,
      name: name,
      role: "guest",
      profile: {}
    };
    setUser(guestUser);
  }

  function logout() {
    setUser(null);
  }

  const value = useMemo(() => ({
    user, login, registerPatient, registerDoctor, guestLogin, logout, updateUser: setUser,
    isAuthenticated: !!user,
    isPatient: user?.role === "patient",
    isDoctor: user?.role === "doctor",
    isGuest: user?.role === "guest",
  }), [user]);

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
}

export function useUnifiedAuth() {
  const ctx = useContext(UnifiedAuthContext);
  if (!ctx) throw new Error("useUnifiedAuth must be used within UnifiedAuthProvider");
  return ctx;
}
