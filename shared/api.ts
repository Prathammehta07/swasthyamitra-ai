/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface MedicineAvailability {
  name: string;
  stock: number;
  pharmacy: string;
  pincode: string;
}

export interface MedicinesResponse {
  updatedAt: string; // ISO
  items: MedicineAvailability[];
}

export interface SymptomCheckInput {
  age: number;
  symptoms: string[];
  notes?: string;
  gender?: 'male' | 'female' | 'other';
  duration?: string;
  severity?: number; // 1-10 scale
  medicalHistory?: string[];
}

export type TriageLevel = "self_care" | "pharmacist" | "doctor" | "urgent" | "emergency";

export interface SymptomCheckResult {
  level: TriageLevel;
  advice: string;
  redFlags: string[];
  possibleConditions?: string[];
  recommendations?: string[];
  followUpInDays?: number;
  aiAnalysis?: string;
  confidence?: number; // 0-1 scale
}

export interface AdvancedSymptomCheckInput extends SymptomCheckInput {
  useAI: boolean;
}

export interface AdvancedSymptomCheckResult extends SymptomCheckResult {
  differential?: {
    condition: string;
    probability: number;
    reasoning: string;
  }[];
  criticalSigns?: string[];
  preventiveMeasures?: string[];
  aiTriageLevel?: TriageLevel;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  language?: "en" | "hi" | "gu";
}

export interface ChatResponse {
  reply: string;
}

