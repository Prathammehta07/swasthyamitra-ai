import { useState, useRef, useEffect } from "react";
import {
  Send,
  Loader2,
  PhoneCall,
  ExternalLink,
  ArrowLeft,
  CheckCheck,
  Stethoscope,
  MessageCircle,
  ShieldAlert,
  UserCheck,
  Building2,
  AlertTriangle,
  HeartPulse,
  Pill,
  Home,
  CheckCircle2,
  Menu,
  Bell,
  ChevronDown,
  User,
  Plus,
  Mic,
  Brain,
  HelpCircle,
  MapPin,
  Sparkles,
  BookOpen,
  X,
  Phone,
  Clock,
  Heart,
  BadgeAlert,
  Download,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChatMessage, ChatRequest, ChatResponse } from "@shared/api";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";
import { VoiceInput } from "@/components/ui/VoiceInput";

interface Hospital {
  name: string;
  rating: number;
  distance: number;
  address: string;
  phone: string;
  website?: string;
  lat: number;
  lon: number;
  imageUrl: string;
  status?: string;
}

interface AshaWorker {
  name: string;
  village: string;
  district: string;
  phone: string;
  lat: number;
  lon: number;
  avatarUrl: string;
  distanceKm?: number;
}

interface ExtendedChatMessage extends ChatMessage {
  isEmergencyResponse?: boolean;
  isHospitalResponse?: boolean;
  isLocationLoading?: boolean;
  locationError?: boolean;
  hospitalsData?: Hospital[];
  ashaWorkerData?: AshaWorker | null;
  detectedLanguage?: string;
}

const ASHA_WORKERS: AshaWorker[] = [
  {
    name: "Gitaben Patel",
    village: "Katargam",
    district: "Surat",
    phone: "+91 96012 62388",
    lat: 21.2281,
    lon: 72.8338,
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Savita Devi",
    village: "Nabha Rural",
    district: "Patiala",
    phone: "+91 98765 12345",
    lat: 30.3752,
    lon: 76.1472,
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Sunita Deshmukh",
    village: "Wagholi",
    district: "Pune",
    phone: "+91 91234 56789",
    lat: 18.5793,
    lon: 73.9748,
    avatarUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Priya Ramachandran",
    village: "Adyar Village",
    district: "Chennai",
    phone: "+91 94440 98765",
    lat: 13.0012,
    lon: 80.2565,
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Meenaben Parmar",
    village: "Vastrapur",
    district: "Ahmedabad",
    phone: "+91 99887 76655",
    lat: 23.0373,
    lon: 72.5273,
    avatarUrl: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150&h=150&fit=crop&crop=face"
  }
];

const EMERGENCY_LOCALIZATION = {
  en: {
    here_are_hospitals: "📍 Here are the nearest hospitals near your location.",
    high_risk_alert: "🚨 High Risk Alert",
    medical_emergency: "⚠️ This may be a medical emergency.",
    call_108: "📞 Call 108 Emergency",
    first_aid_tips: "🚨 First-Aid Actions While Waiting:",
    near_asha_worker: "👩‍⚕️ Nearby ASHA Worker",
    no_asha_worker: "No ASHA Worker Available Nearby",
    open_map: "📍 Open Map",
    call: "📞 Call",
    whatsapp: "💬 WhatsApp",
    website: "🌐 Website",
    away: "away",
    open: "Open 24/7",
    closed: "Closed",
    distance: "Distance from User",
    loading_location: "📡 Requesting your live GPS location...",
    loading_hospitals: "🏥 Finding nearest hospitals & ASHA worker...",
    location_denied: "⚠️ Location access denied. Showing fallback Surat healthcare centers.",
    first_aid: [
      "Lay the patient flat in a quiet, airy space.",
      "Loosen tight clothing around the neck and chest.",
      "Do not give any solid food, liquid or oral drugs if the patient is sluggish or unconscious.",
      "If breathing stops, begin chest compressions (CPR) immediately if trained."
    ]
  },
  hi: {
    here_are_hospitals: "📍 यहाँ आपके स्थान के निकटतम अस्पताल हैं।",
    high_risk_alert: "🚨 उच्च जोखिम चेतावनी",
    medical_emergency: "⚠️ यह एक चिकित्सा आपातकाल हो सकता है।",
    call_108: "📞 108 आपातकालीन कॉल करें",
    first_aid_tips: "🚨 चिकित्सा सहायता की प्रतीक्षा करते समय प्राथमिक उपचार:",
    near_asha_worker: "👩‍⚕️ नजदीकी आशा (ASHA) कार्यकर्ता",
    no_asha_worker: "आसपास कोई आशा कार्यकर्ता उपलब्ध नहीं है",
    open_map: "📍 मानचित्र खोलें",
    call: "📞 कॉल करें",
    whatsapp: "💬 व्हाट्सएप",
    website: "🌐 वेबसाइट",
    away: "दूर",
    open: "24/7 खुला है",
    closed: "बंद है",
    distance: "आपसे दूरी",
    loading_location: "📡 आपके लाइव जीपीएस स्थान का अनुरोध किया जा रहा है...",
    loading_hospitals: "🏥 निकटतम अस्पतालों और आशा कार्यकर्ता की खोज की जा रही है...",
    location_denied: "⚠️ स्थान पहुंच अस्वीकृत। सूरत के डिफ़ॉल्ट स्वास्थ्य केंद्र दिखाए जा रहे हैं।",
    first_aid: [
      "मरीज को शांत, हवादार जगह पर सीधा लिटाएं।",
      "गर्दन और छाती के आसपास के तंग कपड़ों को ढीला करें।",
      "यदि मरीज बेहोश या सुस्त है, तो उसे कोई ठोस भोजन, तरल या दवा न दें।",
      "यदि सांस बंद हो जाए, तो तुरंत छाती को दबाना (सीपीआर) शुरू करें।"
    ]
  },
  gu: {
    here_are_hospitals: "📍 અહીં તમારા સ્થાનની નજીકની હોસ્પિટલો છે.",
    high_risk_alert: "🚨 ઉચ્ચ જોખમ ચેતવણી",
    medical_emergency: "⚠️ આ તબીબી કટોકટી હોઈ શકે છે.",
    call_108: "📞 108 ઈમરજન્સી કોલ કરો",
    first_aid_tips: "🚨 તબીબી મદદની રાહ જોતી વખતે પ્રાથમિક સારવાર:",
    near_asha_worker: "👩‍⚕️ નજીકના આશા (ASHA) કાર્યકર",
    no_asha_worker: "નજીકમાં કોઈ આશા કાર્યકર ઉપલબ્ધ નથી",
    open_map: "📍 નકશો ખોલો",
    call: "📞 કોલ કરો",
    whatsapp: "💬 વોટ્સએપ",
    website: "🌐 વેબસાઇટ",
    away: "દૂર",
    open: "24/7 ખુલ્લી છે",
    closed: "બંધ છે",
    distance: "તમારાથી અંતર",
    loading_location: "📡 તમારા લાઇવ જીપીએસ લોકેશનની વિનંતી કરી રહ્યાં છીએ...",
    loading_hospitals: "🏥 નજીકની હોસ્પિટલો અને આશા કાર્યકર શોધી રહ્યાં છીએ...",
    location_denied: "⚠️ લોકેશન પરમિશન નકારી કાઢવામાં આવી. સુરતના ડિફોલ્ટ આરોગ્ય કેન્દ્રો બતાવી રહ્યા છે.",
    first_aid: [
      "દર્દીને શાંત અને હવા ઉજાસવાળી જગ્યાએ સીધા સુવડાવો.",
      "ગળા અને છાતીની આસપાસના ચુસ્ત કપડાં ઢીલા કરો.",
      "જો દર્દી બેભાન અથવા અર્ધબેભાન હોય તો તેને કશું ખાવા-પીવા કે દવા ન આપો.",
      "જો શ્વાસ બંધ થઈ જાય, તો તરत જ છાતી દબાવવાનું (CPR) શરૂ કરો."
    ]
  },
  mr: {
    here_are_hospitals: "📍 तुमच्या जवळील सर्वात जवळची रुग्णालये खालीलप्रमाणे आहेत.",
    high_risk_alert: "🚨 उच्च जोखीम इशारा",
    medical_emergency: "⚠️ ही वैद्यकीय आणीबाणी असू शकते.",
    call_108: "📞 १०८ आणीबाणी कॉल करा",
    first_aid_tips: "🚨 वैद्यकीय मदतीची वाट पाहत असताना प्रथमोपचार:",
    near_asha_worker: "👩‍⚕️ जवळील आशा (ASHA) कार्यकर्त्या",
    no_asha_worker: "जवळपास कोणतीही आशा कार्यकर्त्या उपलब्ध नाही",
    open_map: "📍 नकाशा उघडा",
    call: "📞 कॉल करा",
    whatsapp: "💬 व्हॉट्सॲप",
    website: "🌐 संकेतस्थळ",
    away: "लांब",
    open: "२४ तास उघडे",
    closed: "बंद",
    distance: "तुमच्यापासून अंतर",
    loading_location: "📡 तुमच्या लाईव्ह जीपीएस स्थानाची विनंती करत आहे...",
    loading_hospitals: "🏥 जवळील रुग्णालये आणि आशा कार्यकर्त्या शोधत आहे...",
    location_denied: "⚠️ स्थान परवानगी नाकारली. सुरतचे डीफॉल्ट आरोग्य केंद्र दाखवले जात आहे.",
    first_aid: [
      "रुग्णाला शांत, हवेशीर जागी सरळ झोपवा.",
      "मान आणि छातीभोवतीचे घट्ट कपडे सैल करा.",
      "रुग्ण सुस्त किंवा बेशुद्ध असल्यास त्याला कोणतेही अन्न, पाणी किंवा औषध देऊ नका.",
      "श्वास थांबल्यास त्वरित छाती दाबणे (सीपीआर) सुरू करा."
    ]
  },
  ta: {
    here_are_hospitals: "📍 உங்கள் இருப்பிடத்திற்கு அருகிலுள்ள மருத்துவமனைகள் இதோ.",
    high_risk_alert: "🚨 அதிக ஆபத்து எச்சரிக்கை",
    medical_emergency: "⚠️ இது ஒரு மருத்துவ அவசரநிலையாக இருக்கலாம்.",
    call_108: "📞 108 அவசர அழைப்பு செய்யவும்",
    first_aid_tips: "🚨 மருத்துவ உதவிக்காக காத்திருக்கும்போது முதலுதவி:",
    near_asha_worker: "👩‍⚕️ அருகிலுள்ள ஆஷா (ASHA) பணியாளர்",
    no_asha_worker: "அருகில் ஆஷா பணியாளர் யாரும் இல்லை",
    open_map: "📍 வரைபடத்தைத் திறக்கவும்",
    call: "📞 அழைப்பு",
    whatsapp: "💬 வாட்ஸ்அப்",
    website: "🌐 வலைத்தளம்",
    away: "தொலைவில்",
    open: "24/7 திறந்திருக்கும்",
    closed: "மூடப்பட்டுள்ளது",
    distance: "உங்களிடமிருந்து தூரம்",
    loading_location: "📡 உங்கள் நேரடி ஜிபிஎஸ் இருப்பிடத்தைக் கேட்கிறது...",
    loading_hospitals: "🏥 அருகிலுள்ள மருத்துவமனைகள் மற்றும் ஆஷா பணியாளரைத் தேடுகிறது...",
    location_denied: "⚠️ இருப்பிட அனுமதி மறுக்கப்பட்டது. சூரத்தின் இயல்புநிலை சுகாதார மையங்கள் காட்டப்படுகின்றன.",
    first_aid: [
      "நோயாளிக்கு அமைதியான, காற்றோட்டமான இடத்தில் நேராக படுக்க வைக்கவும்.",
      "கழுத்து மற்றும் மார்பைச் சுற்றியுள்ள இறுக்கமான ஆடைகளைத் தளர்த்தவும்.",
      "நோயாளி மயக்கமாகவோ அல்லது மயக்க நிலையிலோ இருந்தால் அவருக்கு எந்தவொரு உணவோ, திரவமோ அல்லது மருந்தையோ கொடுக்க வேண்டாம்.",
      "சுவாசம் நின்றால், உடனடியாக மார்பு அமுக்கல் (சிபிஆர்) தொடங்கவும்."
    ]
  }
};

