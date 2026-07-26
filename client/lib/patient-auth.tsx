import React, { createContext, useContext, useMemo, useState } from "react";

export type Patient = { 
  _id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: string[];
  allergies?: string[];
  currentMedications?: string[];
  bloodGroup?: string;
};

type PatientAuthCtx = {
  patient: Patient | null;
  login: (email: string, password: string) => Promise<void>;
  register: (patientData: any) => Promise<void>;
  logout: () => void;
  token: string | null;
};

const PatientAuthContext = createContext<PatientAuthCtx | null>(null);

const patientSessionKey = "patient_auth_session_v1";
const patientTokenKey = "patient_auth_token_v1";

export function PatientAuthProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatient] = useState<Patient | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(patientSessionKey) || "null");
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(patientTokenKey);
    } catch {
      return null;
    }
  });

  async function login(email: string, password: string) {
    try {
      const response = await fetch('/api/patient/login', {
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
      console.log('Patient login successful, data:', data); // Debug log
      
      const patientData: Patient = {
        _id: data.patient._id,
        name: data.patient.name,
        email: data.patient.email,
        phone: data.patient.phone,
        dateOfBirth: data.patient.dateOfBirth,
        gender: data.patient.gender,
        address: data.patient.address,
        emergencyContact: data.patient.emergencyContact,
        medicalHistory: data.patient.medicalHistory,
        allergies: data.patient.allergies,
        currentMedications: data.patient.currentMedications,
        bloodGroup: data.patient.bloodGroup,
      };

      setPatient(patientData);
      setToken(data.token);
      localStorage.setItem(patientSessionKey, JSON.stringify(patientData));
      localStorage.setItem(patientTokenKey, data.token);
    } catch (error) {
      console.error('Patient login error:', error);
      throw error;
    }
  }

  async function register(patientData: any) {
    try {
      const response = await fetch('/api/patient/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      
      const newPatient: Patient = {
        _id: data.patient._id,
        name: data.patient.name,
        email: data.patient.email,
        phone: data.patient.phone,
        dateOfBirth: data.patient.dateOfBirth,
        gender: data.patient.gender,
        address: data.patient.address,
        emergencyContact: data.patient.emergencyContact,
        medicalHistory: data.patient.medicalHistory,
        allergies: data.patient.allergies,
        currentMedications: data.patient.currentMedications,
        bloodGroup: data.patient.bloodGroup,
      };

      setPatient(newPatient);
      setToken(data.token);
      localStorage.setItem(patientSessionKey, JSON.stringify(newPatient));
      localStorage.setItem(patientTokenKey, data.token);
    } catch (error) {
      console.error('Patient registration error:', error);
      throw error;
    }
  }

  function logout() {
    setPatient(null);
    setToken(null);
    localStorage.removeItem(patientSessionKey);
    localStorage.removeItem(patientTokenKey);
  }

  const value = useMemo(() => ({ patient, login, register, logout, token }), [patient, token]);
  return <PatientAuthContext.Provider value={value}>{children}</PatientAuthContext.Provider>;
}

export function usePatientAuth() {
  const ctx = useContext(PatientAuthContext);
  if (!ctx) throw new Error("usePatientAuth must be used within PatientAuthProvider");
  return ctx;
}