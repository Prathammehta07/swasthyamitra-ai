import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useUnifiedAuth } from "@/lib/unified-auth";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  Stethoscope, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Sparkles, 
  Key, 
  Check,
  Zap,
  LayoutDashboard,
  FileText,
  Calendar,
  Pill,
  Activity,
  Phone,
  User
} from "lucide-react";

export default function UnifiedAuth() {
  const { login, registerPatient, registerDoctor, guestLogin } = useUnifiedAuth();
  const nav = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("doctor");
  const [subMode, setSubMode] = useState<"login" | "register">("login");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [loginRole, setLoginRole] = useState<"patient" | "doctor">("doctor");

  // Form field state for 1-click autofill
  const [patientEmail, setPatientEmail] = useState("patient@test.com");
  const [patientPassword, setPatientPassword] = useState("test@123");
  const [doctorEmail, setDoctorEmail] = useState("test@gmail.com");
  const [doctorPassword, setDoctorPassword] = useState("test@123");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    
    const email = loginRole === "patient" ? patientEmail : doctorEmail;
    const password = loginRole === "patient" ? patientPassword : doctorPassword;
    
    try {
      await login(email, password, loginRole);
      
      if (loginRole === "patient") {
        nav("/patient/dashboard");
      } else if (loginRole === "doctor") {
        nav("/doctor/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  }

  async function handlePatientSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    
    if (!selectedGender) {
      setError("Please select a gender");
      return;
    }
    
    try {
      const patientData = {
        name: String(fd.get("name")),
        email: String(fd.get("email")),
        password: String(fd.get("password")),
        phone: String(fd.get("phone")),
        dateOfBirth: String(fd.get("dateOfBirth")),
        gender: selectedGender,
        address: String(fd.get("address")),
        emergencyContact: {
          name: String(fd.get("emergencyName")),
          phone: String(fd.get("emergencyPhone")),
          relationship: String(fd.get("emergencyRelationship"))
        },
        bloodGroup: selectedBloodGroup || undefined,
        medicalHistory: String(fd.get("medicalHistory")).split(',').map(item => item.trim()).filter(item => item && item.toLowerCase() !== 'na'),
        allergies: String(fd.get("allergies")).split(',').map(item => item.trim()).filter(item => item && item.toLowerCase() !== 'na'),
        currentMedications: String(fd.get("currentMedications")).split(',').map(item => item.trim()).filter(item => item)
      };
      
      await registerPatient(patientData);
      nav("/patient/dashboard");
    } catch (err: any) {
      let msg = err.message || "Registration failed";
      if (typeof msg === 'string' && (msg.startsWith('[') || msg.startsWith('{'))) {
        try {
          const parsed = JSON.parse(msg);
          if (Array.isArray(parsed) && parsed[0]?.message) {
            msg = parsed[0].message;
          }
        } catch {}
      }
      setError(msg);
    }
  }

  async function handleDoctorSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    
    if (!selectedSpecialization) {
      setError("Please select a specialization");
      return;
    }
    
    try {
      const doctorData = {
        username: String(fd.get("username")),
        password: String(fd.get("password")),
        name: String(fd.get("name")),
        specialization: selectedSpecialization,
        email: String(fd.get("email")),
        phone: String(fd.get("phone"))
      };
      
      await registerDoctor(doctorData);
      nav("/doctor/dashboard");
    } catch (err: any) {
      let msg = err.message || "Registration failed";
      if (typeof msg === 'string' && (msg.startsWith('[') || msg.startsWith('{'))) {
        try {
          const parsed = JSON.parse(msg);
          if (Array.isArray(parsed) && parsed[0]?.message) {
            msg = parsed[0].message;
          }
        } catch {}
      }
      setError(msg);
    }
  }

  function handleGuestAccess() {
    guestLogin();
    nav("/");
  }

  const handleTabChange = (role: "patient" | "doctor") => {
    setActiveTab(role);
    setLoginRole(role);
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full py-12 px-4 relative flex flex-col justify-center items-center bg-slate-50/40 dark:bg-slate-950/80 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/auth-bg.png')" }}>
      {/* Soft gradient overlay to enhance visual clarity */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 via-indigo-50/10 to-white/15 dark:from-slate-950/20 dark:to-slate-950/10 pointer-events-none" />
      
      <div className="container max-w-5xl mx-auto relative z-10">
        {/* Header Title with Logo */}
        <div className="text-center mb-10 flex flex-col items-center justify-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/80 shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" /> SwasthyaMitra AI Healthcare Portal
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
            Swasthya<span className="text-indigo-600 dark:text-indigo-400">Mitra AI</span>
          </h1>
          <p className="text-sm md:text-base font-semibold text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Your Digital Health Buddy - Telemedicine & Smart Health
          </p>
        </div>

        {/* Guest Access Direct Button */}
        <div className="flex justify-center mb-6">
          <button 
            onClick={handleGuestAccess}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs font-bold text-slate-700 dark:text-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Continue as Guest / Enter Portal Directly <ArrowRight className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          </button>
        </div>

        {/* Auth Forms Container Card */}
        <Card className="max-w-4xl mx-auto rounded-[32px] border border-slate-100 dark:border-slate-800/80 shadow-2xl shadow-indigo-950/5 dark:shadow-none overflow-hidden bg-white dark:bg-slate-900 flex flex-col md:flex-row">
          
          {/* Left Panel: Feature Highlights */}
          <div className="md:w-[40%] bg-gradient-to-b from-blue-600 via-indigo-600 to-indigo-800 text-white p-8 flex flex-col justify-between relative overflow-hidden shrink-0 border-r border-white/5">
            {/* Grid Pattern overlay */}
            <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:16px_16px]" />
            
            <div className="relative z-10 space-y-8">
              {/* Circular Stethoscope / Heart Icon */}
              <div className="flex items-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-60" />
                  <div className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-blue-500/80 flex items-center justify-center text-white">
                      {activeTab === "doctor" ? <Stethoscope className="h-5 w-5" /> : <Heart className="h-5 w-5 fill-white text-white" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Subtext */}
              <div className="space-y-3">
                <h2 className="text-2xl font-extrabold tracking-tight">
                  {activeTab === "doctor" ? "Doctor Practice Portal" : "Patient Health Portal"}
                </h2>
                <p className="text-xs text-blue-100/90 leading-relaxed font-medium">
                  Log in with your registered account credentials or register a new profile below.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-4 pt-2">
                {activeTab === "doctor" ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        <ShieldCheck className="h-4.5 w-4.5 text-blue-200" />
                      </div>
                      <span className="text-xs font-bold text-blue-50">Secure & Encrypted Login</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        <Zap className="h-4.5 w-4.5 text-blue-200" />
                      </div>
                      <span className="text-xs font-bold text-blue-50">Quick Access</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        <LayoutDashboard className="h-4.5 w-4.5 text-blue-200" />
                      </div>
                      <span className="text-xs font-bold text-blue-50">Dedicated Doctor Dashboard</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4.5 w-4.5 text-blue-200" />
                      </div>
                      <span className="text-xs font-bold text-blue-50">Secure Medical Records</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        <Calendar className="h-4.5 w-4.5 text-blue-200" />
                      </div>
                      <span className="text-xs font-bold text-blue-50">Book Consultations</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        <Pill className="h-4.5 w-4.5 text-blue-200" />
                      </div>
                      <span className="text-xs font-bold text-blue-50">Prescription Management</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Brand Wave */}
            <div className="relative z-10 pt-8 border-t border-white/10 flex items-center justify-between mt-8">
              <span className="text-xs font-bold tracking-wide text-blue-100">
                {activeTab === "doctor" ? "Your patients. Your practice." : "Your health. Your records."}
                <br />
                <span className="text-white font-extrabold">Our priority.</span>
              </span>
              <svg className="h-8 w-20 text-blue-200 opacity-60 ml-2" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M0,15 L30,15 L35,5 L40,25 L45,10 L50,20 L55,15 L100,15" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Right Panel: Tab Forms */}
          <div className="md:w-[60%] p-8 flex flex-col justify-center bg-white dark:bg-slate-900">
            {/* Main Tabs (Patient vs Doctor) */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => handleTabChange("patient")}
                className={`flex-1 pb-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeTab === "patient"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500"
                }`}
              >
                <Heart className={`h-4 w-4 ${activeTab === "patient" ? "fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400" : ""}`} />
                Patient
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("doctor")}
                className={`flex-1 pb-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeTab === "doctor"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500"
                }`}
              >
                <Stethoscope className="h-4 w-4" />
                Doctor
              </button>
            </div>

            {/* Sub-modes (Login vs Register) */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                type="button"
                onClick={() => { setSubMode("login"); setError(null); }}
                className={`py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  subMode === "login"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <ArrowRight className="h-3.5 w-3.5" /> Login
              </button>
              <button
                type="button"
                onClick={() => { setSubMode("register"); setError(null); }}
                className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                  subMode === "register"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                Register New {activeTab === "doctor" ? "Doctor" : "Patient"}
              </button>
            </div>

            {/* Form rendering */}
            {subMode === "login" ? (
              /* LOGIN FORM */
              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <Label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {activeTab === "doctor" ? "Doctor Email Address" : "Patient Email Address"}
                  </Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      value={activeTab === "doctor" ? doctorEmail : patientEmail}
                      onChange={(e) => activeTab === "doctor" ? setDoctorEmail(e.target.value) : setPatientEmail(e.target.value)}
                      type="email" 
                      required 
                      placeholder={activeTab === "doctor" ? "test@gmail.com" : "patient@test.com"}
                      className="pl-10 pr-10 h-11 rounded-xl border-slate-200 dark:border-slate-850 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 bg-slate-50/50 dark:bg-slate-900/50"
                    />
                    {((activeTab === "doctor" ? doctorEmail : patientEmail).includes("@")) && (
                      <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <Label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Password</Label>
                    <a href="#" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">Forgot Password?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={activeTab === "doctor" ? doctorPassword : patientPassword}
                      onChange={(e) => activeTab === "doctor" ? setDoctorPassword(e.target.value) : setPatientPassword(e.target.value)}
                      type="password"
                      minLength={6}
                      required
                      placeholder="••••••••"
                      className="pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-850 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 bg-slate-50/50 dark:bg-slate-900/50"
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="text-xs text-red-600 font-medium bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-2.5 rounded-lg border border-red-200">{error}</div>
                )}
                
                <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-1.5 mt-2 active:scale-[0.98] transition-transform">
                  Login as {activeTab === "doctor" ? "Doctor" : "Patient"} <ArrowRight className="h-4 w-4" />
                </Button>

                {/* Divider */}
                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-slate-100 dark:border-slate-800"></div>
                  <span className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">OR</span>
                  <div className="flex-1 border-t border-slate-100 dark:border-slate-800"></div>
                </div>

                {/* Autofill Demo Login Box */}
                <div 
                  onClick={() => {
                    if (activeTab === "doctor") {
                      setDoctorEmail("test@gmail.com");
                      setDoctorPassword("test@123");
                    } else {
                      setPatientEmail("patient@test.com");
                      setPatientPassword("test@123");
                    }
                  }}
                  className="p-3 bg-blue-50/60 dark:bg-indigo-950/20 border border-blue-100 dark:border-indigo-900/40 rounded-xl cursor-pointer hover:bg-blue-100/60 dark:hover:bg-indigo-950/30 transition-all flex items-center gap-3 text-left"
                >
                  <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                    <Key className="h-4.5 w-4.5 text-blue-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-extrabold text-blue-900 dark:text-indigo-300">
                      Click to 1-Click Autofill {activeTab === "doctor" ? "Doctor" : "Patient"} Demo Login
                    </div>
                    <div className="text-[10px] text-blue-600 dark:text-indigo-400 font-mono mt-0.5">
                      Email: <span className="underline">{activeTab === "doctor" ? "test@gmail.com" : "patient@test.com"}</span> | Password: <span className="underline">test@123</span>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              /* REGISTRATION FORMS */
              activeTab === "patient" ? (
                /* Patient Register */
                <form className="space-y-4 max-h-[50vh] overflow-y-auto pr-1" onSubmit={handlePatientSignup}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Full Name *</Label>
                      <Input name="name" required minLength={2} placeholder="Pratham Mehta" className="h-10 rounded-xl mt-1.5" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Email Address *</Label>
                      <Input name="email" type="email" required placeholder="patient@gmail.com" className="h-10 rounded-xl mt-1.5" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Phone Number *</Label>
                      <Input name="phone" type="tel" required minLength={10} placeholder="9876543210" className="h-10 rounded-xl mt-1.5" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Date of Birth *</Label>
                      <Input name="dateOfBirth" type="date" required className="h-10 rounded-xl mt-1.5" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Gender *</Label>
                      <Select value={selectedGender} onValueChange={setSelectedGender}>
                        <SelectTrigger className="h-10 rounded-xl mt-1.5">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Blood Group</Label>
                      <Select value={selectedBloodGroup} onValueChange={setSelectedBloodGroup}>
                        <SelectTrigger className="h-10 rounded-xl mt-1.5">
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Address *</Label>
                    <Textarea name="address" required rows={2} placeholder="Street, City, Pin Code" className="rounded-xl mt-1.5" />
                  </div>
                  
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">Emergency Contact Information *</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-[10px] font-bold text-slate-500">Name</Label>
                        <Input name="emergencyName" required placeholder="Name" className="h-9 rounded-lg text-xs mt-1" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold text-slate-500">Phone</Label>
                        <Input name="emergencyPhone" type="tel" required minLength={10} placeholder="Phone" className="h-9 rounded-lg text-xs mt-1" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold text-slate-500">Relationship</Label>
                        <Input name="emergencyRelationship" required placeholder="Relation" className="h-9 rounded-lg text-xs mt-1" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Password *</Label>
                    <Input name="password" type="password" minLength={6} required className="h-10 rounded-xl mt-1.5" />
                  </div>
                  
                  {error && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</div>
                  )}
                  <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md mt-2">
                    Create Patient Account
                  </Button>
                </form>
              ) : (
                /* Doctor Register */
                <form className="space-y-3 max-h-[50vh] overflow-y-auto pr-1" onSubmit={handleDoctorSignup}>
                  <div>
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Doctor Full Name *</Label>
                    <Input name="name" required minLength={2} placeholder="Dr. Pratham Mehta" className="h-10 rounded-xl mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Username *</Label>
                    <Input name="username" required minLength={3} placeholder="drpratham" className="h-10 rounded-xl mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Email Address *</Label>
                    <Input name="email" type="email" required placeholder="dr.pratham@gmail.com" className="h-10 rounded-xl mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Phone Number *</Label>
                    <Input name="phone" type="tel" required minLength={10} placeholder="9876543210" className="h-10 rounded-xl mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Medical Specialization *</Label>
                    <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                      <SelectTrigger className="h-10 rounded-xl mt-1.5">
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Medicine">General Medicine</SelectItem>
                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                        <SelectItem value="Dermatology">Dermatology</SelectItem>
                        <SelectItem value="Neurology">Neurology</SelectItem>
                        <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                        <SelectItem value="Gynecology">Gynecology</SelectItem>
                        <SelectItem value="ENT">ENT</SelectItem>
                        <SelectItem value="Ophthalmology">Ophthalmology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Password *</Label>
                    <Input name="password" type="password" minLength={6} required className="h-10 rounded-xl mt-1.5" />
                  </div>
                  {error && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</div>
                  )}
                  <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md mt-2">
                    Register as Doctor
                  </Button>
                </form>
              )
            )}
          </div>
        </Card>

        {/* Bottom Info Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto border-t border-slate-200/60 dark:border-slate-800 pt-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">HIPAA Compliant</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Data Security</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Phone className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">24/7 Support</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Always Here to Help</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Trusted by Doctors</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Across India</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Smart Health</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">AI Powered</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}