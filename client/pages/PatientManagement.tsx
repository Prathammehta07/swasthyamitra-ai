import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUnifiedAuth } from "@/lib/unified-auth";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Search,
  ArrowLeft,
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Activity,
  Heart,
  FileText
} from "lucide-react";

interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address: string;
  bloodGroup?: string;
  medicalHistory?: string[];
  createdAt: string;
  updatedAt?: string;
}

const SAMPLE_PATIENTS: Patient[] = [
  {
    _id: "pat_101",
    name: "Ramesh Kumar",
    age: 45,
    gender: "male",
    phone: "9876543210",
    email: "ramesh.kumar@gmail.com",
    address: "Village Rampur, Sector 4, Punjab",
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
    address: "Model Town, Street 12, Mohali",
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
    address: "GT Road, Near Civil Hospital, Ludhiana",
    bloodGroup: "A+",
    medicalHistory: ["Joint Pain", "High Cholesterol"],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

export default function PatientManagement() {
  const { user } = useUnifiedAuth();
  const nav = useNavigate();
  const [patients, setPatients] = useState<Patient[]>(SAMPLE_PATIENTS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male",
    phone: "",
    email: "",
    address: "",
    bloodGroup: "O+",
    medicalHistory: ""
  });

  useEffect(() => {
    if (!user || user.role !== "doctor") {
      nav("/login");
      return;
    }
    fetchPatients();
  }, [user, nav]);

  const getLocalPatients = (): Patient[] => {
    try {
      return JSON.parse(localStorage.getItem('swasthyamitra_doctor_patients') || '[]');
    } catch {
      return [];
    }
  };

  const saveLocalPatients = (list: Patient[]) => {
    localStorage.setItem('swasthyamitra_doctor_patients', JSON.stringify(list));
  };

  const fetchPatients = async () => {
    let serverPatients: Patient[] = [];
    try {
      setLoading(true);
      const response = await fetch('/api/doctor/patients', {
        headers: {
          'Authorization': `Bearer ${user?.token || user?.id}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          serverPatients = data;
        }
      }
    } catch (e) {
      console.warn('Backend fetch failed, using local storage patients fallback');
    } finally {
      setLoading(false);
    }

    const localList = getLocalPatients();
    // Combine server patients, local patients, and sample patients (avoiding duplicates)
    const combined = [...serverPatients, ...localList, ...SAMPLE_PATIENTS];
    const unique = Array.from(new Map(combined.map(p => [p._id, p])).values());
    setPatients(unique);
    setError(null);
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const newPatient: Patient = {
      _id: 'pat_' + Date.now(),
      name: formData.name.trim(),
      age: parseInt(formData.age) || 30,
      gender: (formData.gender as any) || 'male',
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      address: formData.address.trim(),
      bloodGroup: formData.bloodGroup,
      medicalHistory: formData.medicalHistory ? formData.medicalHistory.split(',').map(item => item.trim()).filter(Boolean) : [],
      createdAt: new Date().toISOString()
    };

    try {
      await fetch('/api/doctor/patients', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token || user?.id}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPatient)
      });
    } catch (e) {
      console.warn('Backend create failed, saved locally');
    }

    const localList = getLocalPatients();
    const updatedLocal = [newPatient, ...localList];
    saveLocalPatients(updatedLocal);

    setPatients(prev => [newPatient, ...prev]);
    setSuccess('Patient added successfully');
    resetForm();
    setIsDialogOpen(false);
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setError(null);
    setSuccess(null);

    const updatedData: Patient = {
      ...selectedPatient,
      name: formData.name.trim(),
      age: parseInt(formData.age) || selectedPatient.age,
      gender: (formData.gender as any) || selectedPatient.gender,
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      address: formData.address.trim(),
      bloodGroup: formData.bloodGroup,
      medicalHistory: formData.medicalHistory ? formData.medicalHistory.split(',').map(item => item.trim()).filter(Boolean) : [],
      updatedAt: new Date().toISOString()
    };

    try {
      await fetch(`/api/doctor/patients/${selectedPatient._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token || user?.id}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
    } catch (e) {
      console.warn('Backend update failed, saved locally');
    }

    const localList = getLocalPatients();
    const index = localList.findIndex(p => p._id === selectedPatient._id);
    if (index >= 0) {
      localList[index] = updatedData;
    } else {
      localList.unshift(updatedData);
    }
    saveLocalPatients(localList);

    setPatients(prev => prev.map(p => p._id === selectedPatient._id ? updatedData : p));
    setSuccess('Patient updated successfully');
    resetForm();
    setIsDialogOpen(false);
    setIsEditing(false);
    setSelectedPatient(null);
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('Are you sure you want to delete this patient record?')) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await fetch(`/api/doctor/patients/${patientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token || user?.id}`
        }
      });
    } catch (e) {
      console.warn('Backend delete failed, removed locally');
    }

    const localList = getLocalPatients().filter(p => p._id !== patientId);
    saveLocalPatients(localList);

    setPatients(prev => prev.filter(p => p._id !== patientId));
    setSuccess('Patient record removed');
  };

  const openViewDetails = (patient: Patient) => {
    setViewingPatient(patient);
    setIsDetailsOpen(true);
  };

  const openEditDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name,
      age: patient.age.toString(),
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email || "",
      address: patient.address,
      bloodGroup: patient.bloodGroup || "O+",
      medicalHistory: patient.medicalHistory?.join(', ') || ""
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsEditing(false);
    setSelectedPatient(null);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      gender: "male",
      phone: "",
      email: "",
      address: "",
      bloodGroup: "O+",
      medicalHistory: ""
    });
  };

  const filteredPatients = patients.filter(patient => {
    const name = patient.name || '';
    const phone = patient.phone || '';
    const email = patient.email || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           phone.includes(searchTerm) ||
           email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!user || user.role !== "doctor") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => nav("/doctor/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Patient Management</h1>
                <p className="text-sm text-muted-foreground">Add and view patient health records</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="bg-primary hover:bg-primary/90 text-white font-medium shadow-md">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">
                    {isEditing ? 'Edit Patient Details' : 'Add New Patient Record'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={isEditing ? handleUpdatePatient : handleCreatePatient} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-xs font-medium">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="age" className="text-xs font-medium">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="35"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        required
                        min="0"
                        max="150"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender" className="text-xs font-medium">Gender *</Label>
                      <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="bloodGroup" className="text-xs font-medium">Blood Group</Label>
                      <Select value={formData.bloodGroup} onValueChange={(value) => setFormData({...formData, bloodGroup: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Blood Group" />
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
                    <Label htmlFor="phone" className="text-xs font-medium">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                      minLength={10}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="patient@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address" className="text-xs font-medium">Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="Street, City, Pin Code"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      required
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="medicalHistory" className="text-xs font-medium">Medical History / Conditions</Label>
                    <Textarea
                      id="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                      placeholder="e.g. Diabetes, Hypertension, Asthma (comma-separated)"
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {isEditing ? 'Update Patient' : 'Save Patient Record'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Alerts */}
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50 text-red-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-800 font-medium">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients by name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="secondary" className="px-3 py-1 text-xs">
                {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Patient Records
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading patients...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground/60 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium mb-1">
                  {searchTerm ? 'No patients match your search query' : 'No patients registered yet'}
                </p>
                {!searchTerm && (
                  <Button onClick={openCreateDialog} className="mt-3">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Your First Patient
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Age / Gender</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient._id} className="transition-colors hover:bg-muted/40 cursor-pointer" onClick={() => openViewDetails(patient)}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm uppercase">
                              {patient.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">{patient.name}</div>
                              {patient.email && <div className="text-xs text-muted-foreground">{patient.email}</div>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{patient.age} yrs</div>
                          <Badge variant="outline" className="capitalize text-[10px] py-0 px-1.5 font-normal">
                            {patient.gender}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-mono">{patient.phone}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40">
                            {patient.bloodGroup || 'O+'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {patient.address}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View Details"
                              onClick={() => openViewDetails(patient)}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit Patient"
                              onClick={() => openEditDialog(patient)}
                              className="h-8 w-8 text-slate-600 hover:text-slate-900"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete Patient"
                              onClick={() => handleDeletePatient(patient._id)}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Patient Full Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          {viewingPatient && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center uppercase">
                    {viewingPatient.name.charAt(0)}
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold">{viewingPatient.name}</DialogTitle>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>{viewingPatient.age} years old</span> • 
                      <span className="capitalize">{viewingPatient.gender}</span> • 
                      <span className="text-red-600 font-bold">Blood Group: {viewingPatient.bloodGroup || "O+"}</span>
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
                <div className="p-3 bg-muted/50 rounded-xl space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Phone className="h-3.5 w-3.5 text-primary" /> Phone Number
                  </div>
                  <div className="font-semibold">{viewingPatient.phone}</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
                  </div>
                  <div className="font-semibold truncate">{viewingPatient.email || "N/A"}</div>
                </div>
              </div>

              <div className="p-3 bg-muted/50 rounded-xl space-y-1 text-sm">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> Address
                </div>
                <div>{viewingPatient.address}</div>
              </div>

              <div className="p-3 bg-muted/50 rounded-xl space-y-1.5 text-sm">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Activity className="h-3.5 w-3.5 text-primary" /> Medical History & Conditions
                </div>
                {viewingPatient.medicalHistory && viewingPatient.medicalHistory.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {viewingPatient.medicalHistory.map((cond, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs bg-white dark:bg-slate-800 border">
                        {cond}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-xs">No prior medical conditions recorded.</div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Registered: {new Date(viewingPatient.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setIsDetailsOpen(false); openEditDialog(viewingPatient); }}>
                    <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit Patient
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}