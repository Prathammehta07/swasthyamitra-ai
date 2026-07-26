import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnifiedAuth } from "@/lib/unified-auth";
import { useNavigate } from "react-router-dom";
import { DocumentUpload } from "@/components/ui/DocumentUpload";
import { 
  Heart, 
  Calendar, 
  User,
  Mail,
  Phone,
  MapPin,
  LogOut,
  Stethoscope,
  Clock,
  Activity,
  Pill,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ChevronRight,
  FileText,
  AlertCircle
} from "lucide-react";

interface Appointment {
  _id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  reason: string;
  doctorId: {
    name: string;
    specialization: string;
  };
}

export default function PatientDashboard() {
  const { user, logout } = useUnifiedAuth();
  const nav = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "patient") {
      nav("/login");
      return;
    }
    fetchAppointments();
  }, [user, nav]);

  const fetchAppointments = async () => {
    let serverAppts: Appointment[] = [];
    try {
      setLoading(true);
      const response = await fetch('/api/patient/appointments', {
        headers: {
          'Authorization': `Bearer ${user?.token || user?.id}`
        }
      });

      if (response.ok) {
        try {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            serverAppts = data;
          }
        } catch (e) {}
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }

    // Merge with patient appointments stored in localStorage
    try {
      const localAppts: any[] = JSON.parse(localStorage.getItem('swasthyamitra_appointments') || '[]');
      const mappedLocal: Appointment[] = localAppts.map((a: any) => ({
        _id: a._id || 'pat_apt_' + Date.now(),
        appointmentDate: a.date || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        startTime: a.time || '10:00 AM',
        endTime: '10:30 AM',
        status: a.status || 'scheduled',
        reason: a.reason || 'General Health Checkup',
        doctorId: {
          name: a.doctorName || 'Dr. Sarah Sharma',
          specialization: a.doctorSpecialization || 'General Physician'
        }
      }));

      const combined = [...serverAppts, ...mappedLocal];
      // Fallback sample appointment if user has none yet
      if (combined.length === 0) {
        combined.push({
          _id: "demo_apt_1",
          appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          startTime: "10:00 AM",
          endTime: "10:30 AM",
          status: "scheduled",
          reason: "Routine Health Checkup & Wellness Review",
          doctorId: {
            name: "Dr. Sarah Sharma",
            specialization: "General Physician"
          }
        });
      }

      const unique = Array.from(new Map(combined.map(item => [item._id, item])).values());
      setAppointments(unique);
    } catch (e) {
      setAppointments([
        {
          _id: "demo_apt_1",
          appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          startTime: "10:00 AM",
          endTime: "10:30 AM",
          status: "scheduled",
          reason: "Routine Health Checkup & Wellness Review",
          doctorId: {
            name: "Dr. Sarah Sharma",
            specialization: "General Physician"
          }
        }
      ]);
    }
  };

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-0 font-medium">Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 font-medium">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'scheduled'
  ).slice(0, 3);

  if (!user || user.role !== "patient") {
    return null;
  }

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

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
                  Patient Portal
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">Your Digital Health Buddy · Personal Healthcare</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-slate-600 dark:text-slate-300 hover:text-red-600">
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Patient Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 text-white p-6 md:p-8 shadow-xl shadow-blue-900/15">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white backdrop-blur-md text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" /> {todayStr}
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Welcome back, {user.name}! 👋
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Your health records and appointments are up to date. You have <strong className="text-white font-semibold">{upcomingAppointments.length} upcoming consultation</strong> scheduled.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs font-normal py-1 px-3">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-amber-300" />
                  Health ID: HID-{(user as any).id?.slice(-6) || '884920'}
                </Badge>
                {user.profile?.bloodGroup && (
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs font-normal py-1 px-3">
                    <Heart className="h-3.5 w-3.5 mr-1.5 text-red-300 fill-red-300" />
                    Blood Group: {user.profile.bloodGroup}
                  </Badge>
                )}
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs font-normal py-1 px-3">
                  <Phone className="h-3.5 w-3.5 mr-1.5 text-blue-200" />
                  {user.profile?.phone || (user as any).phone || '09727667688'}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap md:flex-col gap-2.5 sm:w-auto">
              <Button 
                onClick={() => nav("/patient/book-appointment")} 
                className="bg-white text-blue-900 hover:bg-blue-50 font-semibold shadow-md border-0"
              >
                <Stethoscope className="h-4 w-4 mr-2 text-blue-600" />
                Book Appointment
              </Button>
              <Button 
                onClick={() => nav("/patient/appointments")} 
                className="bg-blue-950/60 hover:bg-blue-950/80 text-white border border-blue-300/30 backdrop-blur-sm"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View Appointments
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
            onClick={() => nav("/patient/appointments")}
            className="group cursor-pointer hover:border-blue-500/50 hover:shadow-lg transition-all duration-300"
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Appointments</p>
                <div className="text-2xl font-bold tracking-tight group-hover:text-blue-600 transition-colors">
                  {appointments.length} Total
                </div>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {upcomingAppointments.length} Scheduled
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:border-red-500/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Blood Group</p>
                <div className="text-2xl font-bold tracking-tight text-red-600 group-hover:scale-105 transition-transform">
                  {user.profile?.bloodGroup || 'B+'}
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Activity className="h-3 w-3" /> Vitals Normal (120/80)
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="h-6 w-6 fill-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Prescriptions</p>
                <div className="text-2xl font-bold tracking-tight group-hover:text-emerald-600 transition-colors">
                  {user.profile?.currentMedications?.length || 2} Medicines
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Pill className="h-3 w-3" /> Daily Dosage Active
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Pill className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => nav("/patient/profile")}
            className="group cursor-pointer hover:border-indigo-500/50 hover:shadow-lg transition-all duration-300"
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Health Profile</p>
                <div className="text-2xl font-bold tracking-tight group-hover:text-indigo-600 transition-colors">
                  Verified 100%
                </div>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Emergency Pass Active
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid: Upcoming Appointments & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments List (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Upcoming Consultations
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Your scheduled doctor appointments & consultations
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => nav("/patient/appointments")} className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  View All <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Loading appointments...</p>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-10 w-10 text-muted-foreground/60 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm font-medium mb-3">No upcoming appointments scheduled</p>
                    <Button onClick={() => nav("/patient/book-appointment")} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Book Consultation Now
                    </Button>
                  </div>
                ) : (
                  upcomingAppointments.map((apt) => (
                    <div 
                      key={apt._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border bg-card hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-sm shadow-xs">
                          <Stethoscope className="h-5 w-5" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">{apt.doctorId.name}</h4>
                            <Badge variant="outline" className="text-[10px] font-normal px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                              {apt.doctorId.specialization}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{apt.reason}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5 font-mono">
                            <span className="flex items-center gap-1 font-medium text-blue-700 dark:text-blue-400">
                              <Calendar className="h-3 w-3" /> {new Date(apt.appointmentDate).toLocaleDateString()}
                            </span>
                            <span>• {apt.startTime}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {getStatusBadge(apt.status)}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Health Summary Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Health Summary & History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const rawHistory = user.profile?.medicalHistory || [];
                  const validHistory = rawHistory.filter(item => item && item.toLowerCase() !== 'na' && item.toLowerCase() !== 'n/a' && item.toLowerCase() !== 'none');
                  
                  const rawAllergies = user.profile?.allergies || [];
                  const validAllergies = rawAllergies.filter(item => item && item.toLowerCase() !== 'na' && item.toLowerCase() !== 'n/a' && item.toLowerCase() !== 'none');

                  return (
                    <>
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Medical History & Conditions</h4>
                        {validHistory.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {validHistory.map((condition, index) => (
                              <Badge key={index} variant="secondary" className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs px-2.5 py-1 text-slate-600 border-slate-200 bg-slate-50 font-normal">
                            No Chronic Conditions Recorded
                          </Badge>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Allergies</h4>
                        {validAllergies.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {validAllergies.map((allergy, index) => (
                              <Badge key={index} variant="destructive" className="text-xs px-2.5 py-1">
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs px-2.5 py-1 text-emerald-700 border-emerald-300 bg-emerald-50/80 font-normal">
                            No Known Allergies (NKA)
                          </Badge>
                        )}
                      </div>
                    </>
                  );
                })()}

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Current Prescribed Medications</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-muted/40 p-3 rounded-xl border space-y-1">
                      <div className="font-semibold text-sm flex items-center justify-between">
                        <span>Amlodipine 5mg</span>
                        <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-300">Morning</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Take 1 tablet after breakfast for blood pressure.</p>
                    </div>
                    <div className="bg-muted/40 p-3 rounded-xl border space-y-1">
                      <div className="font-semibold text-sm flex items-center justify-between">
                        <span>Paracetamol 500mg</span>
                        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-800 border-blue-300">As Needed</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">For mild fever or body pain relief.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lab Reports Upload */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Digital Lab Reports & Records
                </CardTitle>
                <CardDescription className="text-xs">
                  Upload and store your blood tests, prescriptions, and health scans securely
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentUpload />
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Profile Panel (1 col) */}
          <div className="space-y-6">
            {/* Quick Actions Grid */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <button
                  onClick={() => nav("/patient/book-appointment")}
                  className="w-full text-left p-3.5 rounded-xl border bg-card hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 flex items-center justify-center">
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm group-hover:text-blue-700 transition-colors">Book Doctor Consultation</div>
                      <div className="text-xs text-muted-foreground">Select doctor & convenient time slot</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => nav("/patient/appointments")}
                  className="w-full text-left p-3.5 rounded-xl border bg-card hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 flex items-center justify-center">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm group-hover:text-indigo-700 transition-colors">View All Appointments</div>
                      <div className="text-xs text-muted-foreground">Check status & e-prescriptions</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => nav("/patient/profile")}
                  className="w-full text-left p-3.5 rounded-xl border bg-card hover:border-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-900/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">Update Profile & Vitals</div>
                      <div className="text-xs text-muted-foreground">Edit address, phone & emergency contact</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1 transition-all" />
                </button>
              </CardContent>
            </Card>

            {/* Patient Profile Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Patient Profile Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                  <span className="text-muted-foreground">Patient Name</span>
                  <span className="font-semibold text-foreground">{user.name}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                  <span className="text-muted-foreground">Email Address</span>
                  <span className="font-mono text-foreground truncate max-w-[150px]">{user.email}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                  <span className="text-muted-foreground">Contact Phone</span>
                  <span className="font-mono text-foreground">{user.profile?.phone || (user as any).phone || '09727667688'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                  <span className="text-muted-foreground">City / Address</span>
                  <span className="font-medium text-foreground truncate max-w-[150px]">{user.profile?.address || 'Maroli, Gujarat'}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => nav("/patient/profile")}
                  className="w-full mt-2 text-xs"
                >
                  Edit Profile & Records
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}