const translateText = (text: string, toLang: "en" | "hi" | "gu" | "mr" | "ta"): string => {
  if (toLang === "en" || !text) return text;
  
  const translations: Record<string, Record<string, string>> = {
    "Community Health Centre": { hi: "सामुदायिक स्वास्थ्य केंद्र", gu: "સમુદાય આરોગ્ય કેન્દ્ર", mr: "सामुदायिक आरोग्य केंद्र", ta: "சமூக சுகாதார மையம்" },
    "Community Health Center": { hi: "सामुदायिक स्वास्थ्य केंद्र", gu: "સમુદાય આરોગ્ય કેન્દ્ર", mr: "सामुदायिक आरोग्य केंद्र", ta: "சமூக சுகாதார மையம்" },
    "Primary Health Centre": { hi: "प्राथमिक स्वास्थ्य केंद्र", gu: "પ્રાથમિક આરોગ્ય કેન્દ્ર", mr: "प्राथमिक आरोग्य केंद्र", ta: "ஆரம்ப சுகாதார நிலையம்" },
    "Primary Health Center": { hi: "प्राथमिक स्वास्थ्य केंद्र", gu: "પ્રાથમિક આરોગ્ય કેન્દ્ર", mr: "प्राथमिक आरोग्य केंद्र", ta: "ஆரம்ப சுகாதார நிலையம்" },
    "Civil Hospital": { hi: "सिविल अस्पताल", gu: "સિવિલ હોસ્પિટલ", mr: "सिव्हिल रुग्णालय", ta: "சிவில் மருத்துவமனை" },
    "General Hospital": { hi: "सामान्य अस्पताल", gu: "સામાન્ય હોસ્પિટલ", mr: "सामान्य रुग्णालय", ta: "பொது மருத்துவமனை" },
    "District Hospital": { hi: "जिला अस्पताल", gu: "જિલ્લા હોસ્પિટલ", mr: "जिल्हा रुग्णालय", ta: "மாவட்ட மருத்துவமனை" },
    "Trauma Centre": { hi: "ट्रॉमा केंद्र", gu: "ટ્રોમા સેન્ટર", mr: "ट्रॉमा सेंटर", ta: "அதிர்ச்சி மையம்" },
    "Trauma Center": { hi: "ट्रॉमा केंद्र", gu: "ટ્રોમા સેન્ટર", mr: "ट्रॉमा सेंटर", ta: "அதிர்ச்சி மையம்" },
    "Hospital": { hi: "अस्पताल", gu: "હોસ્પિટલ", mr: "रुग्णालय", ta: "மருத்துவமனை" },
    "Clinic": { hi: "क्लिनिक", gu: "ક્લિનિક", mr: "क्लिनिक", ta: "கிளினிக்" },
    "Medical College": { hi: "मेडिकल कॉलेज", gu: "મેડિકલ કોલેજ", mr: "वैद्यकीय महाविद्यालय", ta: "மருத்துவக் கல்லூரி" },
    "Near": { hi: "के पास", gu: "નજીક", mr: "जवळ", ta: "அருகில்" },
    "near": { hi: "के पास", gu: "નજીક", mr: "जवळ", ta: "அருகில்" },
    "Opposite": { hi: "के सामने", gu: "સામે", mr: "समोर", ta: "எதிரில்" },
    "opposite": { hi: "के सामने", gu: "સામે", mr: "समोर", ta: "எதிரில்" },
    "Road": { hi: "मार्ग", gu: "રોડ", mr: "रस्ता", ta: "சாலை" },
    "road": { hi: "मार्ग", gu: "રોડ", mr: "रस्ता", ta: "சாலை" },
    "Street": { hi: "गली", gu: "શેરી", mr: "गल्ली", ta: "தெரு" },
    "street": { hi: "गली", gu: "શેરી", mr: "गल्ली", ta: "தெரு" },
    "Main Bazar": { hi: "मुख्य बाजार", gu: "મુખ્ય બજાર", mr: "मुख्य बाजार", ta: "முக்கிய சந்தை" }
  };

  let translated = text;
  const keys = Object.keys(translations).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const regex = new RegExp(`\\b${key}\\b`, "gi");
    if (regex.test(translated) && translations[key][toLang]) {
      translated = translated.replace(regex, translations[key][toLang]);
    }
  }
  return translated;
};

const detectLanguage = (text: string, activeLang: string): "en" | "hi" | "gu" | "mr" | "ta" => {
  const clean = text.toLowerCase();
  
  if (/[\u0A80-\u0AFF]/.test(text)) return "gu";
  if (/[\u0900-\u097F]/.test(text)) {
    if (clean.includes("रुग्णालय") || clean.includes("जवळ") || clean.includes("हृदयविकार") || clean.includes("अपघात")) {
      return "mr";
    }
    return "hi";
  }
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta";
  
  if (/\b(pass|najeek|naziq|dard|daura|dour|khoon|behosh|zehar|jahar)\b/.test(clean)) return "hi";
  if (/\b(najik|duskho|lohi|bebhan|zer|sap)\b/.test(clean)) return "gu";
  if (/\b(jawal|dokhne|apghat)\b/.test(clean)) return "mr";
  if (/\b(vali|vibathu|avasaram|iratham)\b/.test(clean)) return "ta";

  if (activeLang === "hi") return "hi";
  if (activeLang === "gu") return "gu";
  return "en";
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return parseFloat(d.toFixed(1));
};

const getClosestAshaWorker = (userLat: number, userLon: number): AshaWorker & { distanceKm: number } => {
  let bestWorker = ASHA_WORKERS[0];
  let minDistance = calculateDistance(userLat, userLon, bestWorker.lat, bestWorker.lon);
  
  for (let i = 1; i < ASHA_WORKERS.length; i++) {
    const dist = calculateDistance(userLat, userLon, ASHA_WORKERS[i].lat, ASHA_WORKERS[i].lon);
    if (dist < minDistance) {
      minDistance = dist;
      bestWorker = ASHA_WORKERS[i];
    }
  }

  if (minDistance > 50) {
    return {
      name: "Anitaben Parmar",
      village: "Local Area",
      district: "Primary Center",
      phone: "+91 96012 62388",
      lat: userLat + 0.005,
      lon: userLon - 0.004,
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
      distanceKm: 0.8
    };
  }

  return { ...bestWorker, distanceKm: minDistance };
};

