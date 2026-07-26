import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUnifiedAuth } from "@/lib/unified-auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  User,
  Mail,
  Phone,
  Stethoscope,
  Save
} from "lucide-react";

export default function DoctorSettings() {
  const { user, updateUser } = useUnifiedAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    specialization: ""
  });

  useEffect(() => {
    if (!user || user.role !== "doctor") {
      nav("/login");
      return;
    }
    
    setProfileData({
      name: user.name || "",
      phone: user.profile?.phone || "",
      specialization: user.profile?.specialization || ""
    });
  }, [user, nav]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || user?.id}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        let updatedProfile = profileData;
        try {
          const data = await response.json();
          if (data && data.doctor) {
            updatedProfile = data.doctor;
          }
        } catch (e) {}

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
        
        setTimeout(() => nav("/doctor/dashboard"), 1000);
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

  if (!user || user.role !== "doctor") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => nav("/doctor/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <User className="h-6 w-6 text-primary hidden md:block" />
              <div>
                <h1 className="text-xl font-semibold">Doctor Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Professional Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g. Dr. John Smith"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialization">Specialization *</Label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="specialization"
                      value={profileData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      placeholder="e.g. Cardiology"
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Email Address (Cannot be changed)</Label>
                <Input
                  value={user.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Contact system administrator to change your email address
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={loading} size="lg" className="w-full md:w-auto">
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
