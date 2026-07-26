import mongoose, { Schema, Document } from 'mongoose';

// Doctor Model
export interface IDoctor extends Document {
  username: string;
  password: string;
  name: string;
  specialization: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

// Patient Model
export interface IPatient extends Document {
  name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  address: string;
  medicalHistory?: string[];
  doctorId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Appointment Slot Model
export interface ISlot extends Document {
  doctorId: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  patientId?: mongoose.Types.ObjectId;
  status: 'available' | 'booked' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const PatientSchema = new Schema<IPatient>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'other'],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    medicalHistory: [String],
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
  },
  { timestamps: true }
);

const SlotSchema = new Schema<ISlot>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    date: {
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
    isBooked: {
      type: Boolean,
      default: false,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
    },
    status: {
      type: String,
      enum: ['available', 'booked', 'completed', 'cancelled'],
      default: 'available',
    },
  },
  { timestamps: true }
);

export const Doctor = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);
export const Patient = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
export const Slot = mongoose.models.Slot || mongoose.model<ISlot>('Slot', SlotSchema);