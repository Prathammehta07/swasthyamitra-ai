import { RequestHandler } from "express";
import type { AdvancedSymptomCheckInput, AdvancedSymptomCheckResult, SymptomCheckResult, TriageLevel } from "@shared/api";
import { SymptomService, SymptomRecordService } from "../services/database";
import { generateAIContent } from "../services/ai";

// Enhanced symptoms database
const COMPREHENSIVE_SYMPTOMS = [
  // Basic symptoms
  { key: "fever", label: "Fever", severity: "moderate", category: "general" },
  { key: "cough", label: "Cough", severity: "mild", category: "respiratory" },
  { key: "breath", label: "Difficulty breathing", severity: "high", category: "respiratory" },
  { key: "chest_pain", label: "Chest pain", severity: "high", category: "cardiovascular" },
  { key: "headache", label: "Headache", severity: "mild", category: "neurological" },
  { key: "nausea", label: "Nausea", severity: "mild", category: "gastrointestinal" },
  { key: "vomiting", label: "Vomiting", severity: "moderate", category: "gastrointestinal" },
  { key: "diarrhea", label: "Diarrhea", severity: "moderate", category: "gastrointestinal" },
  { key: "fatigue", label: "Extreme fatigue", severity: "mild", category: "general" },
  { key: "dizziness", label: "Dizziness", severity: "moderate", category: "neurological" },
  
  // Advanced symptoms
  { key: "abdominal_pain", label: "Abdominal pain", severity: "moderate", category: "gastrointestinal" },
  { key: "back_pain", label: "Back pain", severity: "mild", category: "musculoskeletal" },
  { key: "joint_pain", label: "Joint pain", severity: "mild", category: "musculoskeletal" },
  { key: "skin_rash", label: "Skin rash", severity: "mild", category: "dermatological" },
  { key: "sore_throat", label: "Sore throat", severity: "mild", category: "respiratory" },
  { key: "runny_nose", label: "Runny nose", severity: "mild", category: "respiratory" },
  { key: "loss_smell", label: "Loss of smell/taste", severity: "moderate", category: "neurological" },
  { key: "muscle_aches", label: "Muscle aches", severity: "mild", category: "musculoskeletal" },
  { key: "confusion", label: "Confusion", severity: "high", category: "neurological" },
  { key: "vision_changes", label: "Vision changes", severity: "high", category: "neurological" },
  { key: "difficulty_swallowing", label: "Difficulty swallowing", severity: "moderate", category: "gastrointestinal" },
  { key: "palpitations", label: "Heart palpitations", severity: "moderate", category: "cardiovascular" },
  { key: "sweating", label: "Excessive sweating", severity: "mild", category: "general" },
  { key: "weight_loss", label: "Unexplained weight loss", severity: "moderate", category: "general" },
  { key: "bloody_stool", label: "Blood in stool", severity: "high", category: "gastrointestinal" },
  { key: "difficulty_urinating", label: "Difficulty urinating", severity: "moderate", category: "genitourinary" },
];

