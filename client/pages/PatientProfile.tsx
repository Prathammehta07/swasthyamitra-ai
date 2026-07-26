import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUnifiedAuth } from "@/lib/unified-auth";
import { safeJsonResponse } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { DosageCard } from "@/components/ui/DosageCard";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  AlertTriangle,
  Save,
  Plus,
  X
} from "lucide-react";

export default function PatientProfile() {
  const { user, updateUser } = useUnifiedAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: ""
    },
    bloodGroup: "",
    medicalHistory: [] as string[],
    allergies: [] as string[],
    currentMedications: [] as any[]
  });

  const [newMedicalHistory, setNewMedicalHistory] = useState<string>("");
  const [newAllergy, setNewAllergy] = useState<string>("");
  const [newMedication, setNewMedication] = useState<string>("");
  const [medTiming, setMedTiming] = useState({ morning: false, afternoon: false, night: false });

  useEffect(() => {
    if (!user || user.role !== "patient") {
      nav("/login");
      return;
    }
    
    // Initialize form with patient data
    const patient = user.profile || {};
    const cleanHistory = (patient.medicalHistory || []).filter((item: string) => item && item.toLowerCase() !== 'na' && item.toLowerCase() !== 'n/a' && item.toLowerCase() !== 'none');
    const cleanAllergies = (patient.allergies || []).filter((item: string) => item && item.toLowerCase() !== 'na' && item.toLowerCase() !== 'n/a' && item.toLowerCase() !== 'none');

    setProfileData({
      name: user.name || "",
      phone: patient.phone || (user as any).phone || "",
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : "",
      gender: patient.gender || "",
      address: patient.address || "",
      emergencyContact: {
        name: patient.emergencyContact?.name || "",
        phone: patient.emergencyContact?.phone || "",
        relationship: patient.emergencyContact?.relationship || ""
      },
      bloodGroup: patient.bloodGroup || "",
      medicalHistory: cleanHistory,
      allergies: cleanAllergies,
      currentMedications: patient.currentMedications || []
    });
  }, [user, nav]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value
      }
    }));
  };

  const addToList = (listType: 'medicalHistory' | 'allergies', value: string) => {
    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === 'na' || trimmed.toLowerCase() === 'n/a' || trimmed.toLowerCase() === 'none') return;
    
    setProfileData(prev => ({
      ...prev,
      [listType]: [...prev[listType], trimmed]
    }));

    if (listType === 'medicalHistory') setNewMedicalHistory("");
    if (listType === 'allergies') setNewAllergy("");
  };

  const handleAddMedication = () => {
    if (!newMedication.trim()) return;
    
    setProfileData(prev => ({
      ...prev,
      currentMedications: [...prev.currentMedications, {
        name: newMedication.trim(),
        morning: medTiming.morning,
        afternoon: medTiming.afternoon,
        night: medTiming.night,
        duration: '',
        instructions: ''
      }]
    }));
    
    setNewMedication("");
    setMedTiming({ morning: false, afternoon: false, night: false });
  };

  const removeFromList = (listType: 'medicalHistory' | 'allergies' | 'currentMedications', index: number) => {
    setProfileData(prev => ({
      ...prev,
      [listType]: prev[listType].filter((_, i) => i !== index)
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || user?.id}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        // Parse the updated profile returned by the backend (or fallback to local state)
        let updatedProfile = profileData;
        try {
          const data = await response.json();
          if (data && typeof data === 'object') {
            updatedProfile = data;
          }
        } catch (e) {
          // Ignore json parse error, just use local profileData
        }

        // Update global auth context so the rest of the app (like Dashboard) sees the new data
        if (user) {
          updateUser({
            ...user,
            name: updatedProfile.name || user.name,
            profile: {
              ...user.profile,
              ...updatedProfile
            }
          });
        }

        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
        // Optionally refresh patient data or navigate back
        nav("/patient/dashboard");
      } else {
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const error = await response.json();
            toast({
              title: "Error",
              description: error.message || "Failed to update profile",
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
            description: "Failed to update profile",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "patient") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => nav("/patient/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25 font-bold">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">My Health Profile</h1>
              <p className="text-xs text-muted-foreground">Manage your personal, emergency & medical details</p>
            </div>
          </div>
          <Button 
            onClick={handleSaveProfile} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/25 px-5"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Profile Changes"}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={profileData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
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
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select value={profileData.bloodGroup} onValueChange={(value) => handleInputChange('bloodGroup', value)}>
                    <SelectTrigger>
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
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={profileData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your complete address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="emergencyName">Contact Name *</Label>
                  <Input
                    id="emergencyName"
                    value={profileData.emergencyContact.name}
                    onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                    placeholder="Contact person's name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="emergencyPhone">Contact Phone *</Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    value={profileData.emergencyContact.phone}
                    onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                    placeholder="Contact phone number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="emergencyRelationship">Relationship *</Label>
                  <Select 
                    value={profileData.emergencyContact.relationship} 
                    onValueChange={(value) => handleEmergencyContactChange('relationship', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Medical History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newMedicalHistory}
                  onChange={(e) => setNewMedicalHistory(e.target.value)}
                  placeholder="Add medical condition or history"
                  onKeyPress={(e) => e.key === 'Enter' && addToList('medicalHistory', newMedicalHistory)}
                />
                <Button 
                  onClick={() => addToList('medicalHistory', newMedicalHistory)}
                  disabled={!newMedicalHistory.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {profileData.medicalHistory.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profileData.medicalHistory.map((condition, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {condition}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-2 hover:bg-transparent"
                        onClick={() => removeFromList('medicalHistory', index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Allergies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Add allergy (e.g., peanuts, penicillin)"
                  onKeyPress={(e) => e.key === 'Enter' && addToList('allergies', newAllergy)}
                />
                <Button 
                  onClick={() => addToList('allergies', newAllergy)}
                  disabled={!newAllergy.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {profileData.allergies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profileData.allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive" className="text-sm">
                      {allergy}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-2 hover:bg-transparent"
                        onClick={() => removeFromList('allergies', index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Current Medications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/30">
                <Input
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  placeholder="Medication name (e.g., Paracetamol 500mg)"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMedication()}
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-6 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={medTiming.morning} 
                        onChange={e => setMedTiming({...medTiming, morning: e.target.checked})} 
                        className="rounded border-input h-4 w-4" 
                      /> 
                      Morning
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={medTiming.afternoon} 
                        onChange={e => setMedTiming({...medTiming, afternoon: e.target.checked})} 
                        className="rounded border-input h-4 w-4" 
                      /> 
                      Afternoon
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={medTiming.night} 
                        onChange={e => setMedTiming({...medTiming, night: e.target.checked})} 
                        className="rounded border-input h-4 w-4" 
                      /> 
                      Night
                    </label>
                  </div>
                  <Button 
                    onClick={handleAddMedication}
                    disabled={!newMedication.trim()}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Medication
                  </Button>
                </div>
              </div>
              
              {profileData.currentMedications.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {profileData.currentMedications.map((medication: any, index) => (
                    <div key={index} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md border shadow-sm relative pr-8">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromList('currentMedications', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <p className="font-semibold text-sm">{typeof medication === 'string' ? medication : medication.name}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {medication.morning && <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Morning</Badge>}
                        {medication.afternoon && <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">Afternoon</Badge>}
                        {medication.night && <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Night</Badge>}
                        {(!medication.morning && !medication.afternoon && !medication.night) && (
                          <span className="text-xs text-muted-foreground">No specific time provided</span>
                        )}
                      </div>
                      {medication.duration && <p className="text-xs text-muted-foreground mt-1">Duration: {medication.duration}</p>}
                      {medication.instructions && <p className="text-xs text-muted-foreground mt-1">Note: {medication.instructions}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Read-only Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Email Address (Cannot be changed)</Label>
                <Input
                  value={user.email || user.profile?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Contact support if you need to change your email address
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={loading} size="lg">
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}