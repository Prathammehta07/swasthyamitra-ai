import mongoose, { Schema, Document } from 'mongoose';

// Medicine Model
export interface IMedicine extends Document {
  name: string;
  stock: number;
  pharmacy: string;
  pincode: string;
  price?: number;
  manufacturer?: string;
  expiryDate?: Date;
  batchNumber?: string;
  category?: string;
  dosage?: string;
  activeIngredient?: string;
  requiresPrescription?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineSchema = new Schema<IMedicine>({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  pharmacy: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  price: {
    type: Number,
    min: 0
  },
  manufacturer: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date,
    index: true
  },
  batchNumber: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true,
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'other'],
    default: 'other'
  },
  dosage: {
    type: String,
    trim: true
  },
  activeIngredient: {
    type: String,
    trim: true
  },
  requiresPrescription: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
MedicineSchema.index({ pincode: 1, name: 1 });
MedicineSchema.index({ pharmacy: 1, stock: 1 });

export const Medicine = mongoose.models.Medicine || mongoose.model<IMedicine>('Medicine', MedicineSchema);

// Symptom Check Record Model
export interface ISymptomRecord extends Document {
  sessionId?: string;
  userAge: number;
  userGender?: 'male' | 'female' | 'other';
  symptoms: string[];
  notes?: string;
  duration?: string;
  severity?: number;
  medicalHistory?: string[];
  triageLevel: 'self_care' | 'pharmacist' | 'doctor' | 'urgent' | 'emergency';
  advice: string;
  redFlags: string[];
  possibleConditions?: string[];
  recommendations?: string[];
  followUpInDays?: number;
  aiAnalysis?: string;
  confidence?: number;
  useAI: boolean;
  differential?: {
    condition: string;
    probability: number;
    reasoning: string;
  }[];
  criticalSigns?: string[];
  preventiveMeasures?: string[];
  aiTriageLevel?: 'self_care' | 'pharmacist' | 'doctor' | 'urgent' | 'emergency';
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SymptomRecordSchema = new Schema<ISymptomRecord>({
  sessionId: {
    type: String,
    trim: true,
    index: true
  },
  userAge: {
    type: Number,
    required: true,
    min: 0,
    max: 120
  },
  userGender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  symptoms: [{
    type: String,
    required: true,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  duration: {
    type: String,
    trim: true
  },
  severity: {
    type: Number,
    min: 1,
    max: 10
  },
  medicalHistory: [{
    type: String,
    trim: true
  }],
  triageLevel: {
    type: String,
    required: true,
    enum: ['self_care', 'pharmacist', 'doctor', 'urgent', 'emergency']
  },
  advice: {
    type: String,
    required: true,
    trim: true
  },
  redFlags: [{
    type: String,
    trim: true
  }],
  possibleConditions: [{
    type: String,
    trim: true
  }],
  recommendations: [{
    type: String,
    trim: true
  }],
  followUpInDays: {
    type: Number,
    min: 0
  },
  aiAnalysis: {
    type: String,
    trim: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  useAI: {
    type: Boolean,
    required: true,
    default: false
  },
  differential: [{
    condition: {
      type: String,
      required: true,
      trim: true
    },
    probability: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    reasoning: {
      type: String,
      required: true,
      trim: true
    }
  }],
  criticalSigns: [{
    type: String,
    trim: true
  }],
  preventiveMeasures: [{
    type: String,
    trim: true
  }],
  aiTriageLevel: {
    type: String,
    enum: ['self_care', 'pharmacist', 'doctor', 'urgent', 'emergency']
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for analytics and querying
SymptomRecordSchema.index({ createdAt: 1 });
SymptomRecordSchema.index({ triageLevel: 1, createdAt: 1 });
SymptomRecordSchema.index({ sessionId: 1, createdAt: 1 });

export const SymptomRecord = mongoose.models.SymptomRecord || mongoose.model<ISymptomRecord>('SymptomRecord', SymptomRecordSchema);

// Pharmacy Model
export interface IPharmacy extends Document {
  name: string;
  address: string;
  pincode: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  openingHours?: {
    [day: string]: {
      open: string;
      close: string;
    };
  };
  isActive: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PharmacySchema = new Schema<IPharmacy>({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  licenseNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  openingHours: {
    type: Map,
    of: {
      open: String,
      close: String
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  }
}, {
  timestamps: true
});

// Geospatial index for location-based queries
PharmacySchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

export const Pharmacy = mongoose.models.Pharmacy || mongoose.model<IPharmacy>('Pharmacy', PharmacySchema);

// Available Symptoms Model (for the symptoms list endpoint)
export interface ISymptom extends Document {
  name: string;
  category: string;
  description?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  bodyPart?: string[];
  commonCauses?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SymptomSchema = new Schema<ISymptom>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true,
    enum: ['general', 'respiratory', 'digestive', 'neurological', 'cardiovascular', 'dermatological', 'musculoskeletal', 'other']
  },
  description: {
    type: String,
    trim: true
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe']
  },
  bodyPart: [{
    type: String,
    trim: true
  }],
  commonCauses: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

export const Symptom = mongoose.models.Symptom || mongoose.model<ISymptom>('Symptom', SymptomSchema);