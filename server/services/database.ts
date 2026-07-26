import { Medicine, IMedicine, Pharmacy, IPharmacy, Symptom, ISymptom, SymptomRecord, ISymptomRecord } from '../models/index';
import { Doctor, Slot } from '../models/doctor';
import bcrypt from 'bcryptjs';
import type { MedicineAvailability, MedicinesResponse, SymptomCheckInput, AdvancedSymptomCheckResult } from '@shared/api';

// Medicine Service
export class MedicineService {
  // Get medicines by pincode
  static async getMedicinesByPincode(pincode?: string): Promise<MedicinesResponse> {
    try {
      const filter = pincode ? { pincode: pincode.trim() } : {};
      const medicines = await Medicine.find(filter).sort({ name: 1 });
      
      const items: MedicineAvailability[] = medicines.map(med => ({
        name: med.name,
        stock: med.stock,
        pharmacy: med.pharmacy,
        pincode: med.pincode
      }));

      return {
        updatedAt: new Date().toISOString(),
        items
      };
    } catch (error) {
      console.error('Error fetching medicines:', error);
      throw error;
    }
  }

  // Add or update medicine
  static async addOrUpdateMedicine(medicineData: Partial<IMedicine>): Promise<IMedicine> {
    try {
      const filter = { 
        name: medicineData.name, 
        pharmacy: medicineData.pharmacy,
        pincode: medicineData.pincode 
      };
      
      const medicine = await Medicine.findOneAndUpdate(
        filter,
        medicineData,
        { upsert: true, new: true, runValidators: true }
      );
      
      return medicine;
    } catch (error) {
      console.error('Error adding/updating medicine:', error);
      throw error;
    }
  }

  // Update stock
  static async updateStock(medicineId: string, newStock: number): Promise<IMedicine | null> {
    try {
      return await Medicine.findByIdAndUpdate(
        medicineId,
        { stock: newStock },
        { new: true, runValidators: true }
      );
    } catch (error) {
      console.error('Error updating medicine stock:', error);
      throw error;
    }
  }

  // Search medicines
  static async searchMedicines(query: string, pincode?: string): Promise<IMedicine[]> {
    try {
      const filter: any = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { activeIngredient: { $regex: query, $options: 'i' } }
        ]
      };

      if (pincode) {
        filter.pincode = pincode;
      }

      return await Medicine.find(filter).sort({ name: 1 }).limit(20);
    } catch (error) {
      console.error('Error searching medicines:', error);
      throw error;
    }
  }
}

// Pharmacy Service
export class PharmacyService {
  // Get pharmacies by pincode
  static async getPharmaciesByPincode(pincode: string): Promise<IPharmacy[]> {
    try {
      return await Pharmacy.find({ 
        pincode: pincode.trim(),
        isActive: true 
      }).sort({ name: 1 });
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      throw error;
    }
  }

  // Add pharmacy
  static async addPharmacy(pharmacyData: Partial<IPharmacy>): Promise<IPharmacy> {
    try {
      const pharmacy = new Pharmacy(pharmacyData);
      return await pharmacy.save();
    } catch (error) {
      console.error('Error adding pharmacy:', error);
      throw error;
    }
  }

  // Get nearby pharmacies (if coordinates are provided)
  static async getNearbyPharmacies(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 10
  ): Promise<IPharmacy[]> {
    try {
      // Convert km to radians (radius of Earth ~6371 km)
      const radiusRadians = radiusKm / 6371;

      return await Pharmacy.find({
        isActive: true,
        'coordinates.latitude': {
          $gte: latitude - (radiusRadians * 180 / Math.PI),
          $lte: latitude + (radiusRadians * 180 / Math.PI)
        },
        'coordinates.longitude': {
          $gte: longitude - (radiusRadians * 180 / Math.PI),
          $lte: longitude + (radiusRadians * 180 / Math.PI)
        }
      }).sort({ name: 1 });
    } catch (error) {
      console.error('Error fetching nearby pharmacies:', error);
      throw error;
    }
  }
}

// Symptom Service
export class SymptomService {
  // Get all active symptoms
  static async getAvailableSymptoms(): Promise<ISymptom[]> {
    try {
      return await Symptom.find({ isActive: true })
        .sort({ category: 1, name: 1 });
    } catch (error) {
      console.error('Error fetching symptoms:', error);
      throw error;
    }
  }

  // Get symptoms by category
  static async getSymptomsByCategory(category: string): Promise<ISymptom[]> {
    try {
      return await Symptom.find({ 
        category: category.toLowerCase(),
        isActive: true 
      }).sort({ name: 1 });
    } catch (error) {
      console.error('Error fetching symptoms by category:', error);
      throw error;
    }
  }

  // Add symptom
  static async addSymptom(symptomData: Partial<ISymptom>): Promise<ISymptom> {
    try {
      const symptom = new Symptom(symptomData);
      return await symptom.save();
    } catch (error) {
      console.error('Error adding symptom:', error);
      throw error;
    }
  }

