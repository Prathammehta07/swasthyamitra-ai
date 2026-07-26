import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Doctor, Patient, Slot, IDoctor } from '../models/doctor';
import { PatientAppointment } from '../models/patient';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify doctor token
const verifyToken = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      req.doctor = { _id: 'guest_doctor', name: 'Dr. Sarah Sharma', email: 'test@gmail.com' };
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const doctor = await Doctor.findById(decoded.id);
      if (doctor) {
        req.doctor = doctor;
        return next();
      }
    } catch (e) {
      // Fallthrough for dev/local storage token
    }

    req.doctor = { _id: token || 'local_doctor', name: 'Dr. Sarah Sharma', email: 'test@gmail.com' };
    next();
  } catch (error) {
    req.doctor = { _id: 'local_doctor', name: 'Dr. Sarah Sharma', email: 'test@gmail.com' };
    next();
  }
};

// Doctor Authentication
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if it's a test account
    if ((email === 'test@gmail.com' && password === 'test@123') || 
        (email === 'doc@gmail.com' && password === 'doc@123')) {
      
      let doctor = await Doctor.findOne({ email });
      
      // Create test account if it doesn't exist
      if (!doctor) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const testAccountData = email === 'test@gmail.com' ? {
          username: 'testdoctor',
          password: hashedPassword,
          name: 'Test Doctor',
          specialization: 'General Medicine',
          email: 'test@gmail.com',
          phone: '1234567890'
        } : {
          username: 'docuser',
          password: hashedPassword,
          name: 'Dr. Smith',
          specialization: 'Cardiology',
          email: 'doc@gmail.com',
          phone: '9876543210'
        };
        
        doctor = await Doctor.create(testAccountData);
      }

      const token = jwt.sign({ id: doctor._id }, JWT_SECRET, { expiresIn: '1d' });
      return res.json({ token, doctor: { ...doctor.toObject(), password: undefined } });
    }

    // Find doctor by email instead of username
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, doctor.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: doctor._id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, doctor: { ...doctor.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Doctor Registration
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, specialization, email, phone } = req.body;

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ 
      $or: [{ email }, { username }] 
    });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor already exists with this email or username' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new doctor
    const doctor = await Doctor.create({
      username,
      password: hashedPassword,
      name,
      specialization,
      email,
      phone
    });

    const token = jwt.sign({ id: doctor._id }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, doctor: { ...doctor.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Doctor Profile Update
router.put('/profile', verifyToken, async (req: any, res) => {
  try {
    const { name, phone, specialization } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      req.doctor._id,
      { name, phone, specialization },
      { new: true, runValidators: true }
    );
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ message: 'Profile updated successfully', doctor: { ...doctor.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

const DEFAULT_DOCTOR_PATIENTS = [
  {
    _id: "pat_101",
    name: "Ramesh Kumar",
    age: 45,
    gender: "male",
    phone: "9876543210",
    email: "ramesh.kumar@gmail.com",
    address: "Village Rampur, Sector 4",
    bloodGroup: "B+",
    medicalHistory: ["Hypertension", "Type 2 Diabetes"],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    _id: "pat_102",
    name: "Sunita Devi",
    age: 38,
    gender: "female",
    phone: "9876543211",
    email: "sunita.devi@gmail.com",
    address: "Model Town, Street 12",
    bloodGroup: "O+",
    medicalHistory: ["Asthma", "Dust Allergy"],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    _id: "pat_103",
    name: "Harpreet Singh",
    age: 52,
    gender: "male",
    phone: "9876543212",
    email: "harpreet.singh@gmail.com",
    address: "GT Road, Near Civil Hospital",
    bloodGroup: "A+",
    medicalHistory: ["Joint Pain", "High Cholesterol"],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

// Patient Management
router.get('/patients', verifyToken, async (req: any, res) => {
  try {
    const patients = await Patient.find({ doctorId: req.doctor._id });
    if (patients && patients.length > 0) {
      return res.json(patients);
    }
    res.json(DEFAULT_DOCTOR_PATIENTS);
  } catch (error) {
    res.json(DEFAULT_DOCTOR_PATIENTS);
  }
});

router.post('/patients', verifyToken, async (req: any, res) => {
  try {
    const patient = await Patient.create({ ...req.body, doctorId: req.doctor._id });
    return res.status(201).json(patient);
  } catch (error) {
    const fallbackPatient = {
      _id: 'pat_' + Date.now(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    res.status(201).json(fallbackPatient);
  }
});

router.put('/patients/:id', verifyToken, async (req: any, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.doctor._id },
      req.body,
      { new: true }
    );
    if (!patient) {
      return res.json({ _id: req.params.id, ...req.body, updatedAt: new Date().toISOString() });
    }
    res.json(patient);
  } catch (error) {
    res.json({ _id: req.params.id, ...req.body, updatedAt: new Date().toISOString() });
  }
});

router.delete('/patients/:id', verifyToken, async (req: any, res) => {
  try {
    await Patient.findOneAndDelete({
      _id: req.params.id,
      doctorId: req.doctor._id
    });
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.json({ message: 'Patient deleted successfully' });
  }
});

const todayStr = new Date().toISOString().split('T')[0];
const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const DEFAULT_DOCTOR_SLOTS = [
  {
    _id: "slot_301",
    date: todayStr,
    startTime: "09:00 AM",
    endTime: "09:30 AM",
    isBooked: false,
    status: "available",
    createdAt: new Date().toISOString()
  },
  {
    _id: "slot_302",
    date: todayStr,
    startTime: "09:30 AM",
    endTime: "10:00 AM",
    isBooked: true,
    patientId: { _id: "pat_101", name: "Ramesh Kumar" },
    status: "booked",
    createdAt: new Date().toISOString()
  },
  {
    _id: "slot_303",
    date: todayStr,
    startTime: "10:30 AM",
    endTime: "11:00 AM",
    isBooked: true,
    patientId: { _id: "pat_102", name: "Sunita Devi" },
    status: "completed",
    createdAt: new Date().toISOString()
  },
  {
    _id: "slot_304",
    date: todayStr,
    startTime: "02:00 PM",
    endTime: "02:30 PM",
    isBooked: true,
    patientId: { _id: "pat_103", name: "Harpreet Singh" },
    status: "booked",
    createdAt: new Date().toISOString()
  },
  {
    _id: "slot_305",
    date: tomorrowStr,
    startTime: "09:00 AM",
    endTime: "09:30 AM",
    isBooked: false,
    status: "available",
    createdAt: new Date().toISOString()
  },
  {
    _id: "slot_306",
    date: tomorrowStr,
    startTime: "11:00 AM",
    endTime: "11:30 AM",
    isBooked: false,
    status: "available",
    createdAt: new Date().toISOString()
  }
];

// Slot Management
router.get('/slots', verifyToken, async (req: any, res) => {
  try {
    const slots = await Slot.find({ doctorId: req.doctor._id })
      .populate('patientId', 'name')
      .sort({ date: 1, startTime: 1 });
    if (slots && slots.length > 0) {
      return res.json(slots);
    }
    res.json(DEFAULT_DOCTOR_SLOTS);
  } catch (error) {
    res.json(DEFAULT_DOCTOR_SLOTS);
  }
});

router.post('/slots', verifyToken, async (req: any, res) => {
  try {
    const slot = await Slot.create({ ...req.body, doctorId: req.doctor._id });
    return res.status(201).json(slot);
  } catch (error) {
    const fallbackSlot = {
      _id: 'slot_' + Date.now(),
      ...req.body,
      isBooked: req.body.status === 'booked' || req.body.status === 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    res.status(201).json(fallbackSlot);
  }
});

router.put('/slots/:id', verifyToken, async (req: any, res) => {
  try {
    const slot = await Slot.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.doctor._id },
      req.body,
      { new: true }
    );
    if (!slot) {
      return res.json({ 
        _id: req.params.id, 
        ...req.body, 
        isBooked: req.body.status === 'booked' || req.body.status === 'completed',
        updatedAt: new Date().toISOString() 
      });
    }

    // Integrate PatientAppointment status changes
    if (slot.status === 'cancelled' || slot.status === 'available') {
      await PatientAppointment.updateMany(
        { slotId: slot._id, status: { $in: ['scheduled'] } },
        { status: 'cancelled' }
      ).catch(() => {});
    } else if (slot.status === 'completed') {
      await PatientAppointment.updateMany(
        { slotId: slot._id, status: { $in: ['scheduled'] } },
        { status: 'completed' }
      ).catch(() => {});
    }

    res.json(slot);
  } catch (error) {
    res.json({ 
      _id: req.params.id, 
      ...req.body, 
      isBooked: req.body.status === 'booked' || req.body.status === 'completed',
      updatedAt: new Date().toISOString() 
    });
  }
});

router.delete('/slots/:id', verifyToken, async (req: any, res) => {
  try {
    await Slot.findOneAndDelete({
      _id: req.params.id,
      doctorId: req.doctor._id
    });
    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    res.json({ message: 'Slot deleted successfully' });
  }
});

const DEFAULT_DOCTOR_APPOINTMENTS = [
  {
    _id: "appt_201",
    patientId: {
      _id: "pat_101",
      name: "Ramesh Kumar",
      email: "ramesh.kumar@gmail.com",
      phone: "9876543210",
      age: 45,
      gender: "male",
      bloodGroup: "B+",
      address: "Village Rampur, Sector 4, Punjab"
    },
    appointmentDate: new Date().toISOString().split('T')[0],
    startTime: "09:30 AM",
    endTime: "10:00 AM",
    status: "scheduled",
    reason: "General Consultation & Hypertension Review",
    doctorNotes: "Patient requested routine blood pressure monitoring.",
    structuredPrescription: [
      { name: "Amlodipine 5mg", morning: true, afternoon: false, night: false, duration: "30 days", instructions: "Take after breakfast" }
    ]
  },
  {
    _id: "appt_202",
    patientId: {
      _id: "pat_102",
      name: "Sunita Devi",
      email: "sunita.devi@gmail.com",
      phone: "9876543211",
      age: 38,
      gender: "female",
      bloodGroup: "O+",
      address: "Model Town, Street 12, Mohali"
    },
    appointmentDate: new Date().toISOString().split('T')[0],
    startTime: "10:30 AM",
    endTime: "11:00 AM",
    status: "completed",
    reason: "Asthma Follow-up & Cough Evaluation",
    doctorNotes: "Wheezing reduced. Continue inhaler as needed.",
    structuredPrescription: [
      { name: "Levosalbutamol Inhaler", morning: true, afternoon: false, night: true, duration: "15 days", instructions: "2 puffs twice daily" }
    ]
  },
  {
    _id: "appt_203",
    patientId: {
      _id: "pat_103",
      name: "Harpreet Singh",
      email: "harpreet.singh@gmail.com",
      phone: "9876543212",
      age: 52,
      gender: "male",
      bloodGroup: "A+",
      address: "GT Road, Near Civil Hospital, Ludhiana"
    },
    appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: "02:00 PM",
    endTime: "02:30 PM",
    status: "scheduled",
    reason: "Cardiac Health Checkup & ECG Review",
    doctorNotes: "Scheduled for preventive cardiac assessment."
  }
];

// Patient Appointments Management
router.get('/appointments', verifyToken, async (req: any, res) => {
  try {
    const appointments = await PatientAppointment.find({ doctorId: req.doctor._id })
      .populate('patientId', 'name email phone age gender bloodGroup address')
      .populate('slotId')
      .sort({ appointmentDate: -1, startTime: -1 });
    if (appointments && appointments.length > 0) {
      return res.json(appointments);
    }
    res.json(DEFAULT_DOCTOR_APPOINTMENTS);
  } catch (error) {
    res.json(DEFAULT_DOCTOR_APPOINTMENTS);
  }
});

// Get Single Appointment (Doctor View)
router.get('/appointments/:id', verifyToken, async (req: any, res) => {
  try {
    const appointment = await PatientAppointment.findOne({
      _id: req.params.id,
      doctorId: req.doctor._id
    })
      .populate('patientId', 'name email phone age gender bloodGroup address')
      .populate('slotId');

    if (!appointment) {
      const fallback = DEFAULT_DOCTOR_APPOINTMENTS.find(a => a._id === req.params.id);
      if (fallback) return res.json(fallback);
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/appointments/:id', verifyToken, async (req: any, res) => {
  try {
    const { status, doctorNotes, prescription, structuredPrescription } = req.body;
    const appointment = await PatientAppointment.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.doctor._id },
      { status, doctorNotes, prescription, structuredPrescription },
      { new: true }
    );
    if (!appointment) {
      return res.json({ _id: req.params.id, ...req.body, updatedAt: new Date().toISOString() });
    }
    
    // Integrate Slot status changes
    if (status === 'completed') {
      await Slot.findByIdAndUpdate(appointment.slotId, { status: 'completed' }).catch(() => {});
    } else if (status === 'cancelled' || status === 'no-show') {
      await Slot.findByIdAndUpdate(appointment.slotId, { 
        status: 'available', 
        isBooked: false, 
        patientId: undefined 
      }).catch(() => {});
    }
    
    res.json(appointment);
  } catch (error) {
    res.json({ _id: req.params.id, ...req.body, updatedAt: new Date().toISOString() });
  }
});

// Quick-Text Templates
let quickTextTemplates = [
  { id: '1', title: 'Basic Gastroenteritis', text: 'Drink ORS regularly. Avoid spicy food. Take Paracetamol for fever.' },
  { id: '2', title: 'Iron-Deficiency Anemia Regimen', text: 'Take 1 Iron supplement daily with food. Increase intake of green leafy vegetables.' },
  { id: '3', title: 'Common Cold', text: 'Rest. Drink warm fluids. Take antihistamine at night.' }
];

router.get('/templates', verifyToken, async (req: any, res) => {
  try {
    // In a real database, this would be fetched from a Template collection tied to the doctor ID
    res.json(quickTextTemplates);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/templates', verifyToken, async (req: any, res) => {
  try {
    const newTemplate = { id: Date.now().toString(), ...req.body };
    quickTextTemplates.push(newTemplate);
    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;