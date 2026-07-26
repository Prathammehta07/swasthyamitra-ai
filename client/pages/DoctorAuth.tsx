import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useDoctorAuth } from "@/lib/doctor-auth";
import { useNavigate } from "react-router-dom";
import { Stethoscope } from "lucide-react";

export default function DoctorAuth() {
  const { login, register } = useDoctorAuth();
  const nav = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const [selectedSpecialization, setSelectedSpecialization] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));
    
    console.log('Attempting login with:', { email, password: '***' }); // Debug log
    
    try {
      await login(email, password);
      console.log('Login successful, redirecting to dashboard'); // Debug log
      nav("/doctor/dashboard");
    } catch (err: any) {
      console.error('Login failed:', err); // Debug log
      setError(err.message || "Login failed");
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    
    if (!selectedSpecialization) {
      setError("Please select a specialization");
      return;
    }
    
    try {
      await register(
        String(fd.get("username")),
        String(fd.get("password")),
        String(fd.get("name")),
        selectedSpecialization,
        String(fd.get("email")),
        String(fd.get("phone"))
      );
      nav("/doctor/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
  }

  return (
    <div className="container py-12">
      <Card className="max-w-xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Doctor Portal</CardTitle>
          <p className="text-sm text-muted-foreground">
            Login or register to access your doctor dashboard
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-4">
              <form className="space-y-3" onSubmit={handleLogin}>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <Input 
                    name="email" 
                    type="email" 
                    required 
                    placeholder="test@gmail.com"
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
                  <p>Email: test@gmail.com</p>
                  <p>Password: test@123</p>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="mt-4">
              <form className="space-y-3" onSubmit={handleRegister}>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Full Name
                  </Label>
                  <Input name="name" required minLength={2} />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Username
                  </Label>
                  <Input name="username" required minLength={3} />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <Input name="email" type="email" required />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Phone Number
                  </Label>
                  <Input name="phone" type="tel" required />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Specialization
                  </Label>
                  <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                    <SelectTrigger>
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
                  <Label className="text-sm text-muted-foreground">
                    Password
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
                  Register
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}