  // Search symptoms
  static async searchSymptoms(query: string): Promise<ISymptom[]> {
    try {
      return await Symptom.find({
        $and: [
          { isActive: true },
          {
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } },
              { bodyPart: { $in: [new RegExp(query, 'i')] } }
            ]
          }
        ]
      }).sort({ name: 1 }).limit(10);
    } catch (error) {
      console.error('Error searching symptoms:', error);
      throw error;
    }
  }
}

// Symptom Record Service
export class SymptomRecordService {
  // Save symptom check record
  static async saveSymptomRecord(
    input: SymptomCheckInput & { useAI: boolean },
    result: AdvancedSymptomCheckResult,
    metadata?: { ipAddress?: string; userAgent?: string; sessionId?: string }
  ): Promise<ISymptomRecord> {
    try {
      const recordData: Partial<ISymptomRecord> = {
        sessionId: metadata?.sessionId,
        userAge: input.age,
        userGender: input.gender,
        symptoms: input.symptoms,
        notes: input.notes,
        duration: input.duration,
        severity: input.severity,
        medicalHistory: input.medicalHistory,
        triageLevel: result.level,
        advice: result.advice,
        redFlags: result.redFlags || [],
        possibleConditions: result.possibleConditions,
        recommendations: result.recommendations,
        followUpInDays: result.followUpInDays,
        aiAnalysis: result.aiAnalysis,
        confidence: result.confidence,
        useAI: input.useAI,
        differential: result.differential,
        criticalSigns: result.criticalSigns,
        preventiveMeasures: result.preventiveMeasures,
        aiTriageLevel: result.aiTriageLevel,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent
      };

      const record = new SymptomRecord(recordData);
      return await record.save();
    } catch (error) {
      console.error('Error saving symptom record:', error);
      throw error;
    }
  }

  // Get symptom records analytics
  static async getTriageAnalytics(
    startDate?: Date,
    endDate?: Date
  ): Promise<{ level: string; count: number }[]> {
    try {
      const match: any = {};
      
      if (startDate || endDate) {
        match.createdAt = {};
        if (startDate) match.createdAt.$gte = startDate;
        if (endDate) match.createdAt.$lte = endDate;
      }

      const analytics = await SymptomRecord.aggregate([
        { $match: match },
        { 
          $group: { 
            _id: '$triageLevel', 
            count: { $sum: 1 } 
          } 
        },
        { $sort: { _id: 1 } }
      ]);

      return analytics.map(item => ({
        level: item._id,
        count: item.count
      }));
    } catch (error) {
      console.error('Error fetching triage analytics:', error);
      throw error;
    }
  }

  // Get common symptoms analytics
  static async getCommonSymptomsAnalytics(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ symptom: string; count: number }[]> {
    try {
      const match: any = {};
      
      if (startDate || endDate) {
        match.createdAt = {};
        if (startDate) match.createdAt.$gte = startDate;
        if (endDate) match.createdAt.$lte = endDate;
      }

      const analytics = await SymptomRecord.aggregate([
        { $match: match },
        { $unwind: '$symptoms' },
        { 
          $group: { 
            _id: '$symptoms', 
            count: { $sum: 1 } 
          } 
        },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]);

      return analytics.map(item => ({
        symptom: item._id,
        count: item.count
      }));
    } catch (error) {
      console.error('Error fetching common symptoms analytics:', error);
      throw error;
    }
  }
}

