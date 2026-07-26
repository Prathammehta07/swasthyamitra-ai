import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUnifiedAuth } from "@/lib/unified-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Share2,
  FileText,
  Send,
  User,
  Stethoscope,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Check,
  Languages
} from "lucide-react";

interface Medication {
  name: string;
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  duration: string;
  instructions: string;
}

interface AppointmentDetails {
  _id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  reason: string;
  notes?: string;
  doctorNotes?: string;
  prescription?: string;
  structuredPrescription?: Medication[];
  consultationType?: string;
  prescriptionAcknowledged?: boolean;
  doctorId?: {
    _id: string;
    name: string;
    specialization: string;
    email: string;
    phone: string;
  };
  patientId?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    age: number;
    gender: string;
    bloodGroup?: string;
    address?: string;
  };
}

const DOCTOR_SUBTITLES = [
  "Doctor: Hello! Glad you could connect. How are you feeling today?",
  "Doctor: I see from your symptoms log that you're reporting fever and cough. When did these start?",
  "Doctor: I understand. Have you had any chills, shortness of breath, or body aches?",
  "Doctor: Alright. Please take a deep breath for me... and exhale slowly. Great.",
  "Doctor: I am going to formulate a prescription for you. Please rest, drink warm fluids, and stay hydrated.",
  "Doctor: I've added a 5-day course of Paracetamol and a cough syrup to your card. Feel free to download the prescription notes."
];

const PATIENT_SUBTITLES = [
  "Patient: Hello Doctor, thank you for joining. I've been feeling quite weak lately.",
  "Patient: The fever started two days ago. It usually peaks in the evening around 101°F.",
  "Patient: Mostly dry cough, and some mild chest congestion when I try to lie down.",
  "Patient: Yes, my throat is also a bit sore, but no severe difficulty breathing.",
  "Patient: Thank you, Doctor. I'll make sure to get plenty of rest.",
  "Patient: I will follow the instructions. Should I follow up with you next week?"
];