const getNearestHospitals = async (userLat: number, userLon: number): Promise<Hospital[]> => {
  const url = `https://overpass-api.de/api/interpreter?data=[out:json][timeout:15];(node["amenity"="hospital"](around:15000,${userLat},${userLon});way["amenity"="hospital"](around:15000,${userLat},${userLon});relation["amenity"="hospital"](around:15000,${userLat},${userLon}););out center;`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch from Overpass");
    const data = await res.json();
    
    if (!data.elements || data.elements.length === 0) {
      throw new Error("No elements found");
    }

    const list: Hospital[] = data.elements.map((el: any) => {
      const name = el.tags?.name || "Government Health Facility";
      const phone = el.tags?.phone || el.tags?.["contact:phone"] || "+91 261 244 2244";
      const website = el.tags?.website || el.tags?.["contact:website"] || undefined;
      const street = el.tags?.["addr:street"] || "";
      const city = el.tags?.["addr:city"] || "";
      const address = [street, city].filter(Boolean).join(", ") || "Main Road Area";
      
      const lat = el.lat || el.center?.lat;
      const lon = el.lon || el.center?.lon;
      const distance = calculateDistance(userLat, userLon, lat, lon);

      const rating = 4.1 + (name.charCodeAt(0) % 9) / 10;
      const imgIndex = (name.charCodeAt(0) + name.charCodeAt(name.length - 1)) % 5;
      const images = [
        "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1586773860418-d3b3b998fc65?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=250&fit=crop"
      ];
      
      return {
        name,
        rating,
        distance,
        address,
        phone,
        website,
        lat,
        lon,
        imageUrl: images[imgIndex],
        status: el.tags?.opening_hours ? "Open 24/7" : undefined
      };
    });

    return list.sort((a, b) => a.distance - b.distance).slice(0, 4);
  } catch (err) {
    console.warn("Overpass API fallback active:", err);
    return [
      {
        name: "Civil Hospital Surat & Trauma Centre",
        rating: 4.6,
        distance: 1.2,
        address: "Ring Road, Surat, Gujarat",
        phone: "+91 261 224 4812",
        website: "https://civilhospitalsurat.org",
        lat: userLat + 0.009,
        lon: userLon + 0.008,
        imageUrl: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&h=250&fit=crop",
        status: "Open 24/7"
      },
      {
        name: "New Civil Government CHC",
        rating: 4.3,
        distance: 2.1,
        address: "Majura Gate Road, Surat, Gujarat",
        phone: "+91 261 224 4921",
        website: undefined,
        lat: userLat + 0.015,
        lon: userLon - 0.012,
        imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=250&fit=crop",
        status: "Open 24/7"
      },
      {
        name: "Saraswati Community Clinic",
        rating: 4.5,
        distance: 3.5,
        address: "Panchayat Block Road, Surat",
        phone: "+91 98765 43210",
        website: undefined,
        lat: userLat - 0.021,
        lon: userLon + 0.019,
        imageUrl: "https://images.unsplash.com/photo-1586773860418-d3b3b998fc65?w=400&h=250&fit=crop",
        status: "Open 9:00 AM - 5:00 PM"
      },
      {
        name: "Surat District Municipal Hospital",
        rating: 4.2,
        distance: 4.8,
        address: "Station Road, Surat, Gujarat",
        phone: "+91 261 242 7311",
        website: "https://suratmunicipal.gov.in",
        lat: userLat + 0.035,
        lon: userLon + 0.031,
        imageUrl: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=400&h=250&fit=crop",
        status: "Open 24/7"
      }
    ].map(h => {
      const distance = calculateDistance(userLat, userLon, h.lat, h.lon);
      return { ...h, distance };
    }).sort((a, b) => a.distance - b.distance).slice(0, 4);
  }
};

/** Parse text block into clean structured sections or formatted lines */
function renderMessageContent(text: string) {
  if (!text) return null;

  const lines = text.split("\n");
  
  return lines.map((rawLine, idx) => {
    const trimmed = rawLine.trim();

    // Empty lines or dividers
    if (!trimmed || trimmed === "---") {
      return <div key={idx} className="h-2" />;
    }

    // Risk level badge line
    if (trimmed.includes("જોખમ સ્તર") || trimmed.includes("जोखिम स्तर") || trimmed.includes("Risk Level")) {
      const isHigh = trimmed.includes("🔴") || trimmed.includes("ઇમરજન્સી") || trimmed.includes("Emergency");
      const isMod = trimmed.includes("🟡") || trimmed.includes("મધ્યમ") || trimmed.includes("Moderate");
      return (
        <div key={idx} className="my-2 flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {trimmed.split(/[:\*\s]+/)[0]} {trimmed.includes("જોખમ") ? "જોખમ સ્તર:" : trimmed.includes("जोखिम") ? "जोखिम स्तर:" : "Risk Level:"}
          </span>
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-full text-xs font-bold shadow-xs inline-flex items-center gap-1",
              isHigh
                ? "bg-red-100 text-red-700 border border-red-300"
                : isMod
                ? "bg-amber-100 text-amber-800 border border-amber-300"
                : "bg-blue-100 text-blue-800 border border-blue-300"
            )}
          >
            {trimmed.replace(/.*?(🔴|🟡|🟢)/, "$1")}
          </span>
        </div>
      );
    }

    // Section Headers with Emojis
    const isSectionHeader = /^(🤒|🤢|🤮|🚨|😵|🤕|🦷|👁️|👂|🤧|😴|😟|🤰|🏠|💊|🍎|🚫|⚠️|🏥|👩‍⚕️|🏛️|🩺)\s*\*\*/.test(trimmed);

    // Bullet lines: strip leading bullet characters like •, -, *
    const isBullet = /^[•\-\*]\s*/.test(trimmed);
    const cleanContent = isBullet ? trimmed.replace(/^[•\-\*]\s*/, "") : trimmed;

    // Inline bold formatting parse
    const parsedText = cleanContent
      .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
      .map((part, j) => {
        if (/^\*\*[^*]+\*\*$/.test(part)) {
          return <strong key={j} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
        }
        if (/^\*[^*]+\*$/.test(part)) {
          return <em key={j} className="italic text-slate-700 dark:text-slate-300">{part.slice(1, -1)}</em>;
        }
        return part;
      });

    if (isSectionHeader) {
      return (
        <div key={idx} className="mt-3.5 mb-1.5 font-bold text-[14px] text-[#1e3a8a] dark:text-blue-400 flex items-center gap-1.5 border-b border-blue-100 dark:border-blue-900/40 pb-1">
          {parsedText}
        </div>
      );
    }

    if (isBullet) {
      return (
        <div key={idx} className="flex items-start gap-2 my-1 pl-1 text-[13.5px] leading-snug">
          <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-1 shrink-0" />
          <span className="text-slate-800 dark:text-slate-200">{parsedText}</span>
        </div>
      );
    }

    return (
      <div key={idx} className="text-[13.5px] leading-relaxed text-slate-800 dark:text-slate-200">
        {parsedText}
      </div>
    );
  });
}

