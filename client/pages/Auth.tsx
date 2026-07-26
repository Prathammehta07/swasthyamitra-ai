import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePatientAuth } from "@/lib/patient-auth";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

export default function Auth() {
  const { login, register } = usePatientAuth();
  const nav = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));
    
    try {
      await login(email, password);
      nav("/patient/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
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
        medicalHistory: String(fd.get("medicalHistory")).split(',').map(item => item.trim()).filter(item => item),
        allergies: String(fd.get("allergies")).split(',').map(item => item.trim()).filter(item => item),
        currentMedications: String(fd.get("currentMedications")).split(',').map(item => item.trim()).filter(item => item)
      };
      
      await register(patientData);
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

  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Patient Portal</CardTitle>
          <p className="text-sm text-muted-foreground">
            Join SwasthyaMitra to manage your health and appointments
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-4">
              <form className="space-y-3" onSubmit={handleLogin}>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <Input 
                    name="email" 
                    type="email" 
                    required 
                    placeholder="patient@test.com"
                  />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Password
                  </Label>
                  <Input
                    name="password"
                    type="password"
                    minLength={6}
                    required
                    placeholder="test@123"
                  />
                </div>
                {error && (
                  <div className="text-sm text-destructive">{error}</div>
                )}
                <Button type="submit" className="w-full">
                  Login
                </Button>
                <div className="text-sm text-muted-foreground text-center">
                  <p>Test credentials:</p>
                  <p>Email: patient@test.com</p>
                  <p>Password: test@123</p>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="mt-4">
              <form className="space-y-4" onSubmit={handleSignup}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Full Name *
                    </Label>
                    <Input name="name" required minLength={2} />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Email *</Label>
                    <Input name="email" type="email" required />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Phone *</Label>
                    <Input name="phone" type="tel" required minLength={10} placeholder="e.g. 9876543210" />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Date of Birth *</Label>
                    <Input name="dateOfBirth" type="date" required />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Gender *</Label>
                    <Select value={selectedGender} onValueChange={setSelectedGender}>
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
                    <Label className="text-sm text-muted-foreground">Blood Group</Label>
                    <Select value={selectedBloodGroup} onValueChange={setSelectedBloodGroup}>
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
                  <Label className="text-sm text-muted-foreground">Address *</Label>
                  <Textarea name="address" required rows={2} />
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Emergency Contact *</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <Input name="emergencyName" required />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Phone</Label>
                      <Input name="emergencyPhone" type="tel" required minLength={10} placeholder="e.g. 9876543210" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Relationship</Label>
                      <Input name="emergencyRelationship" required />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm text-muted-foreground">Medical History</Label>
                  <Textarea 
                    name="medicalHistory" 
                    placeholder="Comma-separated list of medical conditions"
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Allergies</Label>
                    <Textarea 
                      name="allergies" 
                      placeholder="Comma-separated list"
                      rows={1}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Current Medications</Label>
                    <Textarea 
                      name="currentMedications" 
                      placeholder="Comma-separated list"
                      rows={1}
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Password *
                  </Label>
                  <Input
                    name="password"
                    type="password"
                    minLength={6}
                    required
                  />
                </div>
                
                {error && (
                  <div className="text-sm text-destructive">{error}</div>
                )}
                <Button type="submit" className="w-full">
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
