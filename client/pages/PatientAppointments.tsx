import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnifiedAuth } from "@/lib/unified-auth";
import { safeJsonResponse } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { VoicePrescription } from "@/components/ui/VoicePrescription";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User,
  Stethoscope,
  Plus,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Appointment {
  _id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
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
  consultationType?: string;
  doctorId: {
    _id: string;
    name: string;
    specialization: string;
    email: string;
    phone: string;
  };
  slotId: string;
  createdAt: string;
}

export default function PatientAppointments() {
  const { user } = useUnifiedAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancellingId, setCancellingId] = useState<string>("");

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
        const data = await response.json();
        if (Array.isArray(data)) {
          serverAppts = data;
        }
      }
    } catch (error) {
      console.warn('Network fetch for appointments failed, merging local fallback appointments');
    } finally {
      setLoading(false);
    }

    const localAppts: Appointment[] = JSON.parse(localStorage.getItem('swasthyamitra_appointments') || '[]');
    setAppointments([...serverAppts, ...localAppts]);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      setCancellingId(appointmentId);
      const response = await fetch(`/api/patient/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token || user?.id}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Appointment cancelled successfully",
        });
        // Refresh appointments list
        fetchAppointments();
      } else {
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const error = await response.json();
            toast({
              title: "Error",
              description: error.message || "Failed to cancel appointment",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Error",
              description: `Server error: ${response.status}`,
              variant: "destructive"
            });
          }
        } catch (e) {
          toast({
            title: "Error",
            description: "Failed to cancel appointment",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive"
      });
    } finally {
      setCancellingId("");
    }
  };

  const handleAcknowledge = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/patient/appointments/${appointmentId}/acknowledge`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token || user?.id}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Prescription acknowledged successfully",
        });
        fetchAppointments();
      } else {
        toast({
          title: "Error",
          description: "Failed to acknowledge prescription",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to acknowledge prescription",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <Clock className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const isUpcoming = (appointment: Appointment) => {
    const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.startTime}`);
    return appointmentDateTime >= new Date() && appointment.status === 'scheduled';
  };

  const isPast = (appointment: Appointment) => {
    const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.startTime}`);
    return appointmentDateTime < new Date();
  };

  const canCancel = (appointment: Appointment) => {
    return appointment.status === 'scheduled' && isUpcoming(appointment);
  };

  // Sort appointments: upcoming first, then by date
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(`${a.appointmentDate}T${a.startTime}`);
    const dateB = new Date(`${b.appointmentDate}T${b.startTime}`);
    
    // If both are upcoming or both are past, sort by date
    if (isUpcoming(a) === isUpcoming(b)) {
      return dateB.getTime() - dateA.getTime(); // Most recent first
    }
    
    // Upcoming appointments come first
    return isUpcoming(a) ? -1 : 1;
  });

  const upcomingAppointments = sortedAppointments.filter(isUpcoming);
  const pastAppointments = sortedAppointments.filter(apt => !isUpcoming(apt));

  if (!user || user.role !== "patient") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => nav("/patient/dashboard")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Calendar className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-semibold">My Appointments</h1>
                <p className="text-sm text-muted-foreground">Manage your medical appointments</p>
              </div>
            </div>
            <Button onClick={() => nav("/patient/book-appointment")}>
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-spin" />
              <p className="text-muted-foreground">Loading appointments...</p>
            </div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No appointments yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't booked any appointments. Start by booking your first consultation.
            </p>
            <Button onClick={() => nav("/patient/book-appointment")}>
              <Stethoscope className="h-4 w-4 mr-2" />
              Book Your First Appointment
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{appointments.length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                      <p className="text-2xl font-bold text-blue-600">{upcomingAppointments.length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {appointments.filter(a => a.status === 'completed').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Upcoming Appointments
                </h2>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <Card key={appointment._id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(appointment.status)}
                                <span className="font-medium">{appointment.doctorId.name}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {appointment.doctorId.specialization}
                              </Badge>
                              {getStatusBadge(appointment.status)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {appointment.startTime} - {appointment.endTime}
                              </div>
                              <div className="flex items-center gap-2">
                                <Stethoscope className="h-4 w-4" />
                                {appointment.reason}
                              </div>
                              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-md w-fit mt-1">
                                <span>Mode:</span>
                                <span>{appointment.consultationType === "video" ? "🎥 Video Call" :
                                       appointment.consultationType === "voice" ? "📞 Voice Call" : "🏥 In-Person"}</span>
                              </div>
                            </div>

                            {(appointment.notes || appointment.doctorNotes || (appointment.structuredPrescription && appointment.structuredPrescription.length > 0)) && (
                              <div className="mt-3 space-y-3 p-3 bg-muted rounded-lg">
                                {appointment.notes && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      <strong>Patient Description:</strong> {appointment.notes}
                                    </p>
                                  </div>
                                )}
                                {appointment.doctorNotes && (
                                  <div className="pt-2 border-t border-muted-foreground/20">
                                    <p className="text-sm text-muted-foreground">
                                      <strong>Doctor's Notes:</strong> {appointment.doctorNotes}
                                    </p>
                                  </div>
                                )}
                                {appointment.structuredPrescription && appointment.structuredPrescription.length > 0 ? (
                                  <div className="pt-2 border-t border-muted-foreground/20">
                                    <p className="text-sm text-foreground font-bold mb-2">Prescription:</p>
                                    <div className="space-y-2">
                                      {appointment.structuredPrescription.map((med, idx) => (
                                        <div key={idx} className="bg-background p-3 rounded-md border flex flex-col sm:flex-row justify-between gap-2 shadow-sm">
                                          <div>
                                            <p className="font-semibold">{med.name}</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                              {med.morning && <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Morning</Badge>}
                                              {med.afternoon && <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">Afternoon</Badge>}
                                              {med.night && <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Night</Badge>}
                                            </div>
                                          </div>
                                          <div className="text-sm text-muted-foreground sm:text-right">
                                            {med.duration && <p><strong>Duration:</strong> {med.duration}</p>}
                                            {med.instructions && <p><strong>Instructions:</strong> {med.instructions}</p>}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                      <VoicePrescription text={appointment.structuredPrescription.map(m => `${m.name}. ${m.duration ? `For ${m.duration}.` : ''} ${m.instructions ? m.instructions : ''}`).join(' ')} />
                                    </div>
                                  </div>
                                ) : null}
                                {/* If there are doctorNotes or notes, provide voice option if prescription is missing */}
                                {(appointment.doctorNotes || appointment.notes) && (!appointment.structuredPrescription || appointment.structuredPrescription.length === 0) && (
                                  <div className="flex justify-end mt-2">
                                    <VoicePrescription text={appointment.doctorNotes || appointment.notes} />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2 shrink-0 ml-4">
                            {appointment.consultationType === 'video' && appointment.status === 'scheduled' && (
                              <Button
                                onClick={() => nav(`/video-call/${appointment._id}`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5 shadow-sm"
                                size="sm"
                              >
                                🎥 Join Video Call
                              </Button>
                            )}
                            {canCancel(appointment) && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    disabled={cancellingId === appointment._id}
                                    className="w-full"
                                  >
                                    {cancellingId === appointment._id ? "Cancelling..." : "Cancel"}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to cancel your appointment with {appointment.doctorId.name} 
                                      on {new Date(appointment.appointmentDate).toLocaleDateString()}?
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleCancelAppointment(appointment._id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Yes, Cancel
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Past Appointments
                </h2>
                <div className="space-y-4">
                  {pastAppointments.map((appointment) => (
                    <Card key={appointment._id} className="opacity-75">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(appointment.status)}
                                <span className="font-medium">{appointment.doctorId.name}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {appointment.doctorId.specialization}
                              </Badge>
                              {getStatusBadge(appointment.status)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {new Date(appointment.appointmentDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {appointment.startTime} - {appointment.endTime}
                              </div>
                              <div className="flex items-center gap-2">
                                <Stethoscope className="h-4 w-4" />
                                {appointment.reason}
                              </div>
                              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-md w-fit mt-1">
                                <span>Mode:</span>
                                <span>{appointment.consultationType === "video" ? "🎥 Video Call" :
                                       appointment.consultationType === "voice" ? "📞 Voice Call" : "🏥 In-Person"}</span>
                              </div>
                            </div>

                            {(appointment.notes || appointment.doctorNotes || (appointment.structuredPrescription && appointment.structuredPrescription.length > 0)) && (
                              <div className="mt-3 p-3 bg-muted rounded-lg">
                                <div className="space-y-3 mb-4">
                                  {appointment.notes && (
                                    <div>
                                      <p className="text-sm text-muted-foreground">
                                        <strong>Patient Description:</strong> {appointment.notes}
                                      </p>
                                    </div>
                                  )}
                                  {appointment.doctorNotes && (
                                    <div className="pt-2 border-t border-muted-foreground/20">
                                      <p className="text-sm text-muted-foreground">
                                        <strong>Doctor's Notes:</strong> {appointment.doctorNotes}
                                      </p>
                                    </div>
                                  )}
                                  {appointment.structuredPrescription && appointment.structuredPrescription.length > 0 ? (
                                    <div className="pt-2 border-t border-muted-foreground/20">
                                      <p className="text-sm text-foreground font-bold mb-2">Prescription:</p>
                                      <div className="space-y-2">
                                        {appointment.structuredPrescription.map((med, idx) => (
                                          <div key={idx} className="bg-background p-3 rounded-md border flex flex-col sm:flex-row justify-between gap-2 shadow-sm">
                                            <div>
                                              <p className="font-semibold">{med.name}</p>
                                              <div className="flex flex-wrap gap-2 mt-1">
                                                {med.morning && <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Morning</Badge>}
                                                {med.afternoon && <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">Afternoon</Badge>}
                                                {med.night && <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Night</Badge>}
                                              </div>
                                            </div>
                                            <div className="text-sm text-muted-foreground sm:text-right">
                                              {med.duration && <p><strong>Duration:</strong> {med.duration}</p>}
                                              {med.instructions && <p><strong>Instructions:</strong> {med.instructions}</p>}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      <div className="mt-3 flex justify-end">
                                        <VoicePrescription text={appointment.structuredPrescription.map(m => `${m.name}. ${m.duration ? `For ${m.duration}.` : ''} ${m.instructions ? m.instructions : ''}`).join(' ')} />
                                      </div>
                                    </div>
                                  ) : null}
                                  {(appointment.doctorNotes || appointment.notes) && (!appointment.structuredPrescription || appointment.structuredPrescription.length === 0) && (
                                    <div className="flex justify-end">
                                      <VoicePrescription text={appointment.doctorNotes || appointment.notes} />
                                    </div>
                                  )}
                                </div>
                                
                                {appointment.prescriptionAcknowledged ? (
                                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md font-medium">
                                    <CheckCircle className="h-5 w-5" />
                                    Prescription Acknowledged
                                  </div>
                                ) : (
                                  <Button 
                                    className="w-full h-14 text-lg font-bold shadow-md bg-primary hover:bg-primary/90 transition-all"
                                    onClick={() => handleAcknowledge(appointment._id)}
                                  >
                                    I Have Read & Understood My Prescription
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}