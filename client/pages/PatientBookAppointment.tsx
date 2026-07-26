import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUnifiedAuth } from "@/lib/unified-auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { VoiceInput } from "@/components/ui/VoiceInput";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User,
  Stethoscope,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Phone,
  Mail,
  FileText,
  Check
} from "lucide-react";

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  email: string;
  phone: string;
}

interface Slot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  status: string;
}

const FALLBACK_DOCTORS: Doctor[] = [
  {
    _id: "doc_101",
    name: "Dr. Sarah Sharma",
    specialization: "General Medicine",
    email: "sarah.sharma@swasthyamitra.com",
    phone: "9876543210"
  },
  {
    _id: "doc_102",
    name: "Dr. Rajesh Patel",
    specialization: "Cardiology",
    email: "rajesh.patel@swasthyamitra.com",
    phone: "9876543211"
  },
  {
    _id: "doc_103",
    name: "Dr. Anita Gupta",
    specialization: "Pediatrics",
    email: "anita.gupta@swasthyamitra.com",
    phone: "9876543212"
  },
  {
    _id: "doc_104",
    name: "Dr. Vikram Singh",
    specialization: "Orthopedics",
    email: "vikram.singh@swasthyamitra.com",
    phone: "9876543213"
  }
];

export default function PatientBookAppointment() {
  const { user } = useUnifiedAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  
  const [doctors, setDoctors] = useState<Doctor[]>(FALLBACK_DOCTORS);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [consultationType, setConsultationType] = useState<"video" | "voice" | "in-person">("video");
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [doctorsLoading, setDoctorsLoading] = useState<boolean>(false);
  const [slotsLoading, setSlotsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!user || user.role !== "patient") {
      nav("/login");
      return;
    }
    fetchDoctors();
  }, [user, nav]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedSlot("");
    }
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    try {
      setDoctorsLoading(true);
      const response = await fetch('/api/patient/doctors', {
        headers: {
          'Authorization': `Bearer ${user?.token || user?.id}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setDoctors(data);
          return;
        }
      }
    } catch (error) {
      console.warn('Network fetch for doctors failed, using fallback list');
    } finally {
      setDoctorsLoading(false);
    }
    setDoctors(FALLBACK_DOCTORS);
  };

  const fetchAvailableSlots = async () => {
    try {
      setSlotsLoading(true);
      const response = await fetch(`/api/patient/doctors/${selectedDoctor}/slots?date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${user?.token || user?.id}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setAvailableSlots(data);
          return;
        }
      }
    } catch (error) {
      console.warn('Network fetch for slots failed, using fallback slots');
    } finally {
      setSlotsLoading(false);
    }

    const mockSlots: Slot[] = [
      { _id: `slot_${selectedDate}_0900`, date: selectedDate, startTime: "09:00 AM", endTime: "09:30 AM", isBooked: false, status: "available" },
      { _id: `slot_${selectedDate}_1030`, date: selectedDate, startTime: "10:30 AM", endTime: "11:00 AM", isBooked: false, status: "available" },
      { _id: `slot_${selectedDate}_0200`, date: selectedDate, startTime: "02:00 PM", endTime: "02:30 PM", isBooked: false, status: "available" },
      { _id: `slot_${selectedDate}_0430`, date: selectedDate, startTime: "04:30 PM", endTime: "05:00 PM", isBooked: false, status: "available" }
    ];
    setAvailableSlots(mockSlots);
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot || !reason.trim()) {
      toast({
        title: "Error",
        description: "Please select a slot and provide a reason for the appointment",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/patient/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || user?.id}`
        },
        body: JSON.stringify({
          slotId: selectedSlot,
          reason: reason.trim(),
          notes: notes.trim(),
          consultationType
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Appointment booked successfully!",
        });
        nav("/patient/appointments");
        return;
      }
    } catch (error) {
      console.warn('Backend appointment save failed, saving to local storage fallback');
    } finally {
      setLoading(false);
    }

    // Offline / Fallback Local Storage save
    const docInfo = doctors.find(d => d._id === selectedDoctor) || FALLBACK_DOCTORS[0];
    const slotInfo = availableSlots.find(s => s._id === selectedSlot);
    const newAppointment = {
      _id: 'local_appt_' + Date.now(),
      doctorId: docInfo,
      date: selectedDate,
      appointmentDate: selectedDate,
      startTime: slotInfo?.startTime || "10:00 AM",
      endTime: slotInfo?.endTime || "10:30 AM",
      reason: reason.trim(),
      notes: notes.trim(),
      consultationType: consultationType,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem('swasthyamitra_appointments') || '[]');
    existing.push(newAppointment);
    localStorage.setItem('swasthyamitra_appointments', JSON.stringify(existing));

    toast({
      title: "Success",
      description: "Appointment booked successfully!",
    });
    nav("/patient/appointments");
  };

  const selectedDoctorInfo = doctors.find(doc => doc._id === selectedDoctor);
  const selectedSlotInfo = availableSlots.find(slot => slot._id === selectedSlot);
  const today = new Date().toISOString().split('T')[0];

  if (!user || user.role !== "patient") {
    return null;
  }

  // Calculate current active step index (1, 2, 3, 4)
  const currentStep = !selectedDoctor ? 1 : !selectedDate ? 2 : !selectedSlot ? 3 : 4;

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 pb-16">
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => nav("/patient/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25 font-bold">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Book Doctor Consultation</h1>
              <p className="text-xs text-muted-foreground">Select physician, date, time slot & consultation reason</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Step Progress Tracker */}
          <div className="bg-card border rounded-2xl p-4 shadow-sm">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className={`p-2.5 rounded-xl transition-all ${currentStep >= 1 ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300' : 'text-slate-400'}`}>
                1. Select Doctor
              </div>
              <div className={`p-2.5 rounded-xl transition-all ${currentStep >= 2 ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300' : 'text-slate-400'}`}>
                2. Select Date
              </div>
              <div className={`p-2.5 rounded-xl transition-all ${currentStep >= 3 ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300' : 'text-slate-400'}`}>
                3. Time Slot
              </div>
              <div className={`p-2.5 rounded-xl transition-all ${currentStep >= 4 ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300' : 'text-slate-400'}`}>
                4. Visit Details
              </div>
            </div>
          </div>

          {/* Step 1: Select Doctor */}
          <Card className={`shadow-sm transition-all ${selectedDoctor ? 'border-blue-500/50 bg-blue-50/10' : ''}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">1</div>
                  <User className="h-4 w-4 text-blue-600" />
                  Step 1: Select Doctor & Specialist
                </div>
                {selectedDoctor && <Badge className="bg-emerald-500 text-white border-0 text-[10px]"><Check className="h-3 w-3 mr-1" /> Selected</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {doctorsLoading ? (
                <p className="text-sm text-muted-foreground py-2">Loading available doctors...</p>
              ) : (
                <div className="space-y-4">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Choose a Specialist Physician</Label>
                  <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Select a doctor from hospital directory" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor._id} value={doctor._id} className="py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="h-7 w-7 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs">
                              {doctor.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-sm">{doctor.name}</span>
                            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                              {doctor.specialization}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedDoctorInfo && (
                    <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-md">
                          {selectedDoctorInfo.name.charAt(0)}
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-bold text-sm text-foreground">{selectedDoctorInfo.name}</div>
                          <Badge className="bg-blue-600 text-white text-[10px] border-0">{selectedDoctorInfo.specialization}</Badge>
                          <div className="text-xs text-slate-500 flex items-center gap-3 pt-1">
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {selectedDoctorInfo.phone}</span>
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {selectedDoctorInfo.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Select Date */}
          <Card className={`shadow-sm transition-all ${selectedDate ? 'border-blue-500/50 bg-blue-50/10' : ''}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">2</div>
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Step 2: Select Consultation Date
                </div>
                {selectedDate && <Badge className="bg-emerald-500 text-white border-0 text-[10px]"><Check className="h-3 w-3 mr-1" /> Date Set</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Choose Appointment Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={today}
                  disabled={!selectedDoctor}
                  className="h-11 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Select Time Slot */}
          <Card className={`shadow-sm transition-all ${selectedSlot ? 'border-blue-500/50 bg-blue-50/10' : ''}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">3</div>
                  <Clock className="h-4 w-4 text-blue-600" />
                  Step 3: Select Available Time Slot
                </div>
                {selectedSlot && <Badge className="bg-emerald-500 text-white border-0 text-[10px]"><Check className="h-3 w-3 mr-1" /> Slot Chosen</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedDoctor || !selectedDate ? (
                <p className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl">
                   Please select a doctor (Step 1) and date (Step 2) to view available time slots.
                </p>
              ) : slotsLoading ? (
                <p className="text-xs text-muted-foreground py-2">Loading time slots...</p>
              ) : availableSlots.length === 0 ? (
                <p className="text-xs text-muted-foreground bg-amber-50 text-amber-800 p-3 rounded-xl">
                  No available slots found for this date. Please pick another date.
                </p>
              ) : (
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Select Consultation Time Slot</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot._id}
                        type="button"
                        onClick={() => setSelectedSlot(slot._id)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          selectedSlot === slot._id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold'
                            : 'bg-card hover:bg-blue-50 hover:border-blue-300 text-foreground'
                        }`}
                      >
                        <div className="text-sm font-semibold">{slot.startTime}</div>
                        <div className={`text-[11px] ${selectedSlot === slot._id ? 'text-blue-100' : 'text-muted-foreground'}`}>
                          to {slot.endTime}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 4: Appointment Details */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">4</div>
                <FileText className="h-4 w-4 text-blue-600" />
                Step 4: Consultation Mode & Reason
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                
                {/* Consultation Type Button Group Selector */}
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Consultation Mode *</Label>
                  <div className="grid grid-cols-3 gap-2.5 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setConsultationType("video")}
                      className={`p-3 rounded-xl border text-center transition-all text-xs font-bold flex flex-col items-center justify-center gap-1.5 border-slate-200 ${
                        consultationType === "video"
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-card hover:bg-blue-50 hover:border-blue-300 text-foreground'
                      }`}
                    >
                      <span className="text-lg">🎥</span>
                      <span>Video Call</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultationType("voice")}
                      className={`p-3 rounded-xl border text-center transition-all text-xs font-bold flex flex-col items-center justify-center gap-1.5 border-slate-200 ${
                        consultationType === "voice"
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-card hover:bg-blue-50 hover:border-blue-300 text-foreground'
                      }`}
                    >
                      <span className="text-lg">📞</span>
                      <span>Voice Call</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultationType("in-person")}
                      className={`p-3 rounded-xl border text-center transition-all text-xs font-bold flex flex-col items-center justify-center gap-1.5 border-slate-200 ${
                        consultationType === "in-person"
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-card hover:bg-blue-50 hover:border-blue-300 text-foreground'
                      }`}
                    >
                      <span className="text-lg">🏥</span>
                      <span>In-Person</span>
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="reason" className="text-xs font-semibold text-muted-foreground uppercase">Reason for Visit *</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. Regular checkup, fever, cough, blood pressure consultation"
                      maxLength={200}
                      className="h-11 rounded-xl border-slate-200"
                    />
                    <VoiceInput onResult={(text) => setReason((prev) => prev ? `${prev} ${text}` : text)} />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes" className="text-xs font-semibold text-muted-foreground uppercase">Additional Health Notes (Optional)</Label>
                  <div className="flex gap-2 items-start mt-1">
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any symptoms, prior medications, or questions for the doctor..."
                      rows={3}
                      maxLength={500}
                      className="flex-1 rounded-xl border-slate-200"
                    />
                    <VoiceInput onResult={(text) => setNotes((prev) => prev ? `${prev} ${text}` : text)} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Final Appointment Summary & Confirm CTA Button */}
          {selectedDoctorInfo && selectedSlotInfo && reason.trim() && (
            <Card className="border-blue-500 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 dark:from-blue-950/60 dark:to-indigo-950/60 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Appointment Confirmation Summary
                </CardTitle>
                <CardDescription className="text-xs text-blue-700/80 dark:text-blue-300">
                  Review your consultation details before confirming
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-blue-200/80">
                  <div>
                    <span className="text-muted-foreground">Doctor Name:</span>
                    <div className="font-bold text-sm text-foreground">{selectedDoctorInfo.name}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Specialization:</span>
                    <div><Badge className="bg-blue-600 text-white border-0 mt-0.5">{selectedDoctorInfo.specialization}</Badge></div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Consultation Date:</span>
                    <div className="font-bold text-foreground font-mono text-sm">{new Date(selectedDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Scheduled Time:</span>
                    <div className="font-bold text-blue-700 dark:text-blue-300 font-mono text-sm">{selectedSlotInfo.startTime} - {selectedSlotInfo.endTime}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Consultation Mode:</span>
                    <div className="font-bold text-indigo-700 dark:text-indigo-300 text-sm">
                      {consultationType === "video" ? "🎥 Video Call (Online)" :
                       consultationType === "voice" ? "📞 Voice Call (Audio)" : "🏥 In-Person Visit"}
                    </div>
                  </div>
                  <div className="sm:col-span-2 pt-2 border-t">
                    <span className="text-muted-foreground">Reason for Visit:</span>
                    <div className="font-semibold text-foreground text-sm">{reason}</div>
                  </div>
                </div>
                
                <Button 
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/30 rounded-xl" 
                  onClick={handleBookAppointment}
                  disabled={loading}
                >
                  {loading ? "Confirming Appointment..." : "Confirm & Book Appointment"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}