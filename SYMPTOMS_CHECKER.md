# Advanced Symptoms Checker

## Overview
The advanced symptoms checker has been significantly enhanced with AI-powered analysis using Google's Gemini AI API. It provides comprehensive medical triage and analysis capabilities.

## New Features

### 1. Enhanced Patient Information Collection
- **Age**: Basic demographic information
- **Gender**: Male, female, or other
- **Duration**: How long symptoms have been present (hours, days, week, weeks)
- **Severity Scale**: 1-10 rating for symptom intensity
- **Medical History**: Pre-existing conditions (diabetes, hypertension, heart disease, etc.)

### 2. Comprehensive Symptoms Database
The checker now includes 25+ symptoms organized by category:
- **General**: Fever, fatigue, sweating, weight loss
- **Respiratory**: Cough, difficulty breathing, sore throat, runny nose
- **Cardiovascular**: Chest pain, palpitations
- **Gastrointestinal**: Nausea, vomiting, diarrhea, abdominal pain
- **Neurological**: Headache, dizziness, confusion, vision changes
- **Musculoskeletal**: Back pain, joint pain, muscle aches
- **Dermatological**: Skin rash
- **Genitourinary**: Difficulty urinating

### 3. AI-Powered Analysis
When AI analysis is enabled, the system:
- Sends patient data to RapidAPI's Gemini Pro AI endpoint
- Uses enhanced prompting for structured medical analysis
- Receives detailed medical assessment with improved parsing
- Provides differential diagnosis suggestions
- Offers specific recommendations
- Identifies critical warning signs

### 4. Advanced Triage Levels
Extended from 4 to 5 triage levels:
- **Emergency**: Immediate medical attention required
- **Urgent**: Seek care within hours
- **Doctor**: Consult healthcare provider within days
- **Pharmacist**: Over-the-counter treatment may help
- **Self-care**: Rest and monitoring sufficient

### 5. Comprehensive Results Display
The results now include:
- **Triage Level**: With color-coded badges and icons
- **Primary Advice**: Main recommendation
- **Confidence Score**: AI analysis confidence (0-100%)
- **Follow-up Timeline**: When to seek further care
- **Possible Conditions**: Differential diagnosis list
- **Recommendations**: Specific care instructions
- **Critical Signs**: Warning symptoms to watch for
- **Preventive Measures**: How to avoid worsening
- **Red Flags**: Immediate danger signs
- **AI Analysis**: Detailed AI-generated assessment

## Technical Implementation

### API Integration
- **RapidAPI Gemini Pro**: Enhanced AI analysis via RapidAPI platform
- **API Key**: a97dced58amsh8f8584c0b9192d3p1691acjsnc2160c315159
- **Model**: Gemini Pro via RapidAPI
- **Endpoint**: `/api/symptoms/check` (POST)
- **Features**: Structured response parsing, multiple response format support
- **Fallback**: Basic rule-based triage if AI unavailable

### Security Features
- Input validation and sanitization
- Rate limiting considerations
- Safe AI content filtering
- Error handling with graceful fallbacks

### Multilingual Support
All new features include translations for:
- English (en)
- Punjabi (pa) 
- Hindi (hi)

## Usage Guidelines

### For Patients
1. Fill in basic information (age, gender, duration)
2. Rate symptom severity on 1-10 scale
3. Select all applicable symptoms
4. Add relevant medical history
5. Provide additional details in notes
6. Toggle AI analysis for enhanced results
7. Review comprehensive triage assessment

### For Healthcare Workers
- Use as a preliminary screening tool
- Review AI analysis critically
- Consider patient context and presentation
- Use confidence scores to guide decisions
- Always follow local protocols and guidelines

## Safety Considerations

⚠️ **Important Disclaimers**:
- This tool is for informational purposes only
- Not a substitute for professional medical advice
- Emergency cases should call local emergency services immediately
- AI analysis should be interpreted by qualified healthcare professionals
- Results may vary based on input quality and completeness

## API Endpoints

### POST /api/symptoms/check
Analyzes symptoms and returns triage recommendations.

**Request Body**:
```json
{
  "age": 30,
  "gender": "female",
  "symptoms": ["fever", "cough", "headache"],
  "duration": "days",
  "severity": 7,
  "medicalHistory": ["asthma"],
  "notes": "Started after exposure to cold weather",
  "useAI": true
}
```

**Response**:
```json
{
  "level": "doctor",
  "advice": "Consult a healthcare provider within 2 days",
  "confidence": 0.85,
  "followUpInDays": 2,
  "redFlags": ["High fever with breathing difficulty"],
  "possibleConditions": ["Upper respiratory infection", "Bronchitis"],
  "recommendations": ["Rest", "Increase fluid intake", "Monitor temperature"],
  "aiAnalysis": "Detailed AI assessment...",
  "criticalSigns": ["Difficulty breathing", "High fever >101.5°F"],
  "preventiveMeasures": ["Avoid cold exposure", "Use humidifier"]
}
```

### GET /api/symptoms/list
Returns the complete list of available symptoms.

**Response**:
```json
{
  "symptoms": [
    {
      "key": "fever",
      "label": "Fever",
      "severity": "moderate",
      "category": "general"
    }
  ]
}
```

## Future Enhancements

1. **Patient History Integration**: Link with offline health records
2. **Location-based Services**: Nearby healthcare facility recommendations
3. **Medication Interactions**: Check against current medications
4. **Symptom Tracking**: Monitor progression over time
5. **Specialist Referrals**: Direct connection to appropriate specialists
6. **Specialist Referrals**: Direct connection to appropriate specialists
7. **Public Health Alerts**: Regional disease outbreak warnings