import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import { useI18n } from "@/lib/i18n";
import { useUnifiedAuth } from "@/lib/unified-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DemoResponse,
  MedicinesResponse,
  AdvancedSymptomCheckResult,
  AdvancedSymptomCheckInput,
} from "@shared/api";
import {
  Activity,
  Brain,
  Database,
  Languages,
  MapPin,
  Server,
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Crown,
  UserPlus,
  Heart,
  Star,
} from "lucide-react";
import Chatbot from "@/components/Chatbot";

export default function Index() {
  const { t } = useI18n();
  const { user, isGuest } = useUnifiedAuth();
  const [exampleFromServer, setExampleFromServer] = useState("");
  
  useEffect(() => {
    fetchDemo();
  }, []);
  
  const fetchDemo = async () => {
    try {
      const response = await fetch("/api/demo");
      if (response.ok) {
        try {
          const data = (await response.json()) as DemoResponse;
          setExampleFromServer(data.message);
        } catch (e) {
          console.error("Error parsing demo data:", e);
        }
      }
    } catch (error) {
      console.error("Error fetching hello:", error);
    }
  };

  // If user is a guest, show them the guest dashboard instead
  if (isGuest) {
    return (
      <div className="bg-gradient-to-b from-secondary to-white">
        <GuestHero />
        <Stats />
        <Features />
        <div className="container grid gap-6 py-10 md:grid-cols-2">
          <SymptomChecker />
          <OfflineRecords />
        </div>
        <MedicineAvailability />
        <GuestUpgradeSection />
        <AboutUs />
        <FooterRibbon />
        <p className="sr-only">{exampleFromServer}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-secondary to-white">
      <Hero />
      <Stats />
      <Features />
      <div className="container grid gap-6 py-10 md:grid-cols-2">
        <SymptomChecker />
        <OfflineRecords />
      </div>
      <MedicineAvailability />
      <AboutUs />
      <FooterRibbon />
      <p className="sr-only">{exampleFromServer}</p>
    </div>
  );
}

function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <svg
          className="absolute -top-24 -right-24 opacity-20"
          width="400"
          height="400"
          viewBox="0 0 200 200"
        >
          <defs>
            <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="90" fill="url(#g)" />
        </svg>
      </div>
      <div className="container py-16 md:py-24 text-center md:text-left grid md:grid-cols-2 items-center gap-10">
        <div>
          <Badge className="mb-4" variant="secondary">
            {t("tagline")}
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            {t("hero_title")}
          </h1>
          <p className="mt-4 text-muted-foreground md:text-lg">
            {t("hero_sub")}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Button asChild size="lg">
              <a href="#symptom">{t("cta_assess")}</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#records">{t("cta_records")}</a>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Languages className="h-4 w-4 text-primary" /> {t("f1_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {t("f1_desc")}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" /> {t("f2_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {t("f2_desc")}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> {t("f3_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {t("f3_desc")}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" /> {t("f4_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {t("f4_desc")}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const { t } = useI18n();
  return (
    <section className="container py-6 grid gap-4 md:grid-cols-2">
      <Card>
        <CardContent className="pt-6 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">31%</div>
            <div className="text-muted-foreground">
              {t("stats_connectivity")}
            </div>
          </div>
          <Activity className="h-10 w-10 text-primary" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">31% CAGR</div>
            <div className="text-muted-foreground">{t("stats_growth")}</div>
          </div>
          <Stethoscope className="h-10 w-10 text-primary" />
        </CardContent>
      </Card>
    </section>
  );
}

function Features() {
  const { t } = useI18n();
  return (
    <section id="features" className="container py-10">
      <h2 className="text-2xl md:text-3xl font-bold">{t("features_title")}</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-4">
        <FeatureCard
          icon={<Languages className="h-5 w-5" />}
          title={t("f1_title")}
          desc={t("f1_desc")}
        />
        <FeatureCard
          icon={<Database className="h-5 w-5" />}
          title={t("f2_title")}
          desc={t("f2_desc")}
        />
        <FeatureCard
          icon={<MapPin className="h-5 w-5" />}
          title={t("f3_title")}
          desc={t("f3_desc")}
        />
        <FeatureCard
          icon={<Brain className="h-5 w-5" />}
          title={t("f4_title")}
          desc={t("f4_desc")}
        />
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 flex flex-row items-center gap-2">
        <div className="p-2 rounded-md bg-secondary text-primary">{icon}</div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {desc}
      </CardContent>
    </Card>
  );
}

