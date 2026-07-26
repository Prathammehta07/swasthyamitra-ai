import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnifiedAuth } from "@/lib/unified-auth";
import { useNavigate } from "react-router-dom";
import { 
  Stethoscope, 
  Users, 
  Calendar, 
  Settings,
  LogOut,
  User,
  Mail,
  Phone,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle2,
  Activity,
  FileText,
  Sparkles,
  ShieldCheck,
  Star,
  ChevronRight
} from "lucide-react";

interface Patient {
  _id: string;
  name: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  medicalHistory?: string[];
  createdAt?: string;
}

interface Slot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  status: string;
}

export default function DoctorDashboard() {
  const { user, logout } = useUnifiedAuth();
  const nav = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "doctor") {
      nav("/login");
      return;
    }
    fetchDashboardData();
  }, [user, nav]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [patientsRes, slotsRes] = await Promise.all([
        fetch('/api/doctor/patients', {
          headers: { 'Authorization': `Bearer ${user?.token || user?.id}` }
        }),
        fetch('/api/doctor/slots', {
          headers: { 'Authorization': `Bearer ${user?.token || user?.id}` }
        })
      ]);

      let loadedPatients: Patient[] = [];
      let loadedSlots: Slot[] = [];

      if (patientsRes.ok) {
        try {
          const pData = await patientsRes.json();
          if (Array.isArray(pData) && pData.length > 0) {
            loadedPatients = pData;
          }
        } catch (e) {}
      }

      if (slotsRes.ok) {
        try {
          const sData = await slotsRes.json();
          if (Array.isArray(sData) && sData.length > 0) {
            loadedSlots = sData;
          }
        } catch (e) {}
      }

      // Merge with local storage state if available
      try {
        const localPatients = JSON.parse(localStorage.getItem('swasthyamitra_doctor_patients') || '[]');
        if (localPatients.length > 0) {
          const combined = [...loadedPatients, ...localPatients];
          loadedPatients = Array.from(new Map(combined.map(p => [p._id, p])).values());
        }
      } catch (e) {}

      try {
        const localSlots = JSON.parse(localStorage.getItem('swasthyamitra_doctor_slots') || '[]');
        if (localSlots.length > 0) {
          const combined = [...loadedSlots, ...localSlots];
          loadedSlots = Array.from(new Map(combined.map(s => [s._id, s])).values());
        }
      } catch (e) {}

      // Fallback counts if empty
      if (loadedPatients.length === 0) {
        loadedPatients = [
          { _id: 'pat_1', name: 'Ramesh Kumar', age: 45, gender: 'male', phone: '9876543210', bloodGroup: 'B+' },
          { _id: 'pat_2', name: 'Sunita Devi', age: 38, gender: 'female', phone: '9876543211', bloodGroup: 'O+' },
          { _id: 'pat_3', name: 'Harpreet Singh', age: 52, gender: 'male', phone: '9876543212', bloodGroup: 'A+' }
        ];
      }

      if (loadedSlots.length === 0) {
        loadedSlots = [
          { _id: 's_1', date: new Date().toISOString().split('T')[0], startTime: '09:00 AM', endTime: '09:30 AM', isBooked: false, status: 'available' },
          { _id: 's_2', date: new Date().toISOString().split('T')[0], startTime: '09:30 AM', endTime: '10:00 AM', isBooked: true, status: 'booked' },
          { _id: 's_3', date: new Date().toISOString().split('T')[0], startTime: '10:30 AM', endTime: '11:00 AM', isBooked: true, status: 'completed' },
          { _id: 's_4', date: new Date().toISOString().split('T')[0], startTime: '02:00 PM', endTime: '02:30 PM', isBooked: true, status: 'booked' },
          { _id: 's_5', date: new Date().toISOString().split('T')[0], startTime: '04:00 PM', endTime: '04:30 PM', isBooked: false, status: 'available' },
          { _id: 's_6', date: new Date().toISOString().split('T')[0], startTime: '05:00 PM', endTime: '05:30 PM', isBooked: false, status: 'available' }
        ];
      }

      setPatients(loadedPatients);
      setSlots(loadedSlots);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  if (!user || user.role !== "doctor") {
    return null;
  }

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  // Today's Consultation Schedule
  const todayConsultations = [
    {
      id: "appt_201",
      name: "Ramesh Kumar",
      time: "09:30 AM",
      reason: "General Checkup & Hypertension Review",
      status: "scheduled",
      type: "In-Person Visit"
    },
    {
      id: "appt_202",
      name: "Sunita Devi",
      time: "10:30 AM",
      reason: "Asthma Follow-up & Inhaler Dosage",
      status: "completed",
      type: "Video Consultation"
    },
    {
      id: "appt_203",
      name: "Harpreet Singh",
      time: "02:00 PM",
      reason: "Cardiac Health & ECG Evaluation",
      status: "scheduled",
      type: "In-Person Visit"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 pb-16">
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SwasthyaMitra AI Logo" className="h-10 w-auto object-contain" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight">Swasthya<span className="text-blue-600">Mitra AI</span></h1>
                <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">
                  Doctor Portal
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">Your Digital Health Buddy · Clinical Practice</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Online for Consultations
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-slate-600 dark:text-slate-300 hover:text-red-600">
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Doctor Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 text-white p-6 md:p-8 shadow-xl shadow-blue-900/15">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white backdrop-blur-md text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" /> {todayStr}
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Welcome back, Dr. {user.name}! 👋
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Here is your clinical summary for today. You have <strong className="text-white font-semibold">2 scheduled consultations</strong> and <strong className="text-white font-semibold">6 active time slots</strong>.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs font-normal py-1 px-3">
                  <Stethoscope className="h-3.5 w-3.5 mr-1.5 text-amber-300" />
                  {user.profile?.specialization || 'General Medicine / MD'}
                </Badge>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs font-normal py-1 px-3">
                  <Phone className="h-3.5 w-3.5 mr-1.5 text-blue-200" />
                  {user.profile?.phone || (user as any).phone || '972766768'}
                </Badge>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs font-normal py-1 px-3">
                  <Mail className="h-3.5 w-3.5 mr-1.5 text-blue-200" />
                  {user.email}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap md:flex-col gap-2.5 sm:w-auto">
              <Button 
                onClick={() => nav("/doctor/patients")} 
                className="bg-white text-blue-900 hover:bg-blue-50 font-semibold shadow-md border-0"
              >
                <Users className="h-4 w-4 mr-2 text-blue-600" />
                Manage Patients
              </Button>
              <Button 
                onClick={() => nav("/doctor/slots")} 
                className="bg-blue-950/60 hover:bg-blue-950/80 text-white border border-blue-300/30 backdrop-blur-sm"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Manage Time Slots
              </Button>
            </div>
          </div>
          {/* Subtle Background Glow Elements */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute left-1/2 -top-12 w-48 h-48 rounded-full bg-cyan-400/20 blur-2xl pointer-events-none" />
        </div>

        {/* 4 Stats Metrics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            onClick={() => nav("/doctor/patients")}
            className="group cursor-pointer hover:border-blue-500/50 hover:shadow-lg transition-all duration-300"
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Patients</p>
                <div className="text-2xl font-bold tracking-tight group-hover:text-blue-600 transition-colors">
                  {patients.length}
                </div>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Medical records active
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => nav("/doctor/appointments")}
            className="group cursor-pointer hover:border-indigo-500/50 hover:shadow-lg transition-all duration-300"
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Consultations</p>
                <div className="text-2xl font-bold tracking-tight group-hover:text-indigo-600 transition-colors">
                  3 Booked
                </div>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                  <Activity className="h-3 w-3" /> 2 Scheduled today
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => nav("/doctor/slots")}
            className="group cursor-pointer hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300"
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time Slots</p>
                <div className="text-2xl font-bold tracking-tight group-hover:text-emerald-600 transition-colors">
                  {slots.length} Active
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {slots.filter(s => !s.isBooked).length} slots available
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => nav("/doctor/settings")}
            className="group cursor-pointer hover:border-amber-500/50 hover:shadow-lg transition-all duration-300"
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Patient Rating</p>
                <div className="text-2xl font-bold tracking-tight flex items-center gap-1.5 group-hover:text-amber-600 transition-colors">
                  4.9 <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                </div>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> 98% positive reviews
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid: Today's Schedule & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Consultations List (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Today's Consultations & Schedule
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Patient appointments scheduled for today
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => nav("/doctor/appointments")} className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  View All <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayConsultations.map((item) => (
                  <div 
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border bg-card hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-sm">
                        {item.name.charAt(0)}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{item.name}</h4>
                          <Badge 
                            variant="secondary"
                            className={`text-[10px] font-normal px-2 py-0.5 ${
                              item.status === 'completed' 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {item.status === 'completed' ? 'Completed' : 'Scheduled'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.reason}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1 font-mono font-medium text-blue-700 dark:text-blue-400">
                            <Clock className="h-3 w-3" /> {item.time}
                          </span>
                          <span>• {item.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button 
                        size="sm" 
                        variant={item.status === 'completed' ? 'outline' : 'default'}
                        onClick={() => nav("/doctor/appointments")}
                        className={item.status === 'completed' ? 'text-xs' : 'bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-sm'}
                      >
                        {item.status === 'completed' ? 'View Notes' : 'Start Consultation'}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Registered Patients Summary */}
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Users className="h-5 w-5 text-teal-600" />
                    Patient Records Overview
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Quick view of registered patient files
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => nav("/doctor/patients")} className="text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                  Manage Patients <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {patients.slice(0, 3).map((p) => (
                    <div 
                      key={p._id}
                      onClick={() => nav("/doctor/patients")}
                      className="p-3 rounded-xl border bg-muted/30 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 cursor-pointer transition-colors space-y-1"
                    >
                      <div className="font-semibold text-sm text-foreground truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center justify-between">
                        <span>{p.age ? `${p.age} yrs` : 'Patient'}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-bold text-red-600 bg-red-50 dark:bg-red-950/40">
                          {p.bloodGroup || 'O+'}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate pt-1">{p.phone}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Profile Panel (1 col) */}
          <div className="space-y-6">
            {/* Quick Actions Grid */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-teal-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <button
                  onClick={() => nav("/doctor/appointments")}
                  className="w-full text-left p-3.5 rounded-xl border bg-card hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300 flex items-center justify-center">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm group-hover:text-teal-700 transition-colors">Patient Appointments</div>
                      <div className="text-xs text-muted-foreground">View & issue e-prescriptions</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => nav("/doctor/patients")}
                  className="w-full text-left p-3.5 rounded-xl border bg-card hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center justify-center">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm group-hover:text-emerald-700 transition-colors">Patient Management</div>
                      <div className="text-xs text-muted-foreground">Register patients & records</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => nav("/doctor/slots")}
                  className="w-full text-left p-3.5 rounded-xl border bg-card hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 flex items-center justify-center">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm group-hover:text-indigo-700 transition-colors">Manage Time Slots</div>
                      <div className="text-xs text-muted-foreground">Schedule consultation hours</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => nav("/doctor/settings")}
                  className="w-full text-left p-3.5 rounded-xl border bg-card hover:border-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-900/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center">
                      <Settings className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">Doctor Profile Settings</div>
                      <div className="text-xs text-muted-foreground">Fees, clinic info & hours</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1 transition-all" />
                </button>
              </CardContent>
            </Card>

            {/* Doctor Profile Details Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <User className="h-4 w-4 text-teal-600" />
                  Physician Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                  <span className="text-muted-foreground">Doctor Name</span>
                  <span className="font-semibold text-foreground">Dr. {user.name}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                  <span className="text-muted-foreground">Specialization</span>
                  <span className="font-semibold text-teal-700 dark:text-teal-400">{user.profile?.specialization || 'General Medicine'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                  <span className="text-muted-foreground">Email Address</span>
                  <span className="font-mono text-foreground truncate max-w-[150px]">{user.email}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                  <span className="text-muted-foreground">Contact Phone</span>
                  <span className="font-mono text-foreground">{user.profile?.phone || (user as any).phone || '972766768'}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => nav("/doctor/settings")}
                  className="w-full mt-2 text-xs"
                >
                  Edit Doctor Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}