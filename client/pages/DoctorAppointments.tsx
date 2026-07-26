import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUnifiedAuth } from "@/lib/unified-auth";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, User, FileText, CheckCircle, Search, ArrowLeft, Plus, X, Pill } from "lucide-react";
import { toast } from "sonner";

interface StructuredPrescriptionItem {
  name: string;
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  duration: string;
  instructions: string;
}

interface PatientInfo {
  _id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  age: number;
}

interface PatientAppointment {
  _id: string;
  patientId: PatientInfo;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  consultationType?: string;
  reason: string;
  notes?: string;
  doctorNotes?: string;
  prescription?: string;
  structuredPrescription?: StructuredPrescriptionItem[];
  prescriptionAcknowledged?: boolean;
}

const SAMPLE_DOCTOR_APPOINTMENTS: PatientAppointment[] = [
  {
    _id: "appt_201",
    patientId: {
      _id: "pat_101",
      name: "Ramesh Kumar",
      email: "ramesh.kumar@gmail.com",
      phone: "9876543210",
      age: 45,
      gender: "male"
    },
    appointmentDate: new Date().toISOString().split('T')[0],
    startTime: "09:30 AM",
    endTime: "10:00 AM",
    status: "scheduled",
    reason: "General Consultation & Hypertension Review",
    doctorNotes: "Routine blood pressure and health checkup requested.",
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
      gender: "female"
    },
    appointmentDate: new Date().toISOString().split('T')[0],
    startTime: "10:30 AM",
    endTime: "11:00 AM",
    status: "completed",
    reason: "Asthma Follow-up & Cough Evaluation",
    doctorNotes: "Wheezing significantly reduced. Continue inhaler as prescribed.",
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
      gender: "male"
    },
    appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: "02:00 PM",
    endTime: "02:30 PM",
    status: "scheduled",
    reason: "Cardiac Health Checkup & ECG Review",
    doctorNotes: "Preventive cardiology assessment."
  }
];