// Advanced triage logic
function performAdvancedTriage(input: AdvancedSymptomCheckInput): SymptomCheckResult {
  const symptoms = new Set(input.symptoms);
  const redFlags: string[] = [];
  const recommendations: string[] = [];
  let triageLevel: TriageLevel = "self_care";
  let advice = "Monitor symptoms and rest.";
  let followUpInDays = 7;

  // Critical symptoms check
  const criticalSymptoms = ["chest_pain", "breath", "confusion", "bloody_stool", "vision_changes"];
  const emergencySymptoms = criticalSymptoms.filter(s => symptoms.has(s));
  
  if (emergencySymptoms.length > 0) {
    triageLevel = "emergency";
    advice = "Seek immediate emergency care. Call emergency services.";
    redFlags.push(...emergencySymptoms.map(s => COMPREHENSIVE_SYMPTOMS.find(cs => cs.key === s)?.label || s));
    followUpInDays = 0;
  }

  // Age-based risk factors
  if (input.age > 65) {
    if (symptoms.has("fever") || symptoms.has("cough") || symptoms.has("breath")) {
      redFlags.push("Advanced age with respiratory symptoms");
      if (triageLevel === "self_care") {
        triageLevel = "doctor";
        advice = "Consult a doctor due to age-related risk factors.";
        followUpInDays = 2;
      }
    }
  }

  if (input.age < 2) {
    if (symptoms.has("fever") || symptoms.has("vomiting") || symptoms.has("diarrhea")) {
      redFlags.push("Infant with concerning symptoms");
      triageLevel = "doctor";
      advice = "Young children require prompt medical evaluation.";
      followUpInDays = 1;
    }
  }

  // Combination symptoms analysis
  if (symptoms.has("fever") && symptoms.has("cough") && symptoms.has("breath")) {
    triageLevel = "doctor";
    advice = "Combination of respiratory symptoms requires medical evaluation.";
    redFlags.push("Respiratory symptom cluster");
    followUpInDays = 2;
  }

  if (symptoms.has("headache") && symptoms.has("fever") && symptoms.has("confusion")) {
    triageLevel = "emergency";
    advice = "Possible serious infection. Seek immediate medical care.";
    redFlags.push("Possible meningitis symptoms");
    followUpInDays = 0;
  }

  // Severity-based escalation
  if (input.severity && input.severity >= 8) {
    if (triageLevel === "self_care") {
      triageLevel = "doctor";
      advice = "High severity symptoms warrant medical evaluation.";
      followUpInDays = 1;
    }
  }

  // Duration considerations
  if (input.duration && input.duration.includes("week")) {
    recommendations.push("Persistent symptoms lasting over a week should be evaluated");
    if (triageLevel === "self_care") {
      triageLevel = "pharmacist";
      followUpInDays = 3;
    }
  }

  // Self-care recommendations
  if (triageLevel === "self_care") {
    if (symptoms.has("fever")) {
      recommendations.push("Use fever-reducing medications as directed");
      recommendations.push("Stay hydrated with plenty of fluids");
    }
    if (symptoms.has("cough")) {
      recommendations.push("Consider honey or throat lozenges");
      recommendations.push("Use a humidifier if available");
    }
    if (symptoms.has("headache")) {
      recommendations.push("Rest in a quiet, dark room");
      recommendations.push("Apply cold or warm compress");
    }
  }

  return {
    level: triageLevel,
    advice,
    redFlags,
    recommendations,
    followUpInDays,
    confidence: 0.8 // Basic triage confidence
  };
}

async function getAIAnalysis(input: AdvancedSymptomCheckInput): Promise<Partial<AdvancedSymptomCheckResult>> {
  try {
    const prompt = `You are a medical AI assistant helping with symptom triage. Analyze the following patient information and provide a structured medical assessment:

Patient Information:
- Age: ${input.age}
- Gender: ${input.gender || 'not specified'}
- Symptoms: ${input.symptoms.join(', ')}
- Duration: ${input.duration || 'not specified'}
- Severity (1-10): ${input.severity || 'not specified'}
- Additional notes: ${input.notes || 'none'}
- Medical history: ${input.medicalHistory?.join(', ') || 'none'}

Please provide a structured response with:
1. DIAGNOSIS: Top 3 possible conditions with probability percentages
2. URGENCY: Urgency level (self_care, pharmacist, doctor, urgent, emergency)
3. CRITICAL_SIGNS: Warning signs to watch for
4. RECOMMENDATIONS: Specific treatment recommendations
5. PREVENTION: Preventive measures

Format as clear sections. Be conservative and err on the side of caution. This is for triage purposes only.`;

    const result = await generateAIContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    if (!aiText) {
      throw new Error('No valid response text received from AI');
    }

    // Enhanced parsing of AI response
    const parsedResult = parseStructuredAIResponse(aiText);
    
    // Extract urgency level from AI response and adjust triage if needed
    const urgencyMatch = aiText.match(/\*\*(?:URGENCY|urgency):\s*([^*\n]+)/i);
    let aiTriageLevel: TriageLevel | undefined;
    if (urgencyMatch) {
      const urgencyText = urgencyMatch[1].toLowerCase().trim();
      if (urgencyText.includes('emergency')) aiTriageLevel = 'emergency';
      else if (urgencyText.includes('urgent')) aiTriageLevel = 'urgent';
      else if (urgencyText.includes('doctor')) aiTriageLevel = 'doctor';
      else if (urgencyText.includes('pharmacist')) aiTriageLevel = 'pharmacist';
      else if (urgencyText.includes('self')) aiTriageLevel = 'self_care';
    }

    return {
      aiAnalysis: aiText,
      confidence: 0.9,
      possibleConditions: parsedResult.conditions,
      criticalSigns: parsedResult.criticalSigns,
      preventiveMeasures: parsedResult.preventiveMeasures,
      recommendations: parsedResult.recommendations,
      aiTriageLevel // Add AI-suggested triage level
    };

  } catch (error) {
    console.error('AI Analysis failed:', error);
    return {
      aiAnalysis: `AI analysis unavailable: ${error instanceof Error ? error.message : 'Unknown error'}. Using basic triage only.`,
      confidence: 0.6
    };
  }
}