export default function VideoCallRoom() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { user } = useUnifiedAuth();
  const nav = useNavigate();
  const { toast } = useToast();

  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');
  const [callDuration, setCallDuration] = useState<number>(0);
  
  // Media states
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [videoMuted, setVideoMuted] = useState<boolean>(false);
  const [audioMuted, setAudioMuted] = useState<boolean>(false);
  const [screenSharing, setScreenSharing] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Subtitles & transcription simulation
  const [subtitleText, setSubtitleText] = useState<string>("Connecting call tracks...");
  const [subtitleIndex, setSubtitleIndex] = useState<number>(0);

  // Prescription Form state (for Doctor)
  const [showPrescriptionDrawer, setShowPrescriptionDrawer] = useState<boolean>(false);
  const [doctorNotes, setDoctorNotes] = useState<string>("");
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", morning: false, afternoon: false, night: false, duration: "", instructions: "" }
  ]);

  // Chat system state
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const subtitleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const beepOscillatorRef = useRef<OscillatorNode | null>(null);

  const isDoctor = user?.role === "doctor";

  // 1. Fetch Appointment Data
  useEffect(() => {
    if (!user) {
      nav("/login");
      return;
    }
    fetchAppointmentDetails();
    startMockRingingAudio();

    return () => {
      stopLocalWebcam();
      stopTimers();
    };
  }, [appointmentId, user]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      const url = isDoctor 
        ? `/api/doctor/appointments/${appointmentId}` 
        : `/api/patient/appointments/${appointmentId}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user?.token || user?.id}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAppointment(data);
        setupPrescriptionForm(data);
      } else {
        throw new Error("Could not fetch details");
      }
    } catch (e) {
      // Fallback to LocalStorage or Mock data
      console.warn("Falling back to offline appointment records");
      const localAppts = JSON.parse(localStorage.getItem('swasthyamitra_appointments') || '[]');
      const found = localAppts.find((a: any) => a._id === appointmentId);
      
      if (found) {
        // Map keys to match schema
        const normalized: AppointmentDetails = {
          _id: found._id,
          appointmentDate: found.date,
          startTime: found.startTime || found.time || "10:00 AM",
          endTime: found.endTime || "10:30 AM",
          status: found.status,
          reason: found.reason,
          notes: found.notes,
          doctorNotes: found.doctorNotes,
          structuredPrescription: found.structuredPrescription || [],
          consultationType: found.consultationType || "video",
          doctorId: found.doctorId || { name: "Dr. Sarah Sharma", specialization: "General Medicine", email: "sarah.sharma@swasthyamitra.com", phone: "9876543210" }
        };
        setAppointment(normalized);
        setupPrescriptionForm(normalized);
      } else {
        // Fallback for Doctor views if mocked
        const normalized: AppointmentDetails = {
          _id: appointmentId || "appt_mock",
          appointmentDate: new Date().toISOString().split('T')[0],
          startTime: "10:00 AM",
          endTime: "10:30 AM",
          status: "scheduled",
          reason: "Regular Health Review & Medication Consultation",
          notes: "Patient reports persistent fever and throat soreness.",
          consultationType: "video",
          patientId: { _id: "pat_mock", name: "Ramesh Kumar", email: "ramesh.kumar@gmail.com", phone: "9876543210", age: 42, gender: "male" }
        };
        setAppointment(normalized);
        setupPrescriptionForm(normalized);
      }
    } finally {
      setLoading(false);
      // Advance status
      setTimeout(() => {
        setConnectionStatus('ringing');
        setSubtitleText("Dialing peer connection...");
        setTimeout(() => {
          setConnectionStatus('connected');
          setSubtitleText(isDoctor ? "Patient connected. Start consultation." : "Doctor connected. Start consultation.");
          startCallTimer();
          startSubtitleSimulation();
          initializeLocalWebcam();
        }, 3000);
      }, 1550);
    }
  };

  const setupPrescriptionForm = (data: AppointmentDetails) => {
    if (data.doctorNotes) setDoctorNotes(data.doctorNotes);
    if (data.structuredPrescription && data.structuredPrescription.length > 0) {
      setMedications(data.structuredPrescription);
    }
  };

  // 2. Local Webcam Handling
  const initializeLocalWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
        audio: true
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.warn("Webcam access denied or unavailable. Fallback to animated avatar profile.", error);
    }
  };

  const stopLocalWebcam = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const track = localStream.getVideoTracks()[0];
      if (track) {
        const isEnabled = track.enabled;
        track.enabled = !isEnabled;
        setVideoMuted(!isEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const track = localStream.getAudioTracks()[0];
      if (track) {
        const isEnabled = track.enabled;
        track.enabled = !isEnabled;
        setAudioMuted(!isEnabled);
      }
    }
  };

  const toggleScreenShare = () => {
    setScreenSharing(!screenSharing);
    toast({
      title: screenSharing ? "Screen Sharing Stopped" : "Screen Sharing Active",
      description: screenSharing ? "Switched back to camera." : "Broadcasting screen stream to peer.",
    });
  };

  // 3. Simulated Ringing Audio Tone
  const startMockRingingAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      let ringInterval = setInterval(() => {
        if (connectionStatus === 'connected' || connectionStatus === 'ended' || !soundEnabled) {
          clearInterval(ringInterval);
          return;
        }
        playBeepTone(440, 150);
        setTimeout(() => playBeepTone(480, 150), 200);
      }, 1500);
    } catch (e) {
      console.warn("Audio Context setup skipped.", e);
    }
  };

  const playBeepTone = (frequency: number, duration: number) => {
    const ctx = audioContextRef.current;
    if (!ctx || ctx.state === "closed" || !soundEnabled) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + (duration / 1000));
    } catch (e) {}
  };

  // 4. Timers and Subtitle Simulation
  const startCallTimer = () => {
    durationTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const startSubtitleSimulation = () => {
    const subs = isDoctor ? PATIENT_SUBTITLES : DOCTOR_SUBTITLES;
    let idx = 0;
    setSubtitleText(subs[0]);

    subtitleTimerRef.current = setInterval(() => {
      idx = (idx + 1) % subs.length;
      setSubtitleIndex(idx);
      setSubtitleText(subs[idx]);
      
      // Auto push corresponding chat message
      const speakerName = isDoctor ? "Patient" : "Doctor";
      const cleanedText = subs[idx].substring(subs[idx].indexOf(":") + 2);
      
      setChatMessages(prev => [
        ...prev, 
        { 
          sender: speakerName, 
          text: cleanedText, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
      ]);
    }, 9000);
  };

  const stopTimers = () => {
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    if (subtitleTimerRef.current) clearInterval(subtitleTimerRef.current);
    if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 5. Chat System
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMessage = {
      sender: user?.name || (isDoctor ? "Doctor" : "Patient"),
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMessage]);
    setMessageInput("");
  };

  // 6. Prescription Actions (Doctor)
  const addMedicationRow = () => {
    setMedications(prev => [
      ...prev,
      { name: "", morning: false, afternoon: false, night: false, duration: "", instructions: "" }
    ]);
  };

  const removeMedicationRow = (index: number) => {
    if (medications.length === 1) return;
    setMedications(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateMedicationField = (index: number, field: keyof Medication, value: any) => {
    setMedications(prev => prev.map((med, idx) => {
      if (idx === index) {
        return { ...med, [field]: value };
      }
      return med;
    }));
  };

  const handleSavePrescription = async () => {
    const activeMeds = medications.filter(m => m.name.trim() !== "");
    if (activeMeds.length === 0 && !doctorNotes.trim()) {
      toast({
        title: "Validation Error",
        description: "Please write doctor notes or add at least one medication prescription.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`/api/doctor/appointments/${appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token || user?.id}`
        },
        body: JSON.stringify({
          status: "completed",
          doctorNotes: doctorNotes.trim(),
          prescription: activeMeds.map(m => `${m.name} (${m.duration})`).join(", "),
          structuredPrescription: activeMeds
        })
      });

      if (response.ok) {
        toast({
          title: "Prescription Transmitted",
          description: "Patient files updated successfully!",
        });
        setConnectionStatus('ended');
        stopTimers();
        stopLocalWebcam();
      } else {
        throw new Error("API call failed");
      }
    } catch (e) {
      console.warn("Backend update failed, saving prescription to local storage fallback");
      
      // Update local storage
      const localAppts = JSON.parse(localStorage.getItem('swasthyamitra_appointments') || '[]');
      const updated = localAppts.map((a: any) => {
        if (a._id === appointmentId) {
          return {
            ...a,
            status: "completed",
            doctorNotes: doctorNotes.trim(),
            structuredPrescription: activeMeds,
            prescription: activeMeds.map(m => `${m.name} (${m.duration})`).join(", ")
          };
        }
        return a;
      });
      localStorage.setItem('swasthyamitra_appointments', JSON.stringify(updated));

      toast({
        title: "Consultation Complete",
        description: "Prescription saved to local offline records successfully.",
      });
      setConnectionStatus('ended');
      stopTimers();
      stopLocalWebcam();
    }
  };

  // 7. Acknowledge Prescription (Patient)
  const handleAcknowledgeRx = async () => {
    try {
      const response = await fetch(`/api/patient/appointments/${appointmentId}/acknowledge`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${user?.token || user?.id}`
        }
      });
      if (response.ok) {
        toast({
          title: "Prescription Confirmed",
          description: "Acknowledged receipt of prescription.",
        });
        nav("/patient/appointments");
      } else {
        throw new Error("Ack failed");
      }
    } catch (e) {
      const localAppts = JSON.parse(localStorage.getItem('swasthyamitra_appointments') || '[]');
      const updated = localAppts.map((a: any) => {
        if (a._id === appointmentId) {
          return { ...a, prescriptionAcknowledged: true };
        }
        return a;
      });
      localStorage.setItem('swasthyamitra_appointments', JSON.stringify(updated));
      toast({
        title: "Offline Acknowledged",
        description: "Receipt verified in local records.",
      });
      nav("/patient/appointments");
    }
  };

  const handleEndCall = () => {
    if (window.confirm("Are you sure you want to end this consultation call?")) {
      setConnectionStatus('ended');
      stopTimers();
      stopLocalWebcam();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 font-medium">Initializing call circuits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans overflow-hidden">
      
      {/* ── Call Header ── */}
      <header className="z-10 bg-slate-950/70 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg font-bold shadow-blue-600/30">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide">SwasthyaMitra Video Consult</span>
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-bold animate-pulse px-2 py-0.5">
                {connectionStatus}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              {isDoctor ? `Patient: ${appointment?.patientId?.name || "Ramesh Kumar"}` : `Doctor: ${appointment?.doctorId?.name || "Dr. Sarah Sharma"}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {connectionStatus === 'connected' && (
            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full font-mono text-sm text-emerald-400 flex items-center gap-2 shadow-inner">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              {formatTime(callDuration)}
            </div>
          )}

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all rounded-full"
            title="Toggle Ring Tone Sound"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-slate-300" /> : <VolumeX className="h-4 w-4 text-red-400" />}
          </button>
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <div className="flex-1 flex flex-col md:flex-row relative">

        {/* Call Area */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#0c1220] to-[#080b11]">
          
          {connectionStatus === 'connecting' && (
            <div className="text-center space-y-3 z-10 bg-slate-900/60 p-8 rounded-3xl border border-slate-800 backdrop-blur-lg max-w-sm">
              <div className="h-16 w-16 bg-blue-500/10 border-2 border-blue-500 text-blue-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Video className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-lg">Resolving Call Media...</h3>
              <p className="text-xs text-slate-400">Establishing handshake protocols with secure cloud media routers.</p>
            </div>
          )}

          {connectionStatus === 'ringing' && (
            <div className="text-center space-y-4 z-10 bg-slate-900/80 p-8 rounded-3xl border border-slate-800 backdrop-blur-lg max-w-sm">
              <div className="relative mx-auto">
                <div className="absolute inset-0 bg-blue-500/30 rounded-full animate-ping"></div>
                <div className="h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-xl relative z-10">
                  <User className="h-10 w-10 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-xl">Ringing...</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Connecting to {isDoctor ? appointment?.patientId?.name : appointment?.doctorId?.name}
                </p>
              </div>
            </div>
          )}

          {connectionStatus === 'connected' && (
            <div className="w-full h-full max-w-5xl rounded-3xl overflow-hidden border border-slate-800 bg-slate-950/40 relative flex items-center justify-center shadow-2xl">
              
              {/* Remote Speaker Large Visualizer */}
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
                
                {/* Visual Speaking concentric wave loops */}
                <div className="relative">
                  <div className="absolute -inset-4 bg-blue-500/10 rounded-full animate-pulse blur-md"></div>
                  <div className="absolute -inset-10 bg-indigo-500/5 rounded-full animate-ping"></div>
                  <div className="h-32 w-32 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-full flex items-center justify-center border-4 border-slate-800 shadow-2xl">
                    {isDoctor ? (
                      <div className="h-full w-full flex flex-col items-center justify-center">
                        <User className="h-14 w-14 text-white" />
                      </div>
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center">
                        <Stethoscope className="h-14 w-14 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-xl font-bold tracking-wide">
                    {isDoctor ? appointment?.patientId?.name : appointment?.doctorId?.name}
                  </h3>
                  <p className="text-xs text-blue-400 font-mono tracking-widest uppercase">
                    {isDoctor ? "Consulting Patient" : "Attending Physician"}
                  </p>
                </div>
              </div>

              {/* Subtitles Overlay */}
              <div className="absolute bottom-6 left-6 right-6 z-10 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 px-6 py-3 rounded-2xl text-center shadow-lg">
                <p className="text-sm font-medium tracking-wide text-slate-100 italic">
                  {subtitleText}
                </p>
              </div>

              {/* Float Card local webcam stream preview */}
              <div className="absolute top-4 right-4 h-44 w-32 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-900 shadow-xl z-20 transition-all hover:scale-105">
                {localStream && !videoMuted ? (
                  <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900/90 text-slate-500">
                    <VideoOff className="h-6 w-6" />
                    <span className="text-[10px] font-bold mt-1">Camera Off</span>
                  </div>
                )}
                <div className="absolute bottom-1.5 left-2 bg-slate-950/70 px-2 py-0.5 rounded text-[9px] font-bold text-slate-300">
                  You (Self)
                </div>
              </div>

            </div>
          )}

          {connectionStatus === 'ended' && (
            <div className="text-center space-y-6 z-10 bg-slate-900/60 p-10 rounded-3xl border border-slate-800 backdrop-blur-lg max-w-md">
              <div className="h-16 w-16 bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-slate-100">Consultation Finished</h3>
                <p className="text-sm text-slate-400 mt-2">
                  The medical checkup video call session has ended.
                </p>
              </div>

              {isDoctor ? (
                <Button onClick={() => nav("/doctor/dashboard")} className="bg-blue-600 hover:bg-blue-700 w-full rounded-xl h-11 text-sm font-bold">
                  Return to Dashboard
                </Button>
              ) : (
                <div className="space-y-4">
                  {appointment?.doctorNotes || (appointment?.structuredPrescription && appointment.structuredPrescription.length > 0) ? (
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-left space-y-3">
                      <h4 className="text-xs uppercase font-bold text-blue-400">Doctor Prescribed Medications:</h4>
                      {appointment.doctorNotes && <p className="text-xs text-slate-300 font-medium italic">"{appointment.doctorNotes}"</p>}
                      <div className="space-y-1">
                        {appointment.structuredPrescription?.map((med, idx) => (
                          <div key={idx} className="text-xs text-slate-200 flex justify-between border-b border-slate-800/40 pb-1">
                            <span>💊 <strong>{med.name}</strong> - {med.duration}</span>
                            <span className="text-[10px] text-slate-400">Inst: {med.instructions}</span>
                          </div>
                        ))}
                      </div>

                      {!appointment.prescriptionAcknowledged && (
                        <Button onClick={handleAcknowledgeRx} className="w-full bg-emerald-600 hover:bg-emerald-700 h-10 text-xs font-bold mt-2">
                          Confirm & Acknowledge Rx Receipt
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Prescription details are being compiled by doctor.</p>
                  )}
                  <Button onClick={() => nav("/patient/appointments")} variant="outline" className="w-full border-slate-700 hover:bg-slate-800/50 text-slate-300 h-11 rounded-xl text-xs font-semibold">
                    Go to My Appointments List
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Action Call Controls Bar */}
          {connectionStatus === 'connected' && (
            <div className="mt-6 flex items-center justify-center gap-3 py-3 px-6 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl">
              
              <button
                onClick={toggleAudio}
                className={`p-3.5 rounded-full transition-all ${
                  audioMuted ? 'bg-red-500 text-white' : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
                }`}
                title={audioMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {audioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-3.5 rounded-full transition-all ${
                  videoMuted ? 'bg-red-500 text-white' : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
                }`}
                title={videoMuted ? "Start Camera" : "Stop Camera"}
              >
                {videoMuted ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </button>

              <button
                onClick={toggleScreenShare}
                className={`p-3.5 rounded-full transition-all ${
                  screenSharing ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
                }`}
                title="Share Screen"
              >
                <Share2 className="h-5 w-5 text-slate-300" />
              </button>

              {isDoctor ? (
                <Button
                  onClick={() => setShowPrescriptionDrawer(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 h-11 rounded-full px-5 shadow-lg shadow-emerald-600/20"
                >
                  <FileText className="h-4 w-4" />
                  Prescribe Rx
                </Button>
              ) : (
                <Button
                  onClick={() => setShowPrescriptionDrawer(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1.5 h-11 rounded-full px-5 shadow-lg shadow-indigo-600/20"
                >
                  <FileText className="h-4 w-4" />
                  View Prescription
                </Button>
              )}

              <div className="h-8 w-px bg-slate-800 mx-1"></div>

              <button
                onClick={handleEndCall}
                className="p-3.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-lg shadow-red-600/20"
                title="End Video Consultation"
              >
                <PhoneOff className="h-5 w-5" />
              </button>
            </div>
          )}

        </div>

        {/* ── Side Chat Panel ── */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950/60 backdrop-blur-md flex flex-col h-72 md:h-auto z-10 shrink-0">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-blue-400">Consultation Chat</span>
            <Badge className="bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono">
              Live Feed
            </Badge>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
            {chatMessages.length === 0 ? (
              <p className="text-slate-500 text-center py-8 italic">No chat logs recorded. Messages appear automatically as consultation conversation progresses.</p>
            ) : (
              chatMessages.map((msg, idx) => (
                <div key={idx} className={`space-y-1.5 ${msg.sender === user?.name ? 'text-right' : 'text-left'}`}>
                  <span className="text-[10px] text-slate-500 font-semibold">{msg.sender}</span>
                  <div className={`p-2.5 rounded-2xl max-w-[85%] inline-block text-left leading-relaxed ${
                    msg.sender === user?.name 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-slate-900 text-slate-300 border border-slate-800 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="block text-[8px] text-slate-600 px-1">{msg.time}</span>
                </div>
              ))
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type message to doctor..."
              disabled={connectionStatus !== 'connected'}
              className="h-9 bg-slate-900 border-slate-800 text-xs text-white rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <Button type="submit" disabled={connectionStatus !== 'connected'} size="icon" className="h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-700 shrink-0">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>

      </div>

      {/* ── Prescription Overlay Drawer Panel ── */}
      {showPrescriptionDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-end">
          <div className="h-full w-full max-w-xl bg-slate-900 text-white border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-500" />
                <h3 className="font-bold text-base">Prescription Consultation Sheet</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowPrescriptionDrawer(false)} className="text-slate-400 hover:bg-slate-800/80 rounded-full h-8 w-8">
                ✕
              </Button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {isDoctor ? (
                // DOCTOR FORM VIEW
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="doctorNotes" className="text-xs font-bold text-slate-300 uppercase tracking-wide">Diagnosis Notes / Consult Remarks *</Label>
                    <Textarea
                      id="doctorNotes"
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      placeholder="Write doctor's evaluation, symptom assessment, and lifestyle advice..."
                      rows={4}
                      className="bg-slate-950 border-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <Label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Prescribed Medications</Label>
                      <Button onClick={addMedicationRow} variant="outline" size="sm" className="h-8 border-slate-700 bg-slate-900 text-xs font-bold text-slate-300 hover:bg-slate-800">
                        <Plus className="h-3 w-3 mr-1" /> Add Pill
                      </Button>
                    </div>

                    {medications.map((med, idx) => (
                      <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3 relative shadow-inner">
                        {medications.length > 1 && (
                          <button
                            onClick={() => removeMedicationRow(idx)}
                            className="absolute top-3 right-3 text-slate-500 hover:text-red-400 transition-colors"
                            title="Delete medicine"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <Label className="text-[10px] text-slate-400 uppercase font-semibold">Medicine Name *</Label>
                            <Input
                              value={med.name}
                              onChange={(e) => updateMedicationField(idx, "name", e.target.value)}
                              placeholder="e.g. Paracetamol 650mg, Amoxicillin"
                              className="bg-slate-900 border-slate-850 h-9 text-xs rounded-lg mt-1"
                            />
                          </div>

                          <div>
                            <Label className="text-[10px] text-slate-400 uppercase font-semibold">Duration *</Label>
                            <Input
                              value={med.duration}
                              onChange={(e) => updateMedicationField(idx, "duration", e.target.value)}
                              placeholder="e.g. 5 days, 3 weeks"
                              className="bg-slate-900 border-slate-850 h-9 text-xs rounded-lg mt-1"
                            />
                          </div>

                          <div>
                            <Label className="text-[10px] text-slate-400 uppercase font-semibold">Special Instructions</Label>
                            <Input
                              value={med.instructions}
                              onChange={(e) => updateMedicationField(idx, "instructions", e.target.value)}
                              placeholder="e.g. Take after meals"
                              className="bg-slate-900 border-slate-850 h-9 text-xs rounded-lg mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-[10px] text-slate-400 uppercase font-semibold">Daily Timing Schedule</Label>
                          <div className="flex gap-4 mt-2">
                            <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={med.morning}
                                onChange={(e) => updateMedicationField(idx, "morning", e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-600 bg-slate-900 h-4 w-4 border-slate-700"
                              />
                              <span>Morning</span>
                            </label>
                            <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={med.afternoon}
                                onChange={(e) => updateMedicationField(idx, "afternoon", e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-600 bg-slate-900 h-4 w-4 border-slate-700"
                              />
                              <span>Afternoon</span>
                            </label>
                            <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={med.night}
                                onChange={(e) => updateMedicationField(idx, "night", e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-600 bg-slate-900 h-4 w-4 border-slate-700"
                              />
                              <span>Night</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // PATIENT VIEW ONLY
                <div className="space-y-6">
                  {appointment?.doctorNotes || (appointment?.structuredPrescription && appointment.structuredPrescription.length > 0) ? (
                    <div className="space-y-6">
                      
                      {appointment.doctorNotes && (
                        <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                          <Label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Diagnosis Notes & Remarks</Label>
                          <p className="text-sm text-slate-200 mt-1 leading-relaxed italic">
                            "{appointment.doctorNotes}"
                          </p>
                        </div>
                      )}

                      {appointment.structuredPrescription && appointment.structuredPrescription.length > 0 && (
                        <div className="space-y-3">
                          <Label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Prescribed Medications</Label>
                          <div className="space-y-3">
                            {appointment.structuredPrescription.map((med, idx) => (
                              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 shadow-inner">
                                <h4 className="font-bold text-slate-100 flex items-center justify-between text-sm">
                                  <span>💊 {med.name}</span>
                                  <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px]">
                                    {med.duration}
                                  </Badge>
                                </h4>
                                
                                <div className="flex gap-2">
                                  {med.morning && <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[10px]">Morning</Badge>}
                                  {med.afternoon && <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[10px]">Afternoon</Badge>}
                                  {med.night && <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">Night</Badge>}
                                </div>

                                {med.instructions && (
                                  <p className="text-xs text-slate-400 mt-1 pt-1 border-t border-slate-900">
                                    <strong>Inst:</strong> {med.instructions}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="text-center py-12 bg-slate-950 p-6 rounded-2xl border border-slate-850">
                      <AlertCircle className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                      <h4 className="font-bold text-sm text-slate-300">Prescription not compiled yet</h4>
                      <p className="text-xs text-slate-500 mt-1.5">
                        Please wait. The Doctor is formulating your prescription timings and medications. It will populate here in real-time.
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Footer Submit Actions */}
            <div className="p-5 border-t border-slate-800 bg-slate-950/40">
              {isDoctor ? (
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowPrescriptionDrawer(false)} className="flex-1 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white h-11 rounded-xl text-xs font-semibold">
                    Continue Consultation
                  </Button>
                  <Button onClick={handleSavePrescription} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl text-xs shadow-lg shadow-emerald-600/20">
                    <Check className="h-4 w-4 mr-1.5" /> Save & Send Rx
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointment?.doctorNotes || (appointment?.structuredPrescription && appointment.structuredPrescription.length > 0) ? (
                    <Button onClick={handleAcknowledgeRx} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl text-xs">
                      <Check className="h-4 w-4 mr-1.5" /> Acknowledge Prescription Receipt
                    </Button>
                  ) : (
                    <Button disabled className="w-full bg-slate-800 text-slate-500 h-11 rounded-xl text-xs">
                      Awaiting Prescriber Submission
                    </Button>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
