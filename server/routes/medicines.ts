import { RequestHandler } from "express";
import type { MedicineAvailability, MedicinesResponse } from "@shared/api";

const BASE_MEDICINES = [
  { name: "Paracetamol 500mg", baseStock: 45, pharmacy: "Jan Aushadhi Kendra" },
  { name: "Paracetamol 650mg (Dolo)", baseStock: 80, pharmacy: "City Medicos" },
  { name: "ORS Hydration Sachet", baseStock: 150, pharmacy: "Kisan Medical Store" },
  { name: "Amoxicillin 250mg", baseStock: 12, pharmacy: "Apollo Pharmacy" },
  { name: "Cetirizine 10mg", baseStock: 35, pharmacy: "Sehat Chemist" },
  { name: "Azithromycin 500mg", baseStock: 25, pharmacy: "HealthPlus Pharmacy" },
  { name: "Pantoprazole 40mg", baseStock: 60, pharmacy: "LifeCare Medicos" },
  { name: "Metformin 500mg", baseStock: 40, pharmacy: "Jan Aushadhi Kendra" },
  { name: "Insulin Vial (10ml)", baseStock: 8, pharmacy: "District Hospital Counter" },
  { name: "Cough Syrup 100ml", baseStock: 30, pharmacy: "Sehat Chemist" },
  { name: "Vitamin C 500mg Chewable", baseStock: 95, pharmacy: "Apollo Pharmacy" },
  { name: "Ibuprofen 400mg", baseStock: 50, pharmacy: "Kisan Medical Store" }
];

export const handleMedicines: RequestHandler = (req, res) => {
  try {
    const pincode = String(req.query.pincode || "140301").trim();
    const now = new Date().toISOString();

    // Create realistic pharmacy items for the requested pincode
    const items: MedicineAvailability[] = BASE_MEDICINES.map((med, index) => {
      // Create deterministic stock variance based on pincode digits
      const pinNum = parseInt(pincode.replace(/\D/g, "") || "140301", 10);
      const calculatedStock = Math.max(0, (med.baseStock + (pinNum % (index + 7)) * 3) % 120);

      return {
        name: med.name,
        stock: calculatedStock,
        pharmacy: `${med.pharmacy} (${pincode})`,
        pincode: pincode
      };
    });

    const response: MedicinesResponse = { updatedAt: now, items };
    res.json(response);
  } catch (error) {
    console.error('Error handling medicine availability:', error);
    res.status(500).json({ error: "Failed to load medicine availability" });
  }
};