// Enhanced parsing function for structured AI responses
function parseStructuredAIResponse(text: string): {
  conditions: string[];
  criticalSigns: string[];
  preventiveMeasures: string[];
  recommendations: string[];
} {
  const result = {
    conditions: [] as string[],
    criticalSigns: [] as string[],
    preventiveMeasures: [] as string[],
    recommendations: [] as string[]
  };

  // Parse DIAGNOSIS section - look for numbered conditions
  const diagnosisMatch = text.match(/\*\*DIAGNOSIS[^:]*:[^*]*\*\*([^*]+(?:\*\*[^*]*\*\*[^*]*)*)/i);
  if (diagnosisMatch) {
    const conditions = diagnosisMatch[1]
      .match(/\d+\. \*\*([^*]+)\*\*[^\n]*/g);
    if (conditions) {
      result.conditions = conditions.map(c => 
        c.replace(/\d+\. \*\*([^*]+)\*\*.*/, '$1').trim()
      ).filter(c => c.length > 0);
    }
  }

  // Parse CRITICAL_SIGNS section - look for bullet points
  const criticalMatch = text.match(/\*\*CRITICAL_SIGNS[^:]*:[^*]*\*\*([^*]+(?:\*[^*]*)*)/i);
  if (criticalMatch) {
    const signs = criticalMatch[1]
      .split('\n')
      .filter(line => line.trim().startsWith('*'))
      .map(line => line.replace(/^\*\s*/, '').trim())
      .filter(sign => sign.length > 0 && !sign.includes('**'));
    result.criticalSigns = signs;
  }

  // Parse RECOMMENDATIONS section - look for bullet points
  const recommendMatch = text.match(/\*\*RECOMMENDATIONS:[^*]*\*\*([^*]+(?:\*[^*]*)*)/i);
  if (recommendMatch) {
    const recommendations = recommendMatch[1]
      .split('\n')
      .filter(line => line.trim().startsWith('*'))
      .map(line => line.replace(/^\*\s*/, '').replace(/\*\*([^*]+)\*\*:?/g, '$1:').trim())
      .filter(rec => rec.length > 0 && !rec.includes('**PREVENTION'));
    result.recommendations = recommendations;
  }

  // Parse PREVENTION section - look for bullet points
  const preventMatch = text.match(/\*\*PREVENTION:[^*]*\*\*([^*]+(?:\*[^*]*)*)/i);
  if (preventMatch) {
    const measures = preventMatch[1]
      .split('\n')
      .filter(line => line.trim().startsWith('*'))
      .map(line => line.replace(/^\*\s*/, '').replace(/\*\*([^*]+)\*\*:?/g, '$1:').trim())
      .filter(measure => measure.length > 0 && !measure.includes('Disclaimer'));
    result.preventiveMeasures = measures;
  }

  // Fallback to original parsing if structured parsing fails
  if (result.conditions.length === 0) {
    result.conditions = extractConditions(text);
  }
  if (result.criticalSigns.length === 0) {
    result.criticalSigns = extractCriticalSigns(text);
  }
  if (result.preventiveMeasures.length === 0) {
    result.preventiveMeasures = extractPreventiveMeasures(text);
  }
  if (result.recommendations.length === 0) {
    result.recommendations = extractRecommendations(text);
  }

  return result;
}

// Helper functions to parse AI response (enhanced for better extraction)
function extractConditions(text: string): string[] {
  const patterns = [
    /(?:possible conditions?|diagnosis|differential)[:\s]*([^.]*)/i,
    /(?:may have|could be|likely)[:\s]*([^.]*)/i,
    /(?:\d+\.|-)\s*([^\n,]*(?:infection|syndrome|disease|condition|disorder)[^\n,]*)/gi
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      if (pattern.global) {
        return Array.from(text.matchAll(pattern)).map(m => m[1].trim()).filter(c => c.length > 0);
      } else {
        return matches[1].split(',').map(c => c.trim()).filter(c => c.length > 0);
      }
    }
  }
  return [];
}