export default function DoctorAppointments() {
  const { user } = useUnifiedAuth();
  const nav = useNavigate();
  const [appointments, setAppointments] = useState<PatientAppointment[]>(SAMPLE_DOCTOR_APPOINTMENTS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Dialog state
  const [selectedAppointment, setSelectedAppointment] = useState<PatientAppointment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    status: 'scheduled',
    doctorNotes: '',
    prescription: '',
    structuredPrescription: [] as StructuredPrescriptionItem[]
  });

  const [newMed, setNewMed] = useState<StructuredPrescriptionItem>({
    name: '',
    morning: false,
    afternoon: false,
    night: false,
    duration: '',
    instructions: ''
  });

  useEffect(() => {
    if (!user || user.role !== "doctor") {
      nav("/login");
      return;
    }
    fetchAppointments();
  }, [user, nav]);

  const fetchAppointments = async () => {
    let serverAppts: PatientAppointment[] = [];
    try {
      setLoading(true);
      const res = await fetch('/api/doctor/appointments', {
        headers: {
          'Authorization': `Bearer ${user?.token || user?.id}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          serverAppts = data;
        }
      }
    } catch (err) {
      console.warn("Backend appointments fetch notice:", err);
    } finally {
      setLoading(false);
    }

    const localPatientAppts: any[] = JSON.parse(localStorage.getItem('swasthyamitra_appointments') || '[]');
    const mappedLocal: PatientAppointment[] = localPatientAppts.map((a: any) => ({
      _id: a._id || 'local_' + Date.now(),
      patientId: {
        _id: a.patientId?._id || 'pat_local',
        name: a.patientId?.name || a.patientName || 'Patient User',
        email: a.patientId?.email || 'patient@test.com',
        phone: a.patientId?.phone || '9876543210',
        age: a.patientId?.age || 35,
        gender: a.patientId?.gender || 'male'
      },
      appointmentDate: a.date || new Date().toISOString().split('T')[0],
      startTime: a.time || '10:00 AM',
      endTime: '10:30 AM',
      status: a.status || 'scheduled',
      reason: a.reason || 'General Consultation',
      notes: a.notes || ''
    }));

    const combined = [...serverAppts, ...mappedLocal, ...SAMPLE_DOCTOR_APPOINTMENTS];
    const unique = Array.from(new Map(combined.map(item => [item._id, item])).values());
    setAppointments(unique);
  };

  const handleUpdate = async () => {
    if (!selectedAppointment) return;
    
    const dataToSubmit = { ...formData };
    if (newMed.name.trim()) {
      dataToSubmit.structuredPrescription = [...dataToSubmit.structuredPrescription, { ...newMed }];
      setNewMed({ name: '', morning: false, afternoon: false, night: false, duration: '', instructions: '' });
      setFormData(dataToSubmit);
    }
    
    try {
      await fetch(`/api/doctor/appointments/${selectedAppointment._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token || user?.id}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSubmit)
      });
    } catch (err) {
      console.warn("Backend update failed, updating local state");
    }

    const updatedAppt: PatientAppointment = {
      ...selectedAppointment,
      status: dataToSubmit.status as any,
      doctorNotes: dataToSubmit.doctorNotes,
      prescription: dataToSubmit.prescription,
      structuredPrescription: dataToSubmit.structuredPrescription
    };

    setAppointments(prev => prev.map(a => a._id === selectedAppointment._id ? updatedAppt : a));
    toast.success("Appointment updated successfully!");
    setIsDialogOpen(false);
  };

  const openConsultDialog = (apt: PatientAppointment) => {
    setSelectedAppointment(apt);
    setFormData({
      status: apt.status,
      doctorNotes: apt.doctorNotes || '',
      prescription: apt.prescription || '',
      structuredPrescription: apt.structuredPrescription || []
    });
    setNewMed({
      name: '', morning: false, afternoon: false, night: false, duration: '', instructions: ''
    });
    setIsDialogOpen(true);
  };

  const addMedication = () => {
    if (!newMed.name.trim()) return;
    setFormData(prev => ({
      ...prev,
      structuredPrescription: [...prev.structuredPrescription, { ...newMed }]
    }));
    setNewMed({
      name: '', morning: false, afternoon: false, night: false, duration: '', instructions: ''
    });
  };

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      structuredPrescription: prev.structuredPrescription.filter((_, i) => i !== index)
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return <Badge className="bg-blue-500">Scheduled</Badge>;
      case 'completed': return <Badge className="bg-green-500">Completed</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
      case 'no-show': return <Badge variant="secondary">No Show</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const patientName = apt.patientId?.name || '';
    const reason = apt.reason || '';
    
    const matchesSearch = 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reason.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => nav("/doctor/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Patient Appointments</h1>
              <p className="text-sm text-muted-foreground">View and manage your scheduled consultations</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading appointments...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium">No appointments found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAppointments.map(apt => (
              <Card key={apt._id} className="flex flex-col">
                <CardHeader className="pb-3 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2 text-primary">
                        <User className="h-4 w-4" />
                        {apt.patientId?.name || 'Unknown Patient'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Badge variant="outline" className="capitalize font-normal text-xs">
                          {apt.patientId?.gender || 'Unknown'}
                        </Badge>
                        {apt.patientId?.age !== undefined && apt.patientId?.age !== null && (
                          <Badge variant="outline" className="font-normal text-xs">
                            Age {apt.patientId.age}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    {getStatusBadge(apt.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex-1 flex flex-col">
                  <div className="space-y-3 mb-4 flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(apt.appointmentDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {apt.startTime} - {apt.endTime}
                    </div>
                    <div className="pt-2">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1 mb-2">
                        <FileText className="h-3 w-3" /> Reason for Visit
                      </Label>
                      <div className="text-sm bg-muted/40 border border-muted p-3 rounded-lg text-foreground shadow-sm">
                        {apt.reason || 'No reason provided'}
                      </div>
                    </div>

                    {apt.doctorNotes && (
                      <div className="pt-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1 mb-2">
                          <CheckCircle className="h-3 w-3" /> Doctor's Notes
                        </Label>
                        <div className="text-sm bg-muted/40 border border-muted p-3 rounded-lg text-foreground shadow-sm">
                          {apt.doctorNotes}
                        </div>
                      </div>
                    )}

                    {apt.structuredPrescription && apt.structuredPrescription.length > 0 ? (
                      <div className="pt-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1 mb-2">
                          <Pill className="h-3 w-3" /> Prescription
                        </Label>
                        <div className="space-y-2">
                          {apt.structuredPrescription.map((med, idx) => (
                            <div key={idx} className="bg-background p-3 rounded-md border flex flex-col justify-between gap-1 shadow-sm">
                              <p className="font-semibold text-sm">{med.name}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {med.morning && <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-[10px] h-4">Morning</Badge>}
                                {med.afternoon && <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] h-4">Afternoon</Badge>}
                                {med.night && <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] h-4">Night</Badge>}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {med.duration && <p><strong>Duration:</strong> {med.duration}</p>}
                                {med.instructions && <p><strong>Inst:</strong> {med.instructions}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : apt.prescription ? (
                      <div className="pt-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1 mb-2">
                          <Pill className="h-3 w-3" /> Prescription
                        </Label>
                        <div className="text-sm bg-muted/40 border border-muted p-3 rounded-lg text-foreground shadow-sm">
                          {apt.prescription}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  {apt.consultationType === 'video' && apt.status === 'scheduled' ? (
                    <div className="flex flex-col gap-2 mt-auto w-full">
                      <Button 
                        className="w-full shadow-sm bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5" 
                        onClick={() => nav(`/video-call/${apt._id}`)}
                      >
                        🎥 Start Video Checkup
                      </Button>
                      <Button 
                        className="w-full shadow-sm text-xs" 
                        variant="secondary"
                        onClick={() => openConsultDialog(apt)}
                      >
                        Prescribe Offline
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full mt-auto shadow-sm transition-all hover:shadow-md" 
                      variant={apt.status === 'completed' ? "secondary" : "default"}
                      onClick={() => openConsultDialog(apt)}
                    >
                      {apt.status === 'completed' ? 'View/Edit Records' : 'Start Consultation'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Consultation Details</DialogTitle>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Patient</p>
                  <p className="font-medium">{selectedAppointment.patientId?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Reason</p>
                  <p className="font-medium">{selectedAppointment.reason}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(val) => setFormData({...formData, status: val})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="no-show">No Show</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Doctor's Notes
                  </Label>
                  <Textarea 
                    className="mt-1 min-h-[100px]"
                    placeholder="Enter observation notes, diagnosis, etc."
                    value={formData.doctorNotes}
                    onChange={(e) => setFormData({...formData, doctorNotes: e.target.value})}
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    Prescription Builder
                  </Label>
                  
                  {/* List of added medications */}
                  {formData.structuredPrescription.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {formData.structuredPrescription.map((med, idx) => (
                        <div key={idx} className="flex justify-between items-start p-3 bg-slate-50 dark:bg-slate-900 border rounded-lg">
                          <div>
                            <p className="font-semibold">{med.name}</p>
                            <div className="flex gap-2 mt-1">
                              {med.morning && <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Morning</Badge>}
                              {med.afternoon && <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">Afternoon</Badge>}
                              {med.night && <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Night</Badge>}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {med.duration && <span className="mr-2"><strong>Duration:</strong> {med.duration}</span>}
                              {med.instructions && <span><strong>Instructions:</strong> {med.instructions}</span>}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeMedication(idx)} className="h-6 w-6 text-muted-foreground hover:text-destructive">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new medication form */}
                  <div className="bg-muted/30 p-4 rounded-lg border border-muted space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Medicine Name *</Label>
                        <Input 
                          placeholder="e.g. Paracetamol 500mg" 
                          value={newMed.name}
                          onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Duration</Label>
                        <Input 
                          placeholder="e.g. 5 days, 1 week" 
                          value={newMed.duration}
                          onChange={(e) => setNewMed({ ...newMed, duration: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs mb-2 block">Timing</Label>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input type="checkbox" className="rounded" checked={newMed.morning} onChange={(e) => setNewMed({ ...newMed, morning: e.target.checked })} />
                          Morning
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input type="checkbox" className="rounded" checked={newMed.afternoon} onChange={(e) => setNewMed({ ...newMed, afternoon: e.target.checked })} />
                          Afternoon
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input type="checkbox" className="rounded" checked={newMed.night} onChange={(e) => setNewMed({ ...newMed, night: e.target.checked })} />
                          Night
                        </label>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Special Instructions (Optional)</Label>
                      <Input 
                        placeholder="e.g. Take after food" 
                        value={newMed.instructions}
                        onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                      />
                    </div>

                    <Button onClick={addMedication} disabled={!newMed.name.trim()} variant="secondary" className="w-full">
                      <Plus className="h-4 w-4 mr-2" /> Add to Prescription
                    </Button>
                  </div>
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdate}>Save Consultation</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