export default function WhatsAppBot() {
  const { lang } = useI18n();
  const nav = useNavigate();
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lon: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const updateMessageHospitals = async (msgIndex: number, lat: number, lon: number) => {
    try {
      const data = await getNearestHospitals(lat, lon);
      const asha = getClosestAshaWorker(lat, lon);
      setMessages((prev) => {
        const copy = [...prev];
        const ext = copy[msgIndex] as ExtendedChatMessage;
        if (ext) {
          ext.hospitalsData = data;
          ext.ashaWorkerData = asha;
          ext.isLocationLoading = false;
        }
        return copy;
      });
    } catch (e) {
      console.error("Error updating hospitals:", e);
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<"en" | "hi" | "gu">(() =>
    lang === "gu" ? "gu" : lang === "hi" ? "hi" : "en"
  );
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [playingMsgIndex, setPlayingMsgIndex] = useState<number | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
    return () => {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const handleTogglePlayMsg = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    if (playingMsgIndex === index) {
      window.speechSynthesis.cancel();
      setPlayingMsgIndex(null);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#~`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      const targetLang = language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN';
      utterance.lang = targetLang;
      
      const preferredVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetLang.split('-')[0]));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        setPlayingMsgIndex(null);
      };
      utterance.onerror = () => {
        setPlayingMsgIndex(null);
      };

      setPlayingMsgIndex(index);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Modal / Popover States
  const [showHospitalsModal, setShowHospitalsModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(3);

  // Emergency 108 Simulation States
  const [showEmergencyCallModal, setShowEmergencyCallModal] = useState(false);
  const [simulatedCallStatus, setSimulatedCallStatus] = useState<"idle" | "ringing" | "connected" | "ended">("idle");
  const [callTimer, setCallTimer] = useState(0);
  const [activeCallTarget, setActiveCallTarget] = useState<{ name: string; phone: string; isEmergency?: boolean } | null>(null);

  const handleCallHospital = (hospital: { name: string; phone: string }) => {
    setActiveCallTarget({ name: hospital.name, phone: hospital.phone, isEmergency: false });
    setShowEmergencyCallModal(true);
    setSimulatedCallStatus("ringing");
  };

  const handleCallSOS = () => {
    setActiveCallTarget({ name: "Emergency Services (108)", phone: "108", isEmergency: true });
    setShowEmergencyCallModal(true);
    setSimulatedCallStatus("ringing");
  };

  // Check for emergency query param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("emergency") === "true") {
      handleCallSOS();
    }
  }, []);

  // Manage simulated call ringing & timer lifecycle
  useEffect(() => {
    let timerInterval: any;
    let ringingTimeout: any;

    if (simulatedCallStatus === "ringing") {
      setCallTimer(0);
      ringingTimeout = setTimeout(() => {
        setSimulatedCallStatus("connected");
      }, 2500); // Ring for 2.5 seconds before connecting
    } else if (simulatedCallStatus === "connected") {
      timerInterval = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }

    return () => {
      clearInterval(timerInterval);
      clearTimeout(ringingTimeout);
    };
  }, [simulatedCallStatus]);

  // Sample Health Alerts Data
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "warning",
      title: "Heatwave Alert ☀️",
      desc: "Temperatures expected to rise. Drink 4-5 liters of water daily and stay indoors.",
      time: "10 mins ago",
      unread: true,
    },
    {
      id: 2,
      type: "info",
      title: "Polio Vaccine Drive 💉",
      desc: "Free vaccination drive at Civil Hospital this Sunday. Bring infants aged 0-5.",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 3,
      type: "success",
      title: "Health Tip of the Day 🥦",
      desc: "Adding organic yogurt (curd) to light lunches aids digestion and immunity.",
      time: "1 day ago",
      unread: true,
    },
  ]);

  // Mock Hospital Directory
  const hospitals = [
    {
      name: "Community Health Centre (CHC)",
      type: "Government CHC",
      distance: "1.2 km",
      address: "Main Bazar Road, near Bus Stand",
      phone: "+91 98765 43210",
      status: "Open 24 Hours",
    },
    {
      name: "Civil Hospital & Trauma Centre",
      type: "District Hospital",
      distance: "4.5 km",
      address: "Hospital Road, Civil Lines Area",
      phone: "+91 76543 21098",
      status: "Emergency Open 24/7",
    },
    {
      name: "Saraswati Community Clinic",
      type: "Primary Health Sub-centre",
      distance: "0.8 km",
      address: "Panchayat Block Office Road",
      phone: "+91 87654 32109",
      status: "9:00 AM - 5:00 PM",
    },
  ];

  const downloadHealthCard = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 280" width="450" height="280">
      <defs>
        <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e40af" />
          <stop offset="100%" stop-color="#00796b" />
        </linearGradient>
      </defs>
      
      <!-- Card Border and Background -->
      <rect width="450" height="280" rx="20" fill="url(#cardGrad)" stroke="#1e40af" stroke-width="3" />
      <rect x="10" y="10" width="430" height="260" rx="15" fill="none" stroke="#ffffff" stroke-opacity="0.15" stroke-width="1.5" />
      
      <!-- Card Header -->
      <text x="225" y="35" fill="#ffffff" font-size="11" font-weight="800" text-anchor="middle" font-family="sans-serif" letter-spacing="1">MINISTRY OF HEALTH &amp; FAMILY WELFARE</text>
      <text x="225" y="52" fill="#81c784" font-size="10" font-weight="700" text-anchor="middle" font-family="sans-serif" letter-spacing="0.5">GOVERNMENT OF INDIA</text>
      <line x1="30" y1="65" x2="420" y2="65" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1" />
      
      <!-- Title -->
      <text x="225" y="85" fill="#ffffff" font-size="13" font-weight="900" text-anchor="middle" font-family="sans-serif">ABHA HEALTH ID CARD</text>
      <text x="225" y="98" fill="#e0f2f1" font-size="8" font-weight="600" text-anchor="middle" font-family="sans-serif" letter-spacing="2">AYUSHMAN BHARAT DIGITAL MISSION</text>

      <!-- Profile Avatar placeholder -->
      <circle cx="75" cy="170" r="35" fill="#ffffff" fill-opacity="0.15" stroke="#81c784" stroke-width="1.5" />
      <!-- simple user icon in SVG -->
      <path d="M75 155c-6.6 0-12 5.4-12 12s5.4 12 12 12 12-5.4 12-12-5.4-12-12-12zm-18 28c0-8 8-10 18-10s18 2 18 10v4H57v-4z" fill="#ffffff" />
      
      <!-- Details -->
      <text x="140" y="140" fill="#a7ffeb" font-size="9" font-weight="bold" font-family="sans-serif">NAME / નામ</text>
      <text x="140" y="156" fill="#ffffff" font-size="14" font-weight="900" font-family="sans-serif">PRATHAM PATEL</text>
      
      <text x="140" y="180" fill="#a7ffeb" font-size="9" font-weight="bold" font-family="sans-serif">ABHA NUMBER</text>
      <text x="140" y="196" fill="#ffffff" font-size="15" font-weight="900" font-family="sans-serif" letter-spacing="1">98-7654-3210-4321</text>
      
      <text x="140" y="220" fill="#a7ffeb" font-size="8" font-weight="bold" font-family="sans-serif">BLOOD GROUP</text>
      <text x="140" y="232" fill="#ffffff" font-size="10" font-weight="bold" font-family="sans-serif">O+ (Positive)</text>

      <text x="240" y="220" fill="#a7ffeb" font-size="8" font-weight="bold" font-family="sans-serif">YEAR OF BIRTH</text>
      <text x="240" y="232" fill="#ffffff" font-size="10" font-weight="bold" font-family="sans-serif">1998</text>

      <text x="340" y="220" fill="#a7ffeb" font-size="8" font-weight="bold" font-family="sans-serif">GENDER</text>
      <text x="340" y="232" fill="#ffffff" font-size="10" font-weight="bold" font-family="sans-serif">MALE</text>
      
      <!-- Status Badge -->
      <rect x="345" y="125" width="75" height="18" rx="9" fill="#1b5e20" stroke="#81c784" stroke-width="1" />
      <text x="382.5" y="137" fill="#ffffff" font-size="8" font-weight="bold" text-anchor="middle" font-family="sans-serif">✓ ACTIVE</text>
      
      <!-- Footer details -->
      <line x1="30" y1="248" x2="420" y2="248" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1" />
      <text x="225" y="262" fill="#ffffff" fill-opacity="0.6" font-size="8" font-weight="700" text-anchor="middle" font-family="sans-serif" letter-spacing="1">ISSUED BY SWASTHYAMITRA AI COMPANION</text>
    </svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Pratham_Patel_ABHA_Health_Card.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (lang === "gu" || lang === "hi" || lang === "en") setLanguage(lang);
  }, [lang]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;
    const userMessage = textToSend.trim();
    setInput("");

    const cleanMsg = userMessage.toLowerCase();
    const isHospitalTrigger = /\b(near hospital|nearby hospital|hospital near me|nearest hospital|find hospital|emergency hospital|hospital & asha contact)\b/i.test(cleanMsg) || cleanMsg.includes("hospital");
    const isEmergencyTrigger = /\b(chest pain|heart attack|stroke|difficulty breathing|heavy bleeding|unconscious|poison|severe burn|snake bite|emergency help)\b/i.test(cleanMsg);

    if (isHospitalTrigger || isEmergencyTrigger) {
      const langCode = detectLanguage(userMessage, language);
      const newMessages: ExtendedChatMessage[] = [
        ...messages,
        { role: "user", content: userMessage }
      ];

      const assistantIndex = newMessages.length;
      newMessages.push({
        role: "assistant",
        content: isEmergencyTrigger 
          ? (EMERGENCY_LOCALIZATION[langCode]?.high_risk_alert || EMERGENCY_LOCALIZATION.en.high_risk_alert)
          : (EMERGENCY_LOCALIZATION[langCode]?.here_are_hospitals || EMERGENCY_LOCALIZATION.en.here_are_hospitals),
        isEmergencyResponse: isEmergencyTrigger,
        isHospitalResponse: !isEmergencyTrigger,
        isLocationLoading: true,
        detectedLanguage: langCode,
        hospitalsData: [],
        ashaWorkerData: null
      });

      setMessages(newMessages);

      const startLocationWatch = () => {
        if (navigator.geolocation) {
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
          }

          watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lon = position.coords.longitude;
              setCurrentCoords({ lat, lon });
              updateMessageHospitals(assistantIndex, lat, lon);
            },
            (error) => {
              console.warn("Watch position error, falling back to Surat:", error);
              const fallbackLat = 21.1702;
              const fallbackLon = 72.8311;
              setCurrentCoords({ lat: fallbackLat, lon: fallbackLon });
              updateMessageHospitals(assistantIndex, fallbackLat, fallbackLon);
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        } else {
          const fallbackLat = 21.1702;
          const fallbackLon = 72.8311;
          setCurrentCoords({ lat: fallbackLat, lon: fallbackLon });
          updateMessageHospitals(assistantIndex, fallbackLat, fallbackLon);
        }
      };

      startLocationWatch();
      return;
    }

    const newMessages: ExtendedChatMessage[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const cleanMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      const payload: ChatRequest = { messages: cleanMessages, language };
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = (await response.json()) as ChatResponse;
        if (data?.reply) {
          setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
          return;
        }
      }
    } catch (e) {
      console.warn("SwasthyaMitra WhatsApp Chat network fallback:", e);
    } finally {
      setIsLoading(false);
    }

    const fallback =
      language === "gu"
        ? "🩺 **WhatsApp AI ડૉક્ટર સલાહ:**\nપૂરતો આરામ કરો અને પાણી પીવો. ગંભીર તકલીફ હોય તો 108 એમ્બ્યુલન્સ પર કૉલ કરો!"
        : language === "hi"
        ? "🩺 **WhatsApp AI डॉक्टर सलाह:**\nपर्याप्त विश्राम करें और पानी पिएं। गंभीर स्थिति में तुरंत 108 एम्बुलेंस डायल करें!"
        : "🩺 **WhatsApp AI Doctor Advice:**\nRest adequately and stay hydrated. For severe symptoms, please dial 108 ambulance immediately!";

    setMessages((prev) => [...prev, { role: "assistant", content: fallback }]);
  };

  const handleSend = () => sendMessage(input);

  const markAllAlertsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, unread: false })));
    setNotificationsCount(0);
  };

  const placeholder =
    language === "gu"
      ? "અહીં લક્ષણો અથવા સ્વાસ્થ્ય પ્રશ્ન પૂછો..."
      : language === "hi"
      ? "यहाँ लक्षण या स्वास्थ्य प्रश्न लिखें..."
      : "Type symptoms or health question...";

  return (
    <div className="h-screen w-full flex flex-col bg-[#eff6ff] dark:bg-slate-950 font-sans relative overflow-hidden">
      {/* Background Subtle Doodle Wave Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-10 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:16px_16px]"></div>

      {/* ── WhatsApp Premium Design Header ── */}
      <header className="z-30 bg-gradient-to-r from-[#1e40af] via-[#1e3a8a] to-[#1e40af] text-white shadow-md rounded-b-3xl">
        <div className="max-w-[1440px] mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap md:flex-nowrap">
          
          {/* Left Side: Logo + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src="/logo.png"
                alt="SwasthyaMitra AI"
                className="h-11 w-11 rounded-full bg-white p-0.5 object-contain shadow-sm border-2 border-blue-400"
              />
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-blue-400 border-2 border-[#1e3a8a] animate-pulse" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base font-black tracking-tight text-white leading-tight">
                  SwasthyaMitra AI Doctor
                </h1>
                <span className="bg-blue-400 text-[#1e40af] text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-flex items-center justify-center shrink-0 shadow-2xs">
                  ✔
                </span>
                <Badge className="bg-blue-500/20 text-blue-300 text-[9px] px-2 py-0 border border-blue-500/30 font-medium shrink-0 rounded-md">
                  Verified AI Doctor
                </Badge>
              </div>
              <p className="text-[11px] text-blue-100 flex items-center gap-1 mt-0.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping inline-block shrink-0" />
                Online 24/7 Health Companion
              </p>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2.5 ml-auto flex-wrap sm:flex-nowrap shrink-0 relative">
            
            {/* Custom Interactive Dropdown Wrapper */}
            <div className="relative flex items-center gap-1 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-1.5 border border-blue-600/30 transition cursor-pointer">
              <span className="text-[11px] font-bold text-blue-100 flex items-center gap-1">
                🌐 {language === "gu" ? "ગુજરાતી" : language === "hi" ? "हिन्दी" : "English"} ∨
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-slate-950 bg-white"
                style={{ color: "black", backgroundColor: "white" }}
                title="Select Language"
              >
                <option value="en" className="text-slate-950 bg-white" style={{ color: "black", backgroundColor: "white" }}>English</option>
                <option value="hi" className="text-slate-950 bg-white" style={{ color: "black", backgroundColor: "white" }}>हिंदी</option>
                <option value="gu" className="text-slate-950 bg-white" style={{ color: "black", backgroundColor: "white" }}>ગુજરાતી</option>
              </select>
            </div>

            {/* Custom Working Hospitals Directory Trigger */}
            <Button
              onClick={() => setShowHospitalsModal(true)}
              className="bg-[#1d4ed8] hover:bg-[#2563eb] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-blue-600/30 transition shadow-2xs"
            >
              <Building2 className="h-3.5 w-3.5 text-blue-300" />
              Hospitals
            </Button>

            {/* Working Emergency Call Button */}
            <Button
              onClick={() => {
                setShowEmergencyCallModal(true);
                setSimulatedCallStatus("ringing");
              }}
              className="bg-[#d32f2f] hover:bg-[#b71c1c] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer h-auto border-none"
            >
              <PhoneCall className="h-3.5 w-3.5 animate-bounce" />
              Emergency 108
            </Button>

            {/* Working Notifications Bell Alert Box */}
            <div className="relative shrink-0">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 rounded-xl hover:bg-white/10 transition flex items-center justify-center shrink-0"
              >
                <Bell className="h-5 w-5 text-white" />
                {notificationsCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-[#d32f2f] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-[#1e3a8a]">
                    {notificationsCount}
                  </span>
                )}
              </button>

              {/* Working Notifications Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-3 text-slate-800 dark:text-slate-200 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                      🔔 Recent Health Alerts
                    </span>
                    {notificationsCount > 0 && (
                      <button 
                        onClick={markAllAlertsRead}
                        className="text-[10px] text-[#1e3a8a] dark:text-blue-400 font-bold hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {alerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={cn(
                          "p-2.5 rounded-xl border text-[11px] leading-relaxed transition-colors",
                          alert.unread 
                            ? "bg-blue-50/50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/40" 
                            : "bg-slate-50 border-slate-100 dark:bg-slate-800/40 dark:border-slate-800"
                        )}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1 font-bold">
                          <span className={cn(
                            alert.type === "warning" ? "text-amber-700 dark:text-amber-400" : "text-[#1e3a8a] dark:text-blue-400"
                          )}>
                            {alert.title}
                          </span>
                          <span className="text-[9px] text-slate-400 font-normal">{alert.time}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">{alert.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Working User Profile Menu Trigger */}
            <div 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-xl px-2.5 py-1.5 cursor-pointer border border-blue-600/30 transition shrink-0"
            >
              <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-2xs border border-white/20">
                👤
              </div>
              <span className="text-[11px] font-bold text-white hidden sm:inline">My Profile</span>
              <ChevronDown className="h-3 w-3 text-white" />
            </div>

          </div>

        </div>
      </header>

      {/* ── Main Chat Scroll Area ── */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="max-w-[1200px] mx-auto px-4 py-5 flex flex-col gap-4">
            
            {/* Premium Date Chip */}
            <div className="flex justify-center mb-2">
              <span className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold px-4 py-1.5 rounded-full shadow-xs border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                📅 {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>

            {/* Custom Welcome Message Dashboard Card */}
            <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-3xl shadow-md p-4 sm:p-6 transition-all">
              {/* Card Title Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1e40af] dark:text-blue-400">
                  <Stethoscope className="h-5 w-5" />
                  <span>SwasthyaMitra AI Doctor</span>
                </div>
                <Badge variant="outline" className="text-[10px] py-0.5 border-blue-300 text-blue-700 dark:text-blue-300 bg-blue-50/40">
                  24/7 AI Medical
                </Badge>
              </div>

              {/* Main Content Info Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                
                {/* Features & Prompt Columns */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      👋 SwasthyaMitra WhatsApp AI Doctor Active!
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      Welcome! I am your 24/7 AI Healthcare Assistant.
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Describe any health issue or symptom, and I will instantly provide:
                    </p>
                  </div>

                  {/* 2 Column Quick Option Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button onClick={() => sendMessage("Possible Causes")} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 transition text-left text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-2">🧠 Possible Causes 🧠</span>
                      <span className="text-slate-400 font-bold">›</span>
                    </button>
                    <button onClick={() => sendMessage("Nearest Hospital")} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 transition text-left text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-2">🏥 Hospital & ASHA Contact</span>
                      <span className="text-slate-400 font-bold">›</span>
                    </button>
                    <button onClick={() => sendMessage("Home Remedies")} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 transition text-left text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-2">🥦 Home Remedies 🌿</span>
                      <span className="text-slate-400 font-bold">›</span>
                    </button>
                    <button onClick={() => sendMessage("Health Tips")} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 transition text-left text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-2">🛡️ Health Tips & Prevention</span>
                      <span className="text-slate-400 font-bold">›</span>
                    </button>
                    <button onClick={() => sendMessage("Safe OTC Medicines")} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 transition text-left text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-2">💊 Safe OTC Medicines</span>
                      <span className="text-slate-400 font-bold">›</span>
                    </button>
                    <button onClick={() => sendMessage("Lifestyle & Wellness")} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 transition text-left text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-2">🧘 Lifestyle & Wellness</span>
                      <span className="text-slate-400 font-bold">›</span>
                    </button>
                    <button onClick={() => sendMessage("When to See a Doctor")} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 transition text-left text-xs font-semibold text-slate-700 sm:col-span-2">
                      <span className="flex items-center gap-2">⚠️ When to See a Doctor ⚠️</span>
                      <span className="text-slate-400 font-bold">›</span>
                    </button>
                  </div>
                </div>

                {/* Friendly Female Doctor Illustration Area */}
                <div className="lg:col-span-4 flex items-center justify-center relative">
                  <div className="relative w-44 h-44 rounded-full bg-blue-100/60 dark:bg-blue-950/40 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-md">
                    <img
                      src="/female_doctor_avatar.png"
                      alt="Verified Doctor"
                      className="h-full w-full object-cover rounded-full"
                    />
                    <span className="absolute -top-1 -right-1 bg-blue-400 text-white p-1 rounded-full shadow-md border-2 border-white animate-bounce">
                      💚
                    </span>
                  </div>
                </div>

              </div>

              {/* Bottom Quote Greetings Accent Box */}
              <div className="mt-5 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/40 space-y-1">
                <p className="text-xs font-bold text-[#1e3a8a] dark:text-blue-400 font-serif italic">
                  “ नमस्ते! स्वास्थ्यमित्र WhatsApp AI डॉक्टर सेवा में आपका स्वागत है।
                </p>
                <p className="text-xs font-bold text-[#1e3a8a] dark:text-blue-400 font-serif italic">
                  “ નમસ્તે! સ્વાસ્થ્યમિત્ર WhatsApp AI ડૉક્ટર સેવામાં સ્વાગત છે.
                </p>
                <span className="block text-[10px] text-right text-slate-400 mt-1 font-mono">03:59 AM</span>
              </div>
            </div>

            {/* Render Conversational Chat bubbles */}
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              const timeString = new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={index}
                  className={cn("flex w-full items-end gap-2", isUser ? "justify-end" : "justify-start")}
                >
                  {/* Left Avatar icon for Bot */}
                  {!isUser && (
                    <div className="h-8 w-8 rounded-full bg-[#1e3a8a] flex items-center justify-center text-xs font-bold text-white shrink-0 shadow border border-blue-400">
                      👩‍⚕️
                    </div>
                  )}

                  <div
                    className={cn(
                      "relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 pt-3 pb-2 shadow-sm text-sm border",
                      isUser
                        ? "bg-[#dbeafe] dark:bg-blue-950 text-slate-900 dark:text-blue-100 rounded-tr-none border-blue-300/80 dark:border-blue-800"
                        : "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-tl-none border-slate-200/90 dark:border-slate-800 shadow-md"
                    )}
                  >
                    {/* Bot Header label inside bubble */}
                    {!isUser && (
                      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1e3a8a] dark:text-blue-400">
                          <Stethoscope className="h-4 w-4" />
                          <span>SwasthyaMitra AI Doctor</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleTogglePlayMsg(msg.content, index)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                            title="Listen to response"
                          >
                            {playingMsgIndex === index ? (
                              <VolumeX className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                            ) : (
                              <Volume2 className="h-3.5 w-3.5 text-slate-500 hover:text-blue-600 dark:text-slate-400" />
                            )}
                          </button>
                          <Badge variant="outline" className="text-[10px] py-0 border-blue-300 text-blue-700 dark:text-blue-300">
                            24/7 AI Medical
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Formatted Content */}
                    <div className="space-y-0.5">
                      {renderMessageContent(msg.content)}
                    </div>

                    {/* Dynamic Emergency / Hospital Cards Rendering */}
                    {(msg.isHospitalResponse || msg.isEmergencyResponse) && (
                      msg.isLocationLoading ? (
                        <div className="space-y-4 my-3 animate-pulse text-left min-w-[280px] sm:min-w-[450px]">
                          <div className="flex items-center gap-2.5 text-xs text-blue-600 dark:text-blue-400 font-bold">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>
                              {EMERGENCY_LOCALIZATION[msg.detectedLanguage as keyof typeof EMERGENCY_LOCALIZATION]?.loading_hospitals || EMERGENCY_LOCALIZATION.en.loading_hospitals}
                            </span>
                          </div>
                          {/* Skeleton Cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {[1, 2, 3, 4].map((n) => (
                              <div key={n} className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                                <div className="h-28 w-full bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                                <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded-md" />
                                <div className="h-3.5 w-1/3 bg-slate-200 dark:bg-slate-700 rounded-md" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-5 my-3 text-left min-w-[280px] sm:min-w-[450px] max-w-full">
                          {msg.isEmergencyResponse && (
                            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-3xl p-4 text-left shadow-sm">
                              <h4 className="font-black text-red-600 dark:text-red-400 text-sm flex items-center gap-2 uppercase tracking-wide">
                                <AlertTriangle className="h-5 w-5 animate-pulse shrink-0 text-red-500" />
                                {EMERGENCY_LOCALIZATION[msg.detectedLanguage as keyof typeof EMERGENCY_LOCALIZATION]?.high_risk_alert || EMERGENCY_LOCALIZATION.en.high_risk_alert}
                              </h4>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1.5">
                                {EMERGENCY_LOCALIZATION[msg.detectedLanguage as keyof typeof EMERGENCY_LOCALIZATION]?.medical_emergency || EMERGENCY_LOCALIZATION.en.medical_emergency}
                              </p>
                              
                              {/* Call 108 Emergency Big Red Button */}
                              <a
                                href="tel:108"
                                className="mt-3.5 w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 h-12 shadow-lg shadow-red-900/30 border-0 active:scale-[0.98] transition-all cursor-pointer"
                              >
                                <Phone className="h-5 w-5 animate-bounce" />
                                {EMERGENCY_LOCALIZATION[msg.detectedLanguage as keyof typeof EMERGENCY_LOCALIZATION]?.call_108 || EMERGENCY_LOCALIZATION.en.call_108}
                              </a>

                              {/* First-Aid Tips */}
                              <div className="mt-4 border-t border-red-100 dark:border-red-900/30 pt-3">
                                <h5 className="font-bold text-[11px] text-red-700 dark:text-red-400 uppercase tracking-wide mb-2">
                                  {EMERGENCY_LOCALIZATION[msg.detectedLanguage as keyof typeof EMERGENCY_LOCALIZATION]?.first_aid_tips || EMERGENCY_LOCALIZATION.en.first_aid_tips}
                                </h5>
                                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pl-4 list-disc font-medium">
                                  {(EMERGENCY_LOCALIZATION[msg.detectedLanguage as keyof typeof EMERGENCY_LOCALIZATION]?.first_aid || EMERGENCY_LOCALIZATION.en.first_aid).map((tip, idx) => (
                                    <li key={idx}>{tip}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* List of hospitals */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {msg.hospitalsData?.map((h, i) => (
                              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300 flex flex-col group hover:scale-[1.01]">
                                
                                {/* Hospital Image */}
                                <div className="h-28 w-full overflow-hidden relative bg-slate-100 dark:bg-slate-800 shrink-0">
                                  <img
                                    src={h.imageUrl}
                                    alt={h.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                  {h.status && (
                                    <span className="absolute top-2.5 right-2.5 bg-emerald-500 text-white font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                                      {EMERGENCY_LOCALIZATION[msg.detectedLanguage as keyof typeof EMERGENCY_LOCALIZATION]?.open || EMERGENCY_LOCALIZATION.en.open}
                                    </span>
                                  )}
                                </div>

                                <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                                  <div className="space-y-1">
                                    <h5 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                                      {translateText(h.name, msg.detectedLanguage as any)}
                                    </h5>
                                    
                                    {/* Ratings */}
                                    <div className="flex items-center gap-1">
                                      <span className="text-amber-500 text-xs">★</span>
                                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{h.rating.toFixed(1)}</span>
                                    </div>

                                    {/* Distance & Address */}
                                    <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      <span>{h.distance} km {EMERGENCY_LOCALIZATION[msg.detectedLanguage as keyof typeof EMERGENCY_LOCALIZATION]?.away || EMERGENCY_LOCALIZATION.en.away}</span>
                                    </div>

                                    <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-snug">
                                      {translateText(h.address, msg.detectedLanguage as any)}
                                    </p>
                                  </div>

                                  {/* Call details */}
                                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2 flex items-center gap-1">
                                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                                    <span>{h.phone}</span>
                                  </div>

                                  {/* Buttons layout */}
                                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                                    <a
                                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name + " " + h.address)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="bg-blue-50 hover:bg-blue-100 text-[#1e3a8a] text-[10.5px] font-bold px-2 py-1.5 rounded-xl flex items-center justify-center gap-1 border border-blue-100 active:scale-[0.98] transition-all cursor-pointer"
                                    >
                                      <MapPin className="h-3 w-3" />
                                      <span>{EMERGENCY_LOCALIZATION[msg.detectedLanguage as keyof typeof EMERGENCY_LOCALIZATION]?.open_map || EMERGENCY_LOCALIZATION.en.open_map}</span>
                                    </a>
                                    
                                    <a
                                      href={`tel:${h.phone}`}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-bold px-2 py-1.5 rounded-xl flex items-center justify-center gap-1 active:scale-[0.98] transition-all cursor-pointer border-0"
                                    >
                                      <Phone className="h-3 w-3" />
                                      <span>{EMERGENCY_LOCALIZATION[msg.detectedLanguage as keyof typeof EMERGENCY_LOCALIZATION]?.call || EMERGENCY_LOCALIZATION.en.call}</span>
                                    </a>

                                    {h.website && (
                                      <a
                                        href={h.website}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10.5px] font-bold px-2 py-1.5 rounded-xl flex items-center justify-center gap-1 col-span-2 active:scale-[0.98] transition-all cursor-pointer border-0 text-center"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                        <span>{EMERGENCY_LOCALIZATION[msg.detectedLanguage as keyof typeof EMERGENCY_LOCALIZATION]?.website || EMERGENCY_LOCALIZATION.en.website}</span>
                                      </a>
                                    )}
                                  </div>

                                </div>
                              </div>
                            ))}
                          </div>

                          {/* ASHA Worker section */}
                          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-1">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pl-1">
                              {EMERGENCY_LOCALIZATION[msg.detectedLanguage as keyof typeof EMERGENCY_LOCALIZATION]?.near_asha_worker || EMERGENCY_LOCALIZATION.en.near_asha_worker}
                            </h4>
                            
                            {msg.ashaWorkerData ? (
                              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-lg">
                                <div className="flex items-center gap-3.5">
                                  <div className="h-14 w-14 rounded-full overflow-hidden shrink-0 border-2 border-[#1e3a8a] bg-blue-50 shadow-xs">
                                    <img
                                      src={msg.ashaWorkerData.avatarUrl}
                                      alt={msg.ashaWorkerData.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="space-y-0.5">
                                    <h5 className="font-black text-sm text-slate-900 dark:text-white">
                                      {translateText(msg.ashaWorkerData.name, msg.detectedLanguage as any)}
                                    </h5>
                                    <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
                                      {translateText(msg.ashaWorkerData.village, msg.detectedLanguage as any)}, {translateText(msg.ashaWorkerData.district, msg.detectedLanguage as any)}
                                    </p>
                                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block">
                                      {msg.ashaWorkerData.distanceKm} km {EMERGENCY_LOCALIZATION[msg.detectedLanguage as keyof typeof EMERGENCY_LOCALIZATION]?.away || EMERGENCY_LOCALIZATION.en.away}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 shrink-0">
                                  <a
                                    href={`tel:${msg.ashaWorkerData.phone.replace(/\s+/g, "")}`}
                                    className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1 shadow-xs border-0 active:scale-[0.98] transition cursor-pointer"
                                  >
                                    <Phone className="h-3.5 w-3.5" />
                                    <span>{EMERGENCY_LOCALIZATION[msg.detectedLanguage as keyof typeof EMERGENCY_LOCALIZATION]?.call || EMERGENCY_LOCALIZATION.en.call}</span>
                                  </a>
                                  
                                  <a
                                    href={`https://wa.me/${msg.ashaWorkerData.phone.replace(/[^0-9]/g, "")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 sm:flex-initial bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1 shadow-xs border-0 active:scale-[0.98] transition cursor-pointer"
                                  >
                                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.666.988 3.313 1.488 5.349 1.489 5.385.002 9.764-4.376 9.767-9.764.001-2.61-1.01-5.064-2.85-6.906C17.065 2.128 14.61 1.116 12 1.117 6.617 1.117 2.24 5.492 2.237 10.88c-.001 2.039.507 4.02 1.492 5.727l-.961 3.509 3.59-.942h.001-.001zm10.741-6.987c-.294-.148-1.745-.862-2.015-.961-.271-.099-.467-.148-.663.148-.196.297-.761.961-.933 1.159-.172.197-.344.222-.638.074-1.429-.715-2.385-1.272-3.342-2.909-.253-.433.253-.402.723-1.347.079-.158.04-.297-.02-.421-.06-.124-.467-1.126-.64-1.54-.168-.406-.339-.35-.467-.357l-.398-.008c-.136 0-.358.051-.546.256-.188.205-.717.701-.717 1.709 0 1.008.733 1.98.835 2.118.102.137 1.442 2.202 3.493 3.087 2.05.885 2.05.59 2.428.556.378-.034 1.745-.713 1.99-1.402.245-.689.245-1.28.172-1.402-.073-.123-.27-.197-.565-.345z" />
                                    </svg>
                                    <span>{EMERGENCY_LOCALIZATION[msg.detectedLanguage as keyof typeof EMERGENCY_LOCALIZATION]?.whatsapp || EMERGENCY_LOCALIZATION.en.whatsapp}</span>
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 font-medium pl-1">
                                {EMERGENCY_LOCALIZATION[msg.detectedLanguage as keyof typeof EMERGENCY_LOCALIZATION]?.no_asha_worker || EMERGENCY_LOCALIZATION.en.no_asha_worker}
                              </p>
                            )}
                          </div>

                        </div>
                      )
                    )}

                    {/* Time & Double tick indicator */}
                    <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      <span>{timeString}</span>
                      {isUser && <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb] font-black" />}
                    </div>
                  </div>

                  {/* Right Avatar icon for User */}
                  {isUser && (
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow border border-indigo-400">
                      👤
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Loader */}
            {isLoading && (
              <div className="flex items-end gap-2">
                <div className="h-8 w-8 rounded-full bg-[#1e3a8a] flex items-center justify-center text-xs font-bold text-white shrink-0 shadow border border-blue-400">
                  👩‍⚕️
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-3.5 max-w-[70%] flex items-center gap-3 shadow-md">
                  <Loader2 className="h-4 w-4 animate-spin text-[#1e3a8a] dark:text-blue-400 shrink-0" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    AI Doctor is writing response...
                  </span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      {/* ── WhatsApp Footer Input (Mockup styled floating panel) ── */}
      <footer className="z-20 p-3 sm:p-4 max-w-4xl w-full mx-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-lg p-2 flex items-center gap-2">
          
          {/* Voice Input Mic */}
          <VoiceInput 
            lang={language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-US'}
            onResult={(text) => setInput((prev) => (prev ? `${prev} ${text}` : text))} 
          />

          {/* Input text */}
          <Input
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            className="flex-1 rounded-full border-none focus-visible:ring-0 bg-transparent text-sm px-2 shadow-none focus-visible:outline-none dark:text-white"
            disabled={isLoading}
          />

          {/* Send Icon Trigger */}
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="rounded-full h-10 w-10 bg-[#1e3a8a] hover:bg-[#1e40af] text-white shrink-0 flex items-center justify-center transition-transform active:scale-95 shadow-md"
          >
            <Send className="h-4.5 w-4.5 rotate-45" />
          </Button>
        </div>
      </footer>

      {/* ── Working Popups/Modals for Header Buttons ── */}

      {/* 1. Hospitals Directory Modal */}
      {showHospitalsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-[#1e3a8a] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <h3 className="font-bold text-base">Emergency Hospital Directory</h3>
              </div>
              <button 
                onClick={() => setShowHospitalsModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Showing Nearest Government health centers & Civil emergency facilities
              </p>
              
              <div className="space-y-3">
                {hospitals.map((hospital, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 bg-slate-50/50 dark:bg-slate-800/40 space-y-2.5 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{hospital.name}</h4>
                        <span className="text-[10px] bg-blue-50 dark:bg-blue-950/40 text-[#1e3a8a] dark:text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-100">
                          {hospital.type}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-blue-600" /> {hospital.distance}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      {hospital.address}
                    </p>

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] text-[#1e3a8a] dark:text-blue-400 font-bold flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {hospital.status}
                      </span>
                      <button 
                        onClick={() => handleCallHospital(hospital)}
                        className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition border-none cursor-pointer"
                      >
                        <Phone className="h-3 w-3" /> Call Hospital
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button onClick={() => setShowHospitalsModal(false)} className="bg-[#1e3a8a] hover:bg-[#1e40af] rounded-xl text-white font-bold text-xs">
                Close Directory
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. My Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-[#1e3a8a] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <h3 className="font-bold text-base">Patient Profile Details</h3>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="h-16 w-16 rounded-full bg-[#eff6ff] border-2 border-[#1e3a8a] flex items-center justify-center text-3xl shadow-sm">
                  👤
                </div>
                <div>
                  <h4 className="font-black text-lg text-slate-900 dark:text-white">Pratham Patel</h4>
                  <p className="text-xs text-slate-500 font-medium">Registered Patient Profile</p>
                  <Badge className="bg-blue-500/20 text-[#1e3a8a] border border-blue-500/30 text-[10px] mt-1">
                    ABHA ID: 98-7654-3210-4321
                  </Badge>
                </div>
              </div>

              {/* Health stats details */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Blood Group</span>
                  <span className="text-base font-black text-red-600 flex items-center gap-1">
                    <Heart className="h-4 w-4 fill-red-600" /> O+ (Positive)
                  </span>
                </div>
                <div className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Ayushman Card</span>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Active Policy
                  </span>
                </div>
                <div className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Emergency Contact</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    +91 96012 62388
                  </span>
                </div>
                <div className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Family ASHA Worker</span>
                  <span className="text-xs font-bold text-[#1e3a8a] dark:text-blue-400">
                    Gitaben Patel
                  </span>
                </div>
              </div>

              {/* Action details */}
              <div className="space-y-2 pt-2">
                <Button 
                  onClick={downloadHealthCard}
                  className="w-full bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 h-11"
                >
                  <Download className="h-4 w-4" /> Download Health ID Card
                </Button>
                <Button onClick={() => setShowProfileModal(false)} variant="outline" className="w-full border-slate-200 text-slate-600 rounded-xl font-bold text-xs h-11">
                  Close Profile
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 3. Emergency 108 Simulated Call Modal */}
      {showEmergencyCallModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-red-900/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
            
            {/* Dark background light glow effect */}
            <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

            <div className="relative p-6 sm:p-8 flex flex-col items-center text-center">
              
              {/* Pulsing ambulance/phone animation */}
              <div className="relative mb-6">
                <div className={cn(
                  "h-24 w-24 rounded-full flex items-center justify-center shadow-lg relative",
                  activeCallTarget?.isEmergency 
                    ? "bg-red-600/20 border-2 border-red-500 shadow-red-500/10" 
                    : "bg-blue-600/20 border-2 border-blue-500 shadow-blue-500/10",
                  simulatedCallStatus !== "ended" && "animate-pulse"
                )}>
                  {activeCallTarget?.isEmergency ? (
                    <PhoneCall className={cn(
                      "h-10 w-10 text-red-500",
                      simulatedCallStatus === "ringing" && "animate-bounce"
                    )} />
                  ) : (
                    <Building2 className="h-10 w-10 text-blue-500" />
                  )}
                </div>
                {simulatedCallStatus === "ringing" && (
                  <span className={cn(
                    "absolute inset-0 rounded-full border-4 animate-ping",
                    activeCallTarget?.isEmergency ? "border-red-500/40" : "border-blue-500/40"
                  )} />
                )}
                {simulatedCallStatus === "connected" && (
                  <span className="absolute inset-0 rounded-full border-4 border-emerald-500/30 animate-pulse" />
                )}
              </div>

              {/* Title & Status */}
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2 justify-center">
                {activeCallTarget?.isEmergency ? (
                  <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
                ) : (
                  <Building2 className="h-5 w-5 text-blue-400" />
                )}
                {activeCallTarget?.name || "Emergency Services (108)"}
              </h3>
              
              <div className="mt-2.5 flex items-center justify-center gap-2">
                <span className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  simulatedCallStatus === "ringing" ? "bg-amber-500 animate-ping" :
                  simulatedCallStatus === "connected" ? "bg-emerald-500 animate-pulse" : "bg-slate-500"
                )} />
                <span className="text-sm font-bold tracking-wide uppercase font-mono text-slate-300">
                  {simulatedCallStatus === "ringing" && `Dialing ${activeCallTarget?.phone || "108"} / Connecting...`}
                  {simulatedCallStatus === "connected" && "Call Connected • Active"}
                  {simulatedCallStatus === "ended" && "Call Ended"}
                </span>
              </div>

              {/* Call Timer */}
              {simulatedCallStatus === "connected" && (
                <div className="mt-3 text-3xl font-black font-mono text-white tracking-widest bg-slate-800/80 px-4 py-1 rounded-xl border border-slate-700/50 shadow-inner">
                  {Math.floor(callTimer / 60).toString().padStart(2, "0")}:
                  {(callTimer % 60).toString().padStart(2, "0")}
                </div>
              )}

              {/* Live Simulated Dispatch Data logs */}
              {simulatedCallStatus === "connected" && (
                activeCallTarget?.isEmergency ? (
                  <div className="mt-6 w-full text-left bg-slate-950/80 border border-slate-800 rounded-2xl p-4 font-sans text-xs space-y-2.5 max-h-[160px] overflow-y-auto">
                    <div className="flex items-center justify-between text-slate-400 font-bold border-b border-slate-800 pb-1.5 uppercase tracking-wider text-[9px]">
                      <span>🚑 Live Dispatch Feeds</span>
                      <span className="text-emerald-400">✓ TRANSMITTING</span>
                    </div>
                    <p className="text-emerald-400 font-medium flex items-start gap-1.5">
                      <span className="text-[10px]">📡</span> GPS location shared: <strong>Nabha CHC Sector, Patiala District</strong>
                    </p>
                    <p className="text-slate-300 flex items-start gap-1.5">
                      <span className="text-[10px]">👩‍⚕️</span> ASHA Worker <strong>Anitaben Parmar</strong> alerted & en-route
                    </p>
                    <p className="text-slate-300 flex items-start gap-1.5">
                      <span className="text-[10px]">🚚</span> Ambulance <strong>PB-11-XX-9876</strong> dispatched (ETA 9 mins)
                    </p>
                    <p className="text-slate-400 leading-normal italic text-[11px] pt-1.5 border-t border-slate-800">
                      "Please keep the patient comfortable and airway clear. Our response team is speaking with you now."
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 w-full text-left bg-slate-950/80 border border-slate-800 rounded-2xl p-4 font-sans text-xs space-y-2.5 max-h-[160px] overflow-y-auto">
                    <div className="flex items-center justify-between text-slate-400 font-bold border-b border-slate-800 pb-1.5 uppercase tracking-wider text-[9px]">
                      <span>📞 Hospital Connection Logs</span>
                      <span className="text-emerald-400">✓ CONNECTED</span>
                    </div>
                    <p className="text-emerald-400 font-medium flex items-start gap-1.5">
                      <span className="text-[10px]">📡</span> Line connected to: <strong>{activeCallTarget?.name} Reception</strong>
                    </p>
                    <p className="text-slate-300 flex items-start gap-1.5">
                      <span className="text-[10px]">🩺</span> Direct Line: <strong className="text-blue-400">{activeCallTarget?.phone}</strong>
                    </p>
                    <p className="text-slate-300 flex items-start gap-1.5">
                      <span className="text-[10px]">⏳</span> Queue status: <strong>Simulated Doctor consultation desk active</strong>
                    </p>
                    <p className="text-slate-400 leading-normal italic text-[11px] pt-1.5 border-t border-slate-800">
                      "Thank you for calling. Our receptionist or duty medical officer is ready to assist you."
                    </p>
                  </div>
                )
              )}

              {/* Instructions checklist */}
              {simulatedCallStatus === "connected" && (
                activeCallTarget?.isEmergency ? (
                  <div className="mt-5 w-full text-left bg-red-950/15 border border-red-900/30 rounded-2xl p-4 text-xs space-y-2">
                    <h4 className="font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4" /> First-Aid Actions While Waiting:
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                      <li>Lay patient flat in a quiet, airy space.</li>
                      <li>Loosen tight clothes around the neck/chest.</li>
                      <li>Do not give solid foods, liquids or drugs if patient is sluggish.</li>
                      <li>Cover the patient lightly if shivering.</li>
                    </ul>
                  </div>
                ) : (
                  <div className="mt-5 w-full text-left bg-blue-950/15 border border-blue-900/30 rounded-2xl p-4 text-xs space-y-2">
                    <h4 className="font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" /> Hospital Information Checklist:
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                      <li>State patient's symptoms clearly to the receptionist.</li>
                      <li>Have your ABHA Health ID number ready for quicker intake.</li>
                      <li>Confirm if emergency trauma services or standard OPD is needed.</li>
                    </ul>
                  </div>
                )
              )}

              {simulatedCallStatus === "ringing" && (
                <div className="mt-8 text-xs text-slate-400 font-medium leading-relaxed max-w-xs">
                  {activeCallTarget?.isEmergency 
                    ? "Connecting to SwasthyaMitra emergency response console. Your GPS coordinates are being parsed."
                    : `Connecting to ${activeCallTarget?.name} line. Establishing encrypted digital audio stream.`}
                </div>
              )}

              {/* Call Buttons / Controls */}
              <div className="mt-8 w-full space-y-3">
                {simulatedCallStatus !== "ended" ? (
                  <Button
                    onClick={() => setSimulatedCallStatus("ended")}
                    className="w-full bg-[#d32f2f] hover:bg-[#b71c1c] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 h-12 shadow-lg shadow-red-900/30 border-none"
                  >
                    <Phone className="h-4 w-4 rotate-135" /> End Simulated Call
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setSimulatedCallStatus("ringing");
                      setCallTimer(0);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 h-12 border-none"
                  >
                    <Phone className="h-4 w-4" /> Call Again
                  </Button>
                )}

                {/* Real Fallback Dialer Trigger Option */}
                <a
                  href={`tel:${activeCallTarget?.phone || "108"}`}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 h-12 border border-slate-700/60 transition active:scale-98"
                >
                  <ExternalLink className="h-4 w-4" /> Call {activeCallTarget?.phone || "108"} (Real Device Dialer)
                </a>

                <Button
                  onClick={() => {
                    setShowEmergencyCallModal(false);
                    setSimulatedCallStatus("idle");
                  }}
                  variant="ghost"
                  className="w-full text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-2xl font-bold text-xs h-10 border-none"
                >
                  Close Panel
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