// Guest-specific components
function GuestHero() {
  const { t } = useI18n();
  const { user } = useUnifiedAuth();
  
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <svg
          className="absolute -top-24 -right-24 opacity-20"
          width="400"
          height="400"
          viewBox="0 0 200 200"
        >
          <defs>
            <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="90" fill="url(#g)" />
        </svg>
      </div>
      <div className="container py-16 md:py-24">
        {/* Guest Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Heart className="h-6 w-6" />
                Welcome to {t("appName")}! 👋
              </h2>
              <p className="text-blue-700 mb-4">
                You're exploring as a guest. Try our health tools below or create a free account for full access.
              </p>
              <div className="flex gap-3">
                <Button asChild>
                  <a href="/login">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Free Account
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="#symptom">Try Symptom Checker</a>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <Badge className="bg-yellow-500 text-yellow-900 font-medium px-3 py-1">
                <Crown className="h-4 w-4 mr-1" />
                Guest Mode
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Regular Hero Content */}
        <div className="text-center md:text-left grid md:grid-cols-2 items-center gap-10">
          <div>
            <Badge className="mb-4" variant="secondary">
              {t("tagline")}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              {t("hero_title")}
            </h1>
            <p className="mt-4 text-muted-foreground md:text-lg">
              {t("hero_sub")}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Button asChild size="lg">
                <a href="#symptom">{t("cta_assess")}</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#records">{t("cta_records")}</a>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Languages className="h-4 w-4 text-primary" /> {t("f1_title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {t("f1_desc")}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" /> {t("f2_title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {t("f2_desc")}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> {t("f3_title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {t("f3_desc")}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" /> {t("f4_title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {t("f4_desc")}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function GuestUpgradeSection() {
  const { t } = useI18n();
  
  return (
    <section className="container py-12">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-8">
          <div className="text-center max-w-3xl mx-auto">
            <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4">
              Unlock Your Complete Health Journey
            </h2>
            <p className="text-blue-700 mb-6 text-lg">
              Create a free account to access personalized health tracking, book doctor appointments, 
              and keep your medical history secure.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-medium text-blue-900">Book Appointments</h3>
                <p className="text-sm text-blue-700">Schedule consultations with qualified doctors</p>
              </div>
              <div className="text-center">
                <Database className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-medium text-blue-900">Health Records</h3>
                <p className="text-sm text-blue-700">Secure storage for your medical history</p>
              </div>
              <div className="text-center">
                <Star className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-medium text-blue-900">Personalized Care</h3>
                <p className="text-sm text-blue-700">Tailored health recommendations</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <a href="/login">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Free Account
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="/login">
                  <Stethoscope className="h-4 w-4 mr-2" />
                  I'm a Doctor
                </a>
              </Button>
            </div>
            
            <p className="text-xs text-blue-600 mt-4">
              ✓ No credit card required ✓ Free forever ✓ Data privacy guaranteed
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function SymptomChecker() {
  const { t } = useI18n();
  const [input, setInput] = useState<AdvancedSymptomCheckInput>({
    age: 30,
    symptoms: [],
    notes: "",
    gender: "other",
    duration: "",
    severity: 5,
    medicalHistory: [],
    useAI: false,
  });
  const [result, setResult] = useState<AdvancedSymptomCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableSymptoms, setAvailableSymptoms] = useState<any[]>([]);

  // Load available symptoms from server
  useEffect(() => {
    const loadSymptoms = async () => {
      try {
        const response = await fetch('/api/symptoms/list');
        if (response.ok) {
          try {
            const data = await response.json();
            setAvailableSymptoms(data.symptoms || []);
          } catch (e) {
            console.error('Failed to parse symptoms data:', e);
          }
        }
      } catch (error) {
        console.error('Failed to load symptoms:', error);
        // Fallback to basic symptoms
        setAvailableSymptoms([
          { key: "fever", label: "Fever", severity: "moderate", category: "general" },
          { key: "cough", label: "Cough", severity: "mild", category: "respiratory" },
          { key: "breath", label: "Difficulty breathing", severity: "high", category: "respiratory" },
          { key: "chest_pain", label: "Chest pain", severity: "high", category: "cardiovascular" },
          { key: "headache", label: "Headache", severity: "mild", category: "neurological" },
          { key: "nausea", label: "Nausea", severity: "mild", category: "gastrointestinal" },
          { key: "vomiting", label: "Vomiting", severity: "moderate", category: "gastrointestinal" },
          { key: "diarrhea", label: "Diarrhea", severity: "moderate", category: "gastrointestinal" },
        ]);
      }
    };
    loadSymptoms();
  }, []);

  // Group symptoms by category
  const symptomsByCategory = useMemo(() => {
    const grouped: Record<string, typeof availableSymptoms> = {};
    availableSymptoms.forEach(symptom => {
      const category = symptom.category || 'general';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(symptom);
    });
    return grouped;
  }, [availableSymptoms]);

  const medicalHistoryOptions = [
    { key: "diabetes", label: "Diabetes" },
    { key: "hypertension", label: "High Blood Pressure" },
    { key: "heart_disease", label: "Heart Disease" },
    { key: "asthma", label: "Asthma" },
    { key: "allergies", label: "Allergies" },
    { key: "cancer", label: "Cancer" },
    { key: "kidney_disease", label: "Kidney Disease" },
    { key: "liver_disease", label: "Liver Disease" },
  ];

  async function checkSymptoms() {
    setLoading(true);
    try {
      const response = await fetch('/api/symptoms/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze symptoms');
      }
      
      try {
        const data = await response.json();
        setResult(data);
      } catch (e) {
        console.error('Failed to parse symptom check result:', e);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Symptom check failed:', error);
      // Fallback to basic triage
      setResult({
        level: "doctor",
        advice: "Unable to connect to AI service. Please consult a healthcare provider.",
        redFlags: ["System error"],
        confidence: 0.5,
      });
    } finally {
      setLoading(false);
    }
  }

  const getTriageLevelColor = (level: string) => {
    switch (level) {
      case "emergency": return "bg-red-500 text-white";
      case "urgent": return "bg-orange-500 text-white";
      case "doctor": return "bg-yellow-500 text-black";
      case "pharmacist": return "bg-blue-500 text-white";
      case "self_care": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getTriageLevelIcon = (level: string) => {
    switch (level) {
      case "emergency":
      case "urgent": return <AlertTriangle className="h-4 w-4" />;
      case "doctor": return <Stethoscope className="h-4 w-4" />;
      case "pharmacist": return <Activity className="h-4 w-4" />;
      case "self_care": return <CheckCircle className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  return (
    <Card id="symptom" className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" /> {t("symptom_title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium">{t("symptom_age")}</Label>
            <Input
              type="number"
              value={input.age}
              min={0}
              max={120}
              onChange={(e) =>
                setInput((s) => ({ ...s, age: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <Label className="text-sm font-medium">{t("symptom_gender")}</Label>
            <Select value={input.gender} onValueChange={(value) => setInput(s => ({ ...s, gender: value as any }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t("symptom_gender_male")}</SelectItem>
                <SelectItem value="female">{t("symptom_gender_female")}</SelectItem>
                <SelectItem value="other">{t("symptom_gender_other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium">{t("symptom_duration")}</Label>
            <Select value={input.duration} onValueChange={(value) => setInput(s => ({ ...s, duration: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hours">{t("symptom_duration_hours")}</SelectItem>
                <SelectItem value="days">{t("symptom_duration_days")}</SelectItem>
                <SelectItem value="week">{t("symptom_duration_week")}</SelectItem>
                <SelectItem value="weeks">{t("symptom_duration_weeks")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Severity */}
        <div>
          <Label className="text-sm font-medium">{t("symptom_severity")}</Label>
          <div className="flex items-center space-x-4 mt-2">
            <Input
              type="range"
              min="1"
              max="10"
              value={input.severity}
              onChange={(e) => setInput(s => ({ ...s, severity: Number(e.target.value) }))}
              className="flex-1"
            />
            <span className="text-sm font-medium w-8">{input.severity}</span>
          </div>
        </div>

        {/* Symptoms by Category */}
        <div>
          <Label className="text-sm font-medium mb-3 block">{t("symptom_symptoms")}</Label>
          <div className="space-y-4">
            {Object.entries(symptomsByCategory).map(([category, symptoms]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-muted-foreground capitalize mb-2">{category}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {symptoms.map((symptom) => (
                    <label
                      key={symptom.key}
                      className="flex items-center gap-2 rounded-md border p-2 hover:bg-accent cursor-pointer"
                    >
                      <Checkbox
                        checked={input.symptoms.includes(symptom.key)}
                        onCheckedChange={(checked) =>
                          setInput((s) => ({
                            ...s,
                            symptoms: checked
                              ? [...s.symptoms, symptom.key]
                              : s.symptoms.filter((k) => k !== symptom.key),
                          }))
                        }
                      />
                      <span className="text-sm">{symptom.label}</span>
                      {symptom.severity === 'high' && (
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medical History */}
        <div>
          <Label className="text-sm font-medium mb-3 block">{t("symptom_medical_history")}</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {medicalHistoryOptions.map((condition) => (
              <label
                key={condition.key}
                className="flex items-center gap-2 rounded-md border p-2 hover:bg-accent cursor-pointer"
              >
                <Checkbox
                  checked={input.medicalHistory?.includes(condition.key) || false}
                  onCheckedChange={(checked) =>
                    setInput((s) => ({
                      ...s,
                      medicalHistory: checked
                        ? [...(s.medicalHistory || []), condition.key]
                        : (s.medicalHistory || []).filter((k) => k !== condition.key),
                    }))
                  }
                />
                <span className="text-sm">{condition.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <Label className="text-sm font-medium">{t("symptom_other")}</Label>
          <Textarea
            rows={3}
            value={input.notes}
            onChange={(e) => setInput((s) => ({ ...s, notes: e.target.value }))}
            placeholder="Any additional symptoms or details..."
          />
        </div>

        {/* AI Analysis Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="ai-analysis"
              checked={input.useAI}
              onCheckedChange={(checked) => setInput(s => ({ ...s, useAI: checked }))}
            />
            <Label htmlFor="ai-analysis" className="text-sm font-medium">
              {t("symptom_advanced")}
            </Label>
          </div>
          <Button onClick={checkSymptoms} disabled={loading || input.symptoms.length === 0}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                {t("symptom_analyzing")}
              </>
            ) : (
              t("symptom_check")
            )}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{t("symptom_result")}</h3>
              {result.confidence && (
                <Badge variant="outline" className="ml-auto">
                  {t("symptom_confidence")}: {Math.round(result.confidence * 100)}%
                </Badge>
              )}
            </div>

            {/* Triage Level */}
            <div className={`rounded-lg p-3 flex items-center gap-2 ${getTriageLevelColor(result.level)}`}>
              {getTriageLevelIcon(result.level)}
              <div>
                <div className="font-medium capitalize">{result.level.replace('_', ' ')}</div>
                <div className="text-sm opacity-90">{result.advice}</div>
              </div>
            </div>

            {/* Follow-up */}
            {result.followUpInDays !== undefined && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {t("symptom_follow_up")}: {result.followUpInDays === 0 ? t("symptom_immediate") : `${result.followUpInDays} days`}
              </div>
            )}

            {/* Red Flags */}
            {result.redFlags && result.redFlags.length > 0 && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  {t("symptom_warning")}
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {result.redFlags.map((flag, index) => (
                    <li key={index}>• {flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Possible Conditions */}
            {result.possibleConditions && result.possibleConditions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">{t("symptom_possible_conditions")}</h4>
                <ul className="text-sm space-y-1">
                  {result.possibleConditions.map((condition, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-blue-500" />
                      {condition}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">{t("symptom_recommendations")}</h4>
                <ul className="text-sm space-y-1">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Critical Signs */}
            {result.criticalSigns && result.criticalSigns.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-orange-600">{t("symptom_critical_signs")}</h4>
                <ul className="text-sm space-y-1">
                  {result.criticalSigns.map((sign, index) => (
                    <li key={index} className="flex items-center gap-2 text-orange-700">
                      <AlertTriangle className="h-3 w-3" />
                      {sign}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preventive Measures */}
            {result.preventiveMeasures && result.preventiveMeasures.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">{t("symptom_preventive_measures")}</h4>
                <ul className="text-sm space-y-1">
                  {result.preventiveMeasures.map((measure, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-blue-500" />
                      {measure}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Analysis */}
            {result.aiAnalysis && (
              <div>
                <h4 className="font-medium mb-2">{t("symptom_ai_analysis")}</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 prose prose-sm prose-blue max-w-none">
                  <ReactMarkdown>
                    {result.aiAnalysis}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground mt-4 p-3 bg-gray-50 rounded-md">
              {t("symptom_disclaimer")}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OfflineRecords() {
  const { t } = useI18n();
  const { user, isGuest } = useUnifiedAuth();
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [records, setRecords] = useState<
    Array<{ id: string; name: string; age: number | ""; notes: string }>
  >(() => {
    try {
      return JSON.parse(localStorage.getItem("records") || "[]");
    } catch {
      return [];
    }
  });

  const online = typeof navigator !== "undefined" ? navigator.onLine : true;
  useEffect(() => {
    const on = () => window.dispatchEvent(new Event("records-online-change"));
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
    };
  }, []);

  function save() {
    const id = crypto.randomUUID();
    const next = [{ id, name, age: Number(age), notes }, ...records].slice(
      0,
      50,
    );
    setRecords(next);
    localStorage.setItem("records", JSON.stringify(next));
    setName("");
    setAge("");
    setNotes("");
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(records, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "swasthyamitra-records.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (Array.isArray(data)) {
          setRecords(data);
          localStorage.setItem("records", JSON.stringify(data));
        }
      } catch {}
    };
    reader.readAsText(file);
  }

  return (
    <Card id="records">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" /> {t("records_title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`h-2 w-2 rounded-full ${online ? "bg-emerald-500" : "bg-amber-500"}`}
          />
          <span className="text-muted-foreground">
            {online ? t("records_status_online") : t("records_status_offline")}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="text-sm text-muted-foreground">
              {t("records_name")}
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">
              {t("records_age")}
            </label>
            <Input
              type="number"
              value={age}
              onChange={(e) =>
                setAge(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-muted-foreground">
              {t("records_notes")}
            </label>
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {user && !isGuest ? (
            <Button onClick={save}>{t("records_save")}</Button>
          ) : isGuest ? (
            <Button variant="outline" asChild>
              <a href="/login">
                <Crown className="h-4 w-4 mr-2" />
                {t("records_create_account")}
              </a>
            </Button>
          ) : (
            <Button asChild>
              <a href="/login">{t("records_login_save")}</a>
            </Button>
          )}
          <Button variant="outline" onClick={exportJson}>
            {t("records_export")}
          </Button>
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={importJson}
            />
            <span className="px-3 py-2 border rounded-md">
              {t("records_import")}
            </span>
          </label>
        </div>
        
        {/* Guest Limitation Notice */}
        {isGuest && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3">
            <div className="flex items-center gap-2 text-yellow-800 text-sm">
              <Crown className="h-4 w-4" />
              <span className="font-medium">{t("guest_mode_title")}</span>
            </div>
            <p className="text-yellow-700 text-xs mt-1">
              {t("guest_mode_desc")}
            </p>
          </div>
        )}
        <Separator />
        <div className="space-y-2 max-h-64 overflow-auto pr-1">
          {records.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {t("records_empty")}
            </div>
          ) : (
            records.map((r) => (
              <div key={r.id} className="rounded-md border p-2">
                <div className="font-medium">
                  {r.name || "Unnamed"}{" "}
                  <span className="text-xs text-muted-foreground">
                    {r.age || ""}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {r.notes}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MedicineAvailability() {
  const { t } = useI18n();
  const { isGuest } = useUnifiedAuth();
  const [pincode, setPincode] = useState("");
  const [query, setQuery] = useState("");
  const [onlyStock, setOnlyStock] = useState(false);
  const [sort, setSort] = useState<"stock" | "name">("stock");
  const [watch, setWatch] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("watchlist") || "[]");
    } catch {
      return [];
    }
  });
  const [data, setData] = useState<MedicinesResponse | null>(null);
  const [loading, setLoading] = useState(false);

  function cacheSet(pin: string, payload: MedicinesResponse) {
    const key = `med_cache_${pin || "default"}`;
    localStorage.setItem(key, JSON.stringify(payload));
  }
  function cacheGet(pin: string): MedicinesResponse | null {
    try {
      return JSON.parse(localStorage.getItem(`med_cache_${pin || "default"}`) || "null");
    } catch {
      return null;
    }
  }

  function getFallbackMedicines(targetPincode: string): MedicinesResponse {
    const pin = targetPincode.trim() || "140301";
    const BASE_LIST = [
      { name: "Paracetamol 500mg", stock: 45, pharmacy: `Jan Aushadhi Kendra (${pin})`, pincode: pin },
      { name: "Paracetamol 650mg (Dolo)", stock: 80, pharmacy: `City Medicos (${pin})`, pincode: pin },
      { name: "ORS Hydration Sachet", stock: 150, pharmacy: `Kisan Medical Store (${pin})`, pincode: pin },
      { name: "Amoxicillin 250mg", stock: 12, pharmacy: `Apollo Pharmacy (${pin})`, pincode: pin },
      { name: "Cetirizine 10mg", stock: 35, pharmacy: `Sehat Chemist (${pin})`, pincode: pin },
      { name: "Azithromycin 500mg", stock: 25, pharmacy: `HealthPlus Pharmacy (${pin})`, pincode: pin },
      { name: "Pantoprazole 40mg", stock: 60, pharmacy: `LifeCare Medicos (${pin})`, pincode: pin },
      { name: "Metformin 500mg", stock: 40, pharmacy: `Jan Aushadhi Kendra (${pin})`, pincode: pin },
      { name: "Insulin Vial (10ml)", stock: 8, pharmacy: `District Hospital Counter (${pin})`, pincode: pin },
      { name: "Cough Syrup 100ml", stock: 30, pharmacy: `Sehat Chemist (${pin})`, pincode: pin },
      { name: "Vitamin C 500mg Chewable", stock: 95, pharmacy: `Apollo Pharmacy (${pin})`, pincode: pin },
      { name: "Ibuprofen 400mg", stock: 50, pharmacy: `Kisan Medical Store (${pin})`, pincode: pin }
    ];
    return { updatedAt: new Date().toISOString(), items: BASE_LIST };
  }

  async function load() {
    setLoading(true);
    const targetPin = pincode.trim() || "140301";
    try {
      const res = await fetch(
        `/api/medicines?pincode=${encodeURIComponent(targetPin)}`,
      );
      if (res.ok) {
        const json = (await res.json()) as MedicinesResponse;
        if (json && Array.isArray(json.items) && json.items.length > 0) {
          setData(json);
          cacheSet(targetPin, json);
          return;
        }
      }
    } catch {
      console.warn('Backend medicine fetch failed, using fallback pharmacy data');
    } finally {
      setLoading(false);
    }

    const cached = cacheGet(targetPin);
    if (cached && Array.isArray(cached.items) && cached.items.length > 0) {
      setData(cached);
    } else {
      const fallback = getFallbackMedicines(targetPin);
      setData(fallback);
      cacheSet(targetPin, fallback);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(() => {
      load();
    }, 15000);
    return () => clearInterval(id);
  }, [pincode]);

  const filteredItems = data ? [...data.items]
    .filter((m) =>
      query ? m.name.toLowerCase().includes(query.toLowerCase()) : true,
    )
    .filter((m) => (onlyStock ? m.stock > 0 : true))
    .sort((a, b) =>
      sort === "stock"
        ? b.stock - a.stock
        : a.name.localeCompare(b.name),
    ) : [];

  return (
    <section className="container py-10">
      <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
        <MapPin className="h-6 w-6 text-primary" /> {t("pharmacy_title")}
      </h2>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Input
          placeholder={t("pharmacy_pincode")}
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          maxLength={6}
          className="w-36"
        />
        <Input
          placeholder={t("pharmacy_search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-[200px] flex-1"
        />
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyStock}
            onChange={(e) => setOnlyStock(e.target.checked)}
            className="rounded text-primary focus:ring-primary h-4 w-4"
          />{" "}
          {t("pharmacy_only_stock")}
        </label>
        <label className="flex items-center gap-2 text-sm">
          {t("pharmacy_sort_by")}
          <select
            className="border rounded-md h-10 px-2 bg-background"
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
          >
            <option value="stock">{t("pharmacy_sort_stock")}</option>
            <option value="name">{t("pharmacy_sort_name")}</option>
          </select>
        </label>
        <Button onClick={load} disabled={loading}>
          {loading ? "Checking..." : t("pharmacy_check")}
        </Button>
      </div>
      
      {/* Guest Limitation Notice */}
      {isGuest && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-800 text-sm">
              <Crown className="h-4 w-4" />
              <span className="font-medium">{t("pharmacy_guest_title")}</span>
            </div>
            <Button size="sm" asChild>
              <a href="/login">
                <UserPlus className="h-3 w-3 mr-1" />
                {t("pharmacy_guest_btn")}
              </a>
            </Button>
          </div>
          <p className="text-blue-700 text-xs mt-1">
            {t("pharmacy_guest_desc")}
          </p>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="mt-6 text-center py-8 border rounded-xl bg-card text-muted-foreground">
          <p className="text-base font-medium">No medicines found matching "{query || pincode}"</p>
          <p className="text-xs text-muted-foreground mt-1">Try searching for Paracetamol, ORS, Cetirizine, or clear search filter.</p>
          {(query || onlyStock) && (
            <Button variant="outline" size="sm" className="mt-3" onClick={() => { setQuery(""); setOnlyStock(false); }}>
              Show All Available Medicines
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {filteredItems.map((m, i) => (
            <Card key={m.name + i} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{m.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={m.stock > 0 ? "default" : "secondary"}>
                      {m.stock > 0 ? `${m.stock} ${t("pharmacy_in_stock")}` : t("pharmacy_out_of_stock")}
                    </Badge>
                    <button
                      className={`text-xs underline ${watch.includes(m.name) ? "text-accent font-semibold" : ""}`}
                      onClick={() => {
                        if (isGuest) {
                          alert("Create a free account to save medicine watchlists and get stock alerts!");
                          return;
                        }
                        
                        const next = watch.includes(m.name)
                          ? watch.filter((x) => x !== m.name)
                          : [...watch, m.name];
                        setWatch(next);
                        localStorage.setItem(
                          "watchlist",
                          JSON.stringify(next),
                        );
                      }}
                    >
                      {isGuest ? t("pharmacy_signup_watch") : (watch.includes(m.name) ? t("pharmacy_watching") : t("pharmacy_watch"))}
                    </button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground flex items-center justify-between">
                <span>{m.pharmacy}</span>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{m.pincode}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && (
        <div className="mt-3 text-xs text-muted-foreground flex items-center justify-between">
          <span>{t("pharmacy_updated")}: {new Date(data.updatedAt).toLocaleTimeString()}</span>
          <span>Showing {filteredItems.length} available medicines in pincode {pincode || "140301"}</span>
        </div>
      )}
    </section>
  );
}

function AboutUs() {
  return (
    <section id="about" className="container py-12">
      <h2 className="text-2xl md:text-3xl font-bold">About us</h2>
      <div className="mt-4 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Make quality care accessible in rural India through low‑bandwidth
            telemedicine, offline health records, and transparent medicine
            availability.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Team</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Public health experts, rural clinicians, and engineers with
            experience in PWA, offline-first design, and scalable cloud.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Partners</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Working with district hospitals, local pharmacies, and Punjab Health
            Department to pilot and scale.
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function FooterRibbon() {
  return (
    <section className="bg-secondary/60 py-12">
      <div className="container text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm shadow-sm">
          <Server className="h-4 w-4 text-primary" />
          <span>
            Optimized for low bandwidth • Offline first • Scalable for rural
            Punjab
          </span>
        </div>
      </div>
    </section>
  );
}
