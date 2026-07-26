import mongoose, { Schema, Document } from 'mongoose';

// Patient User Model (for patient login/registration)
export interface IPatientUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: Date;
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
  dependentPatients?: {
    name: string;
    relationship: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other';
    medicalHistory?: string[];
    allergies?: string[];
    currentMedications?: string[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Patient Appointment Model (for patient's view of appointments)
export interface IPatientAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  slotId: mongoose.Types.ObjectId;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  consultationType?: 'video' | 'voice' | 'in-person';
  reason: string;
  notes?: string;
  doctorNotes?: string;
  prescription?: string;
  structuredPrescription?: {
    name: string;
    morning: boolean;
    afternoon: boolean;
    night: boolean;
    duration: string;
    instructions: string;
  }[];
  prescriptionAcknowledged?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PatientUserSchema = new Schema<IPatientUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'other'],
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    emergencyContact: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      relationship: {
        type: String,
        required: true,
      },
    },
    medicalHistory: [String],
    allergies: [String],
    currentMedications: [{
      name: String,
      morning: Boolean,
      afternoon: Boolean,
      night: Boolean,
      duration: String,
      instructions: String
    }],
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    dependentPatients: [
      {
        name: { type: String, required: true },
        relationship: { type: String, required: true },
        dateOfBirth: { type: Date, required: true },
        gender: { type: String, enum: ['male', 'female', 'other'], required: true },
        medicalHistory: [String],
        allergies: [String],
        currentMedications: [{
          name: String,
          morning: Boolean,
          afternoon: Boolean,
          night: Boolean,
          duration: String,
          instructions: String
        }]
      }
    ]
  },
  { timestamps: true }
);

const PatientAppointmentSchema = new Schema<IPatientAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'PatientUser',
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    slotId: {
      type: Schema.Types.ObjectId,
      ref: 'Slot',
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    consultationType: {
      type: String,
      enum: ['video', 'voice', 'in-person'],
      default: 'in-person',
    },
    reason: {
      type: String,
      required: true,
    },
    notes: String,
    doctorNotes: String,
    prescription: String,
    structuredPrescription: [{
      name: String,
      morning: Boolean,
      afternoon: Boolean,
      night: Boolean,
      duration: String,
      instructions: String
    }],
    prescriptionAcknowledged: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Clear mongoose models cache to prevent HMR issues stripping new schema fields
if (mongoose.models.PatientUser) delete mongoose.models.PatientUser;
if (mongoose.models.PatientAppointment) delete mongoose.models.PatientAppointment;

export const PatientUser = mongoose.model<IPatientUser>('PatientUser', PatientUserSchema);
export const PatientAppointment = mongoose.model<IPatientAppointment>('PatientAppointment', PatientAppointmentSchema);