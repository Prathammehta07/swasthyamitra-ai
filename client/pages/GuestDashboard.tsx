import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnifiedAuth } from "@/lib/unified-auth";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  Users, 
  Brain,
  Activity,
  Calendar,
  UserPlus,
  Crown,
  ArrowRight,
  Stethoscope,
  Database,
  MapPin,
  Languages,
  AlertTriangle,
  CheckCircle,
  Star
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Chatbot from "@/components/Chatbot";

export default function GuestDashboard() {
  const { user, logout } = useUnifiedAuth();
  const nav = useNavigate();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const handleUpgradePrompt = (feature: string) => {
    setShowUpgradePrompt(true);
    // You can track which feature triggered the upgrade prompt
    setTimeout(() => setShowUpgradePrompt(false), 5000);
  };

  const handleRegisterAsPatient = () => {
    logout(); // Clear guest session
    nav("/login"); // Redirect to unified login
  };

  if (!user || user.role !== "guest") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-semibold">Guest Dashboard</h1>
                <p className="text-sm text-muted-foreground">Explore SwasthyaMitra health tools & AI</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleRegisterAsPatient}>
                <UserPlus className="h-4 w-4 mr-2" />
                Create Account
              </Button>
              <Button variant="outline" onClick={logout}>
                Exit Guest Mode
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Upgrade Prompt */}
        {showUpgradePrompt && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <Crown className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="flex items-center justify-between">
                <span>Create a free account to unlock all features and save your health data!</span>
                <Button size="sm" onClick={handleRegisterAsPatient} className="ml-4">
                  Sign Up Free
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-blue-900 mb-2">
                    Welcome to SwasthyaMitra! 👋
                  </h2>
                  <p className="text-blue-700 mb-4">
                    You're exploring as a guest. Create a free account to save your health data and access personalized features.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={handleRegisterAsPatient}>
                      <Heart className="h-4 w-4 mr-2" />
                      Join as Patient
                    </Button>
                    <Button variant="outline" onClick={() => nav("/login")}>
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Doctor Login
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                    <Heart className="h-16 w-16 text-blue-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">AI</div>
              <div className="text-sm text-muted-foreground">Symptom Checker</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Database className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">Offline</div>
              <div className="text-sm text-muted-foreground">Health Records</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">Local</div>
              <div className="text-sm text-muted-foreground">Medicine Finder</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Languages className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">3+</div>
              <div className="text-sm text-muted-foreground">Languages</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Health Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Health Assessment Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer" 
                   onClick={() => nav('/#symptom')}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">AI Symptom Checker</h4>
                    <p className="text-sm text-muted-foreground">
                      Get instant health guidance based on your symptoms
                    </p>
                  </div>
                  <Badge variant="secondary">Free</Badge>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
                   onClick={() => nav('/#records')}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">Health Records</h4>
                    <p className="text-sm text-muted-foreground">
                      Store health data offline (limited for guests)
                    </p>
                  </div>
                  <Badge variant="outline">Limited</Badge>
                </div>
              </div>

              <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
                   onClick={() => nav("/awareness")}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">Health Awareness</h4>
                    <p className="text-sm text-muted-foreground">
                      Learn about health topics and prevention
                    </p>
                  </div>
                  <Badge variant="secondary">Free</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Premium Features
                <Badge variant="secondary" className="ml-auto">Account Required</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg opacity-75">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-muted-foreground">Book Appointments</h4>
                    <p className="text-sm text-muted-foreground">
                      Schedule consultations with doctors
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleUpgradePrompt("appointments")}>
                    <UserPlus className="h-3 w-3 mr-1" />
                    Sign Up
                  </Button>
                </div>
              </div>

              <div className="p-4 border rounded-lg opacity-75">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-muted-foreground">Medical History</h4>
                    <p className="text-sm text-muted-foreground">
                      Maintain comprehensive health records
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleUpgradePrompt("history")}>
                    <UserPlus className="h-3 w-3 mr-1" />
                    Sign Up
                  </Button>
                </div>
              </div>

              <div className="p-4 border rounded-lg opacity-75">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-muted-foreground">Prescription Management</h4>
                    <p className="text-sm text-muted-foreground">
                      Track medications and prescriptions
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleUpgradePrompt("prescriptions")}>
                    <UserPlus className="h-3 w-3 mr-1" />
                    Sign Up
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="text-center">
                  <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <h4 className="font-medium text-blue-900">Create Free Account</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Unlock all features and keep your health data secure
                  </p>
                  <Button onClick={handleRegisterAsPatient} className="w-full">
                    Get Started Free
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                onClick={() => nav('/#symptom')}>
            <CardContent className="pt-6 text-center">
              <Brain className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="font-medium mb-2">Check Symptoms</h3>
              <p className="text-sm text-muted-foreground mb-3">
                AI-powered symptom analysis
              </p>
              <Button variant="outline" size="sm">
                <ArrowRight className="h-4 w-4 ml-1" />
                Try Now
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                onClick={() => nav("/awareness")}>
            <CardContent className="pt-6 text-center">
              <Activity className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="font-medium mb-2">Health Tips</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Learn preventive healthcare
              </p>
              <Button variant="outline" size="sm">
                <ArrowRight className="h-4 w-4 ml-1" />
                Explore
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                onClick={() => handleUpgradePrompt("consultation")}>
            <CardContent className="pt-6 text-center">
              <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium text-muted-foreground mb-2">Book Consultation</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Connect with doctors
              </p>
              <Button variant="outline" size="sm" disabled>
                <Crown className="h-3 w-3 mr-1" />
                Sign Up Required
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Guest vs Registered User Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-green-600 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Available as Guest
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    AI Symptom Checker
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Health Awareness Content
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Medicine Availability Check
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Basic Health Records (limited)
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-600 mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  With Free Account
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Star className="h-3 w-3 text-blue-500" />
                    Unlimited Health Records
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-3 w-3 text-blue-500" />
                    Book Doctor Appointments
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-3 w-3 text-blue-500" />
                    Prescription Management
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-3 w-3 text-blue-500" />
                    Medical History Tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-3 w-3 text-blue-500" />
                    Appointment Reminders
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Button onClick={handleRegisterAsPatient} size="lg">
                <UserPlus className="h-4 w-4 mr-2" />
                Create Free Account - No Credit Card Required
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}