// Database seeding service
export class SeedService {
  // Seed initial data
  static async seedInitialData(): Promise<void> {
    try {
      // Check if data already exists
      const medicineCount = await Medicine.countDocuments();
      const symptomCount = await Symptom.countDocuments();
      const pharmacyCount = await Pharmacy.countDocuments();
      const doctorCount = await Doctor.countDocuments();
      const slotCount = await Slot.countDocuments();

      if (medicineCount === 0) {
        await this.seedMedicines();
      }

      if (symptomCount === 0) {
        await this.seedSymptoms();
      }

      if (pharmacyCount === 0) {
        await this.seedPharmacies();
      }

      if (doctorCount === 0) {
        await this.seedDoctors();
      }

      if (slotCount === 0) {
        await this.seedSlots();
      }

      console.log('✅ Database seeding completed');
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }

  private static async seedMedicines(): Promise<void> {
    const medicines = [
      { name: "Paracetamol 500mg", stock: 42, pharmacy: "Kisan Medical Store", pincode: "140301", category: "tablet", requiresPrescription: false },
      { name: "ORS Sachet", stock: 120, pharmacy: "HealthPlus Chemist", pincode: "140301", category: "other", requiresPrescription: false },
      { name: "Amoxicillin 250mg", stock: 0, pharmacy: "Village Care Pharmacy", pincode: "140307", category: "capsule", requiresPrescription: true },
      { name: "Cetirizine 10mg", stock: 15, pharmacy: "Sehat Pharmacy", pincode: "140307", category: "tablet", requiresPrescription: false },
      { name: "Insulin (10ml)", stock: 6, pharmacy: "District Hospital Counter", pincode: "140001", category: "injection", requiresPrescription: true },
    ];

    await Medicine.insertMany(medicines);
    console.log('✅ Medicines seeded');
  }

  private static async seedSymptoms(): Promise<void> {
    const symptoms = [
      { name: "Fever", category: "general", description: "Elevated body temperature" },
      { name: "Headache", category: "neurological", description: "Pain in the head or neck area" },
      { name: "Cough", category: "respiratory", description: "Forceful expulsion of air from lungs" },
      { name: "Nausea", category: "digestive", description: "Feeling of sickness with urge to vomit" },
      { name: "Chest Pain", category: "cardiovascular", description: "Pain or discomfort in chest area" },
      { name: "Rash", category: "dermatological", description: "Skin irritation or eruption" },
      { name: "Joint Pain", category: "musculoskeletal", description: "Pain in joints or bones" },
      { name: "Shortness of Breath", category: "respiratory", description: "Difficulty breathing" },
      { name: "Dizziness", category: "neurological", description: "Feeling of lightheadedness" },
      { name: "Stomach Pain", category: "digestive", description: "Pain in abdominal area" }
    ];

    await Symptom.insertMany(symptoms);
    console.log('✅ Symptoms seeded');
  }

  private static async seedPharmacies(): Promise<void> {
    const pharmacies = [
      { name: "Kisan Medical Store", address: "Main Market, Village Center", pincode: "140301", phone: "+91-9876543210", isActive: true },
      { name: "HealthPlus Chemist", address: "Near Bus Stand", pincode: "140301", phone: "+91-9876543211", isActive: true },
      { name: "Village Care Pharmacy", address: "Primary Health Center Road", pincode: "140307", phone: "+91-9876543212", isActive: true },
      { name: "Sehat Pharmacy", address: "Civil Hospital Complex", pincode: "140307", phone: "+91-9876543213", isActive: true },
      { name: "District Hospital Counter", address: "District Hospital", pincode: "140001", phone: "+91-9876543214", isActive: true }
    ];

    await Pharmacy.insertMany(pharmacies);
    console.log('✅ Pharmacies seeded');
  }

  private static async seedDoctors(): Promise<void> {
    const hashedPassword = await bcrypt.hash('test@123', 10);
    
    const doctors = [
      {
        username: 'testdoctor',
        password: hashedPassword,
        name: 'Test Doctor',
        specialization: 'General Medicine',
        email: 'test@gmail.com',
        phone: '1234567890'
      },
      {
        username: 'docuser',
        password: hashedPassword,
        name: 'Dr. Smith',
        specialization: 'Cardiology',
        email: 'doc@gmail.com',
        phone: '9876543210'
      },
      {
        username: 'drmary',
        password: hashedPassword,
        name: 'Dr. Mary Johnson',
        specialization: 'Pediatrics',
        email: 'mary@doctor.com',
        phone: '8765432109'
      },
      {
        username: 'drpatric',
        password: hashedPassword,
        name: 'Dr. Patrick Wilson',
        specialization: 'Orthopedics',
        email: 'patrick@clinic.com',
        phone: '7654321098'
      }
    ];

    await Doctor.insertMany(doctors);
    console.log('✅ Doctors seeded');
  }

  private static async seedSlots(): Promise<void> {
    // Get all doctors to create slots for them
    const doctors = await Doctor.find();
    
    if (doctors.length === 0) {
      console.log('⚠️ No doctors found, skipping slot seeding');
      return;
    }

    const slots = [];
    const today = new Date();
    
    // Create slots for the next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(today);
      date.setDate(today.getDate() + dayOffset);
      
      // Skip Sundays
      if (date.getDay() === 0) continue;
      
      for (const doctor of doctors) {
        // Morning slots (9:00 AM - 12:00 PM)
        const morningSlots = [
          { start: '09:00', end: '09:30' },
          { start: '09:30', end: '10:00' },
          { start: '10:00', end: '10:30' },
          { start: '10:30', end: '11:00' },
          { start: '11:00', end: '11:30' },
          { start: '11:30', end: '12:00' }
        ];
        
        // Evening slots (2:00 PM - 5:00 PM)
        const eveningSlots = [
          { start: '14:00', end: '14:30' },
          { start: '14:30', end: '15:00' },
          { start: '15:00', end: '15:30' },
          { start: '15:30', end: '16:00' },
          { start: '16:00', end: '16:30' },
          { start: '16:30', end: '17:00' }
        ];
        
        const allSlots = [...morningSlots, ...eveningSlots];
        
        for (const timeSlot of allSlots) {
          slots.push({
            doctorId: doctor._id,
            date: new Date(date),
            startTime: timeSlot.start,
            endTime: timeSlot.end,
            isBooked: false,
            status: 'available'
          });
        }
      }
    }

    await Slot.insertMany(slots);
    console.log(`✅ ${slots.length} time slots seeded for ${doctors.length} doctors`);
  }
}