function extractCriticalSigns(text: string): string[] {
  const patterns = [
    /(?:warning signs?|critical|red flags?|danger signs?)[:\s]*([^.]*)/i,
    /(?:seek.*(?:immediate|emergency|urgent).*(?:if|when))[:\s]*([^.]*)/i,
    /(?:call.*(?:doctor|emergency|911).*if)[:\s]*([^.]*)/i
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      return matches[1].split(/[,\n]|[-•]\s*/).map(c => c.trim()).filter(c => c.length > 0);
    }
  }
  return [];
}

function extractPreventiveMeasures(text: string): string[] {
  const patterns = [
    /(?:preventive|prevention|avoid|prevent)[:\s]*([^.]*)/i,
    /(?:to prevent|to avoid|to reduce risk)[:\s]*([^.]*)/i,
    /(?:lifestyle changes?|recommendations?)[:\s]*([^.]*)/i
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      return matches[1].split(/[,\n]|[-•]\s*/).map(c => c.trim()).filter(c => c.length > 0);
    }
  }
  return [];
}

function extractRecommendations(text: string): string[] {
  const patterns = [
    /(?:recommendations?|treatment|advice)[:\s]*([^.]*)/i,
    /(?:you should|it is recommended)[:\s]*([^.]*)/i,
    /(?:suggested|advised)[:\s]*([^.]*)/i
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      return matches[1].split(/[,\n]|[-•]\s*/).map(c => c.trim()).filter(c => c.length > 0);
    }
  }
  return [];
}

// Helper function to get advice for triage levels
function getAdviceForTriageLevel(level: TriageLevel): string {
  switch (level) {
    case 'emergency':
      return 'Seek immediate emergency care. Call emergency services.';
    case 'urgent':
      return 'Seek urgent medical care within hours.';
    case 'doctor':
      return 'Consult a healthcare provider within 1-2 days.';
    case 'pharmacist':
      return 'Consult a pharmacist for over-the-counter treatment options.';
    case 'self_care':
    default:
      return 'Monitor symptoms and rest. Consider self-care measures.';
  }
}

export const handleSymptomCheck: RequestHandler = async (req, res) => {
  try {
    const input = req.body as AdvancedSymptomCheckInput;
    
    // Input validation
    if (!input.age || !Array.isArray(input.symptoms) || input.symptoms.length === 0) {
      return res.status(400).json({ error: 'Invalid input: age and symptoms are required' });
    }

    // Perform basic triage first
    let result = performAdvancedTriage(input) as AdvancedSymptomCheckResult;

    // If AI analysis is requested and available
    if (input.useAI) {
      const aiResult = await getAIAnalysis(input);
      result = { ...result, ...aiResult };
      
      // Use AI-suggested triage level if it's more severe than basic triage
      if (aiResult.aiTriageLevel) {
        const triageSeverity = {
          'self_care': 1,
          'pharmacist': 2,
          'doctor': 3,
          'urgent': 4,
          'emergency': 5
        };
        
        const basicSeverity = triageSeverity[result.level];
        const aiSeverity = triageSeverity[aiResult.aiTriageLevel];
        
        if (aiSeverity > basicSeverity) {
          result.level = aiResult.aiTriageLevel;
          result.advice = getAdviceForTriageLevel(aiResult.aiTriageLevel);
        }
      }
    }

    // Save the symptom check record to database
    try {
      const metadata = {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        sessionId: req.get('X-Session-ID') // Optional session tracking
      };
      
      await SymptomRecordService.saveSymptomRecord(input, result, metadata);
    } catch (dbError) {
      console.warn('Failed to save symptom record to database:', dbError);
      // Continue with response even if database save fails
    }

    res.json(result);
  } catch (error) {
    console.error('Symptom check error:', error);
    res.status(500).json({ error: 'Internal server error during symptom analysis' });
  }
};

export const getSymptomsList: RequestHandler = async (req, res) => {
  try {
    // Try to get symptoms from database first
    const dbSymptoms = await SymptomService.getAvailableSymptoms();
    
    if (dbSymptoms.length > 0) {
      // Transform database symptoms to match the expected format
      const formattedSymptoms = dbSymptoms.map(symptom => ({
        key: symptom.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
        label: symptom.name,
        severity: symptom.severity || 'mild',
        category: symptom.category
      }));
      
      res.json({ symptoms: formattedSymptoms });
    } else {
      // Fallback to static symptoms if database is empty
      res.json({ symptoms: COMPREHENSIVE_SYMPTOMS });
    }
  } catch (error) {
    console.error('Database error, falling back to static symptoms:', error);
    // Fallback to static data if database is unavailable
    res.json({ symptoms: COMPREHENSIVE_SYMPTOMS });
  }
};