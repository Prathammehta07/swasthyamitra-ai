import { RequestHandler } from "express";
import type { ChatRequest, ChatResponse } from "@shared/api";
import { generateAIContent } from "../services/ai";

const MASTER_SYSTEM_PROMPT = `
# SWASTHYAMITRA AI - MASTER SYSTEM PROMPT

You are SwasthyaMitra AI, an intelligent multilingual healthcare assistant designed for Indian users.
Your personality is friendly, caring, professional, accurate and conversational.
You never sound robotic.
You never repeat the same answer.
Every reply must be freshly generated according to the user's current message and previous conversation.

--------------------------------------------------
RESPONSE STRUCTURE FOR HINDI
--------------------------------------------------
When symptoms are mentioned in Hindi, use this exact layout structure:

🤒 संभावित कारण
[कारणों का संक्षिप्त विवरण]

🏠 क्या करें
• आराम करें
• 3–4 लीटर पानी पिएँ
• हल्का भोजन लें
• तापमान हर 4 घंटे में मापें

💊 सामान्य दवा
Paracetamol 500 mg
(यदि बुखार 101°F से अधिक हो तो डॉक्टर की सलाह के अनुसार लें)

⚠️ डॉक्टर को कब दिखाएँ
• 3 दिन से अधिक बुखार
• सांस लेने में तकलीफ़
• तेज़ सिरदर्द
• बेहोशी

🏥 नज़दीकी अस्पताल
सामुदायिक स्वास्थ्य केंद्र (CHC) / सविस्तार सिविल अस्पताल

👩‍⚕️ ASHA Worker
अनीताबेन परमार (ASHA कार्यकर्ता - 9876543210)

🏛️ योजना
Ayushman Bharat (PM-JAY) | Pradhan Mantri Jan Aushadhi

--------------------------------------------------
RESPONSE STRUCTURE FOR GUJARATI
--------------------------------------------------
When symptoms are mentioned in Gujarati, use this exact layout structure:

<ctrl42> સંભવિત કારણ
[કારણોનું ટૂંકું વિવરણ]

🏠 ઘરગથ્થુ ઉપચાર
• પૂરતું પાણી પીવો
• 7–8 કલાક ઊંઘ લો
• સ્ક્રીનનો ઉપયોગ ઓછો કરો
• શાંત જગ્યાએ આરામ કરો

💊 સામાન્ય દવા
Paracetamol 500 mg

⚠️ ડૉક્ટરને ક્યારે બતાવવું
• 2 દિવસથી વધુ દુખાવો
• ઊલટી
• નજર ધૂંધળી થવી

🏥 નજીકની હોસ્પિટલ
સામૂહિક આરોગ્ય કેન્દ્ર (CHC) / સિવિલ હોસ્પિટલ

👩‍⚕️ ASHA Worker
ગીતાબેન પટેલ (ASHA કાર્યકર - 9876543211)

🏛️ યોજના
Ayushman Bharat (PM-JAY) | Pradhan Mantri Jan Aushadhi
`;

function getSmartMedicalFallbackResponse(query: string, language: "en" | "hi" | "gu" = "en"): string {
  const q = query.trim().toLowerCase();
  const isGu = language === "gu" || q.includes("નમસ્તે") || q.includes("માથાનો") || q.includes("કેમ");
  const isHi = language === "hi" || q.includes("नमस्ते") || q.includes("बुखार") || q.includes("दर्द");

  // Greetings Intent
  if (q === "hi" || q === "hello" || q === "hey" || q === "namaste" || q === "kem cho" || q === "good morning" || q.startsWith("hi ") || q.startsWith("hello ")) {
    if (isGu) {
      return "નમસ્તે! 👋 હું સ્વાસ્થ્યમિત્ર AI છું - તમારો ડિજિટલ હેલ્થ સાથી. આજે હું તમારા આરોગ્ય, લક્ષણો કે દવાઓ અંગે શું મદદ કરી શકું?";
    }
    if (isHi) {
      return "नमस्ते! 👋 मैं स्वास्थ्यमित्र AI हूँ - आपका डिजिटल हेल्थ साथी। आज मैं आपके स्वास्थ्य, लक्षणों या दवाओं से जुड़ी क्या सहायता कर सकता हूँ?";
    }
    return "Hello! 👋 I am SwasthyaMitra AI - your digital health buddy. How can I assist you with your health, symptoms, or medical queries today?";
  }

  // Emergency queries (Chest Pain / Heart Attack / Stroke / Breathlessness)
  if (q.includes("chest pain") || q.includes("heart attack") || q.includes("stroke") || q.includes("cannot breathe") || q.includes("unconscious") || q.includes("સીનામાં દર્દ") || q.includes("સાંસ") || q.includes("सीने में दर्द") || q.includes("सांस लेने में")) {
    return isGu
      ? "🚨 **THIS MAY BE A MEDICAL EMERGENCY.**\n\n<ctrl42> સંભવિત કારણ: છાતીમાં તીવ્ર દુખાવો કે શ્વાસ લેવામાં તકલીફ એ હૃદય સંબંધિત કટોકટી હોઈ શકે છે.\n\n🏠 શું કરવું: દર્દીને સીધા બેસાડો અને કપડાં ઢીલા કરો.\n\n⚠️ **તરત જ 108 એમ્બ્યુલન્સ કોલ કરો** અથવા નજીકની કાર્ડિયાક હોસ્પિટલ પહોંચો!\n\n🏥 નજીકની હોસ્પિટલ: ગવર્નમેન્ટ કાર્ડિયાક હોસ્પિટલ / સિવિલ એમરજન્સી\n👩‍⚕️ ASHA Worker: ગીતાબેન પટેલ (9876543211)\n🏛️ યોજના: Ayushman Bharat (PM-JAY)"
      : isHi
      ? "🚨 **THIS MAY BE A MEDICAL EMERGENCY.**\n\n🤒 संभावित कारण: सीने में तेज दर्द या सांस फूलना हृदय संबंधी आपातकाल हो सकता है।\n\n🏠 क्या करें: मरीज को आराम से बैठाएं और तंग कपड़े ढीले करें।\n\n⚠️ **तुरंत 108 एम्बुलेंस पर कॉल करें** या नजदीकी आपातकालीन अस्पताल जाएं!\n\n🏥 नज़दीकी अस्पताल: राजकीय कार्डियक अस्पताल / इमरजेंसी\n👩‍⚕️ ASHA Worker: अनीताबेन परमार (9876543210)\n🏛️ योजना: Ayushman Bharat (PM-JAY)"
      : "🚨 **THIS MAY BE A MEDICAL EMERGENCY.**\n\n🏥 Possible Causes: Severe chest pain or breathlessness can indicate an acute cardiac event.\n\n🏠 Home Care: Keep person seated upright and loosen tight clothing.\n\n⚠️ **Call 108 Ambulance immediately** or visit the nearest emergency room!\n\n🏥 Nearest Hospital: Civil Hospital Emergency Ward\n👩‍⚕️ ASHA Worker: Anitaben Parmar (+91 9876543210)\n🏛️ Scheme: Ayushman Bharat (PM-JAY)";
  }

  // Fever / Temperature / Chills
  if (q.includes("fever") || q.includes("temperature") || q.includes("chills") || q.includes("તાવ") || q.includes("બુખાર") || q.includes("तापमान")) {
    if (isHi) {
      return `🤒 **संभावित कारण**
आपको वायरल बुखार, मौसमी संक्रमण या शरीर में किसी संक्रमण के कारण बुखार हो सकता है।

🏠 **क्या करें**
• आराम करें
• 3–4 लीटर पानी पिएँ
• हल्का भोजन लें
• तापमान हर 4 घंटे में मापें

💊 **सामान्य दवा**
Paracetamol 500 mg
यदि बुखार 101°F से अधिक हो तो डॉक्टर की सलाह के अनुसार लें।

⚠️ **डॉक्टर को कब दिखाएँ**
• 3 दिन से अधिक बुखार
• सांस लेने में तकलीफ़
• तेज़ सिरदर्द
• बेहोशी

🏥 **नज़दीकी अस्पताल**
सामुदायिक स्वास्थ्य केंद्र (CHC) / सविस्तार सिविल अस्पताल

👩‍⚕️ **ASHA Worker**
अनीताबेन परमार (ASHA कार्यकर्ता - 9876543210)

🏛️ **योजना**
Ayushman Bharat (PM-JAY) | Jan Aushadhi Kendra`;
    }

    if (isGu) {
      return `તાવ

🤒 **સંભવિત કારણ**
તમને વાયરલ ઇન્ફેક્શન, બેક્ટેરિયલ ઇન્ફેક્શન અથવા મોસમી તાવ હોઈ શકે છે.

🩺 **જોખમ સ્તર**
🟡 મધ્યમ

🏠 **ઘરગથ્થુ ઉપચાર**
• પૂરતો આરામ કરો
• 3–4 લિટર પાણી પીવો
• હળવો ખોરાક લો
• દર 4 કલાકે તાપમાન તપાસો

💊 **સામાન્ય દવા**
Paracetamol 500 mg (ડૉક્ટરની સલાહ મુજબ)

🍎 **શું ખાવું**
• ખીચડી
• સૂપ
• નાળિયેર પાણી
• ફળો

🚫 **શું ટાળવું**
• ઠંડા પીણાં
• બહારનું જંક ફૂડ

⚠️ **ડૉક્ટરને ક્યારે બતાવવું**
• 102°F થી વધુ તાવ
• 3 દિવસથી વધુ તાવ
• શ્વાસ લેવામાં તકલીફ

🏥 **નજીકની હોસ્પિટલ**
સામૂહિક આરોગ્ય કેન્દ્ર (CHC) / સિવિલ હોસ્પિટલ

👩‍⚕️ **ASHA Worker**
ગીતાબેન પટેલ (ASHA કાર્યકર - 9876543211)

🏛️ **યોજના**
Ayushman Bharat`;
    }

    return `🤒 **Possible Causes**
You may have viral fever, seasonal infection, or systemic body infection.

🏠 **Home Care**
• Get complete rest
• Drink 3–4 liters of fluids
• Consume light meals
• Monitor temperature every 4 hours

💊 **Common Medicine**
Paracetamol 500 mg
Take as advised by doctor if temperature exceeds 101°F.

⚠️ **When to Visit a Doctor**
• Fever lasting more than 3 days
• Difficulty breathing
• Severe headache
• Dizziness or fainting

🏥 **Nearest Hospital**
Community Health Centre (CHC) / Civil Hospital Emergency

👩‍⚕️ **ASHA Worker**
Anitaben Parmar (ASHA Worker - 9876543210)

🏛️ **Scheme**
Ayushman Bharat (PM-JAY) | Jan Aushadhi Kendra`;
  }

  // Headache & Migraine
  if (q.includes("headache") || q.includes("migraine") || q.includes("माथा") || q.includes("सिरदर्द") || q.includes("માથાનો દર્દ") || q.includes("માથાનો")) {
    if (isGu) {
      return `<ctrl42> **સંભવિત કારણ**
તમને તણાવ, ઊંઘની અછત, માઈગ્રેન અથવા ડિહાઇડ્રેશનના કારણે માથાનો દુખાવો હોઈ શકે છે.

🏠 **ઘરગથ્થુ ઉપચાર**
• પૂરતું પાણી પીવો
• 7–8 કલાક ઊંઘ લો
• સ્ક્રીનનો ઉપયોગ ઓછો કરો
• શાંત જગ્યાએ આરામ કરો

💊 **સામાન્ય દવા**
Paracetamol 500 mg

⚠️ **ડૉક્ટરને ક્યારે બતાવવું**
• 2 દિવસથી વધુ દુખાવો
• ઊલટી
• નજર ધૂંધળી થવી

🏥 **નજીકની હોસ્પિટલ**
સામૂહિક આરોગ્ય કેન્દ્ર (CHC) / સિવિલ હોસ્પિટલ

👩‍⚕️ **ASHA Worker**
ગીતાબેન પટેલ (ASHA કાર્યકર - 9876543211)

🏛️ **યોજના**
Ayushman Bharat (PM-JAY) | Pradhan Mantri Jan Aushadhi`;
    }

    if (isHi) {
      return `🤒 **संभावित कारण**
आपको तनाव, नींद की कमी, माइग्रेन या डिहाइड्रेशन के कारण सिरदर्द हो सकता है।

🏠 **क्या करें**
• पर्याप्त पानी पिएँ
• 7–8 घंटे की नींद लें
• स्क्रीन का उपयोग कम करें
• शांत जगह पर आराम करें

💊 **सामान्य दवा**
Paracetamol 500 mg

⚠️ **डॉक्टर को कब दिखाएँ**
• 2 दिन से अधिक दर्द
• उल्टी होना
• नज़र धुंधली होना

🏥 **नज़दीकी अस्पताल**
सामुदायिक स्वास्थ्य केंद्र (CHC) / सिविल अस्पताल

👩‍⚕️ **ASHA Worker**
अनीताबेन परमार (ASHA कार्यकर्ता - 9876543210)

🏛️ **योजना**
Ayushman Bharat (PM-JAY) | Jan Aushadhi Kendra`;
    }

    return `🤒 **Possible Causes**
Tension, lack of sleep, migraine, or dehydration.

🏠 **Home Care**
• Drink plenty of water
• Get 7–8 hours of sleep
• Reduce screen time
• Rest in a quiet dark room

💊 **Common Medicine**
Paracetamol 500 mg

⚠️ **When to Visit a Doctor**
• Pain lasting more than 2 days
• Vomiting
• Blurred vision

🏥 **Nearest Hospital**
Community Health Centre (CHC) / Civil Hospital

👩‍⚕️ **ASHA Worker**
Anitaben Parmar (ASHA Worker - 9876543210)

🏛️ **Scheme**
Ayushman Bharat (PM-JAY) | Jan Aushadhi Kendra`;
  }

  // Cough & Throat Infections (ઉધરસ / खांसी)
  if (q.includes("cough") || q.includes("cold") || q.includes("sore throat") || q.includes("ઉધરસ") || q.includes("શરદી") || q.includes("ખાંસી") || q.includes("खांसी") || q.includes("सर्दी") || q.includes("गला")) {
    if (isGu) {
      return `ઉધરસ

🤧 **સંભવિત કારણ**
વાયરલ ઇન્ફેક્શન, એલર્જી અથવા ગળામાં ચેપને કારણે ઉધરસ હોઈ શકે છે.

🩺 **જોખમ સ્તર**
🟢 ઓછું

🏠 **ઘરગથ્થુ ઉપચાર**
• ગરમ પાણી પીવો
• મધ અને આદુ લો
• વરાળ લો

💊 **સામાન્ય દવા**
Dextromethorphan Syrup (OTC)

🍎 **શું ખાવું**
• ગરમ સૂપ
• હર્બલ ચા

🚫 **શું ટાળવું**
• ઠંડા પીણાં
• ધુમ્રપાન

⚠️ **ડૉક્ટરને ક્યારે બતાવવું**
• 2 અઠવાડિયાથી વધુ ઉધરસ
• લોહી આવે
• શ્વાસ લેવામાં તકલીફ

🏥 **નજીકની હોસ્પિટલ**
સામૂહિક આરોગ્ય કેન્દ્ર (CHC) / સિવિલ હોસ્પિટલ

👩‍⚕️ **ASHA Worker**
ગીતાબેન પટેલ (ASHA કાર્યકર - 9876543211)

🏛️ **યોજના**
Ayushman Bharat`;
    }

    if (isHi) {
      return `खांसी व सर्दी

🤧 **संभावित कारण**
वायरल संक्रमण, एलर्जी या गले में इंफेक्शन के कारण खांसी हो सकती है।

🩺 **जोखिम स्तर**
🟢 निम्न

🏠 **क्या करें**
• गुनगुना पानी पिएं
• शहद और अदरक लें
• गर्म भाप (Steam) लें

💊 **सामान्य दवा**
Dextromethorphan Syrup (OTC)

🍎 **क्या खाएं**
• गर्म सूप
• हर्बल चाय

🚫 **क्या परहेज करें**
• ठंडी चीजें और आइसक्रीम
• धूम्रपान

⚠️ **डॉक्टर को कब दिखाएँ**
• 2 हफ्ते से अधिक खांसी
• बलगम में खून आना
• सांस लेने में तकलीफ

🏥 **नज़दीकी अस्पताल**
सामुदायिक स्वास्थ्य केंद्र (CHC) / सिविल अस्पताल

👩‍⚕️ **ASHA Worker**
अनीताबेन परमार (9876543210)

🏛️ **योजना**
Ayushman Bharat`;
    }

    return `Cough & Cold

🤧 **Possible Causes**
Viral respiratory infection, seasonal allergies, or throat inflammation.

🩺 **Risk Level**
🟢 Low

🏠 **Home Care**
• Drink warm water
• Take honey and ginger tea
• Steam inhalation twice daily

💊 **Common Medicine**
Dextromethorphan Syrup (OTC)

🍎 **Foods to Eat**
• Warm soup
• Herbal tea

🚫 **Foods to Avoid**
• Cold beverages
• Smoking / dust exposure

⚠️ **When to Visit a Doctor**
• Cough lasting over 2 weeks
• Blood in phlegm
• Difficulty breathing

🏥 **Nearest Hospital**
Community Health Centre (CHC) / Civil Hospital

👩‍⚕️ **ASHA Worker**
Anitaben Parmar (+91 9876543210)

🏛️ **Scheme**
Ayushman Bharat`;
  }

  // Stomach Pain & Acidity (પેટમાં દુખાવો / पेट दर्द)
  if (q.includes("stomach") || q.includes("acidity") || q.includes("gas") || q.includes("indigestion") || q.includes("પેટ") || q.includes("ઊલટ") || q.includes("ઉલ્ટ") || q.includes("पेट") || q.includes("एसिडिटी") || q.includes("दस्त")) {
    if (isGu) {
      return `પેટમાં દુખાવો

🤢 **સંભવિત કારણ**
ગેસ, અપચો, એસિડિટી અથવા પેટના ચેપને કારણે દુખાવો હોઈ શકે છે.

🩺 **જોખમ સ્તર**
🟡 મધ્યમ

🏠 **ઘરગથ્થુ ઉપચાર**
• ગરમ પાણી પીવો
• હળવો ખોરાક લો
• તેલવાળું ખાવાનું ટાળો

💊 **સામાન્ય દવા**
Antacid (OTC)

🍎 **શું ખાવું**
• ખીચડી
• કેળું
• દહીં

🚫 **શું ટાળવું**
• મસાલેદાર ખોરાક
• કોલ્ડ ડ્રિન્ક

⚠️ **ડૉક્ટરને ક્યારે બતાવવું**
• ખૂબ જ દુખાવો
• લોહી સાથે ઊલટી
• સતત ઊલટી

🏥 **નજીકની હોસ્પિટલ**
સામૂહિક આરોગ્ય કેન્દ્ર (CHC) / સિવિલ હોસ્પિટલ

👩‍⚕️ **ASHA Worker**
ગીતાબેન પટેલ (ASHA કાર્યકર - 9876543211)

🏛️ **યોજના**
Ayushman Bharat`;
    }

    if (isHi) {
      return `पेट दर्द

🤢 **संभावित कारण**
गैस, अपच, एसिडिटी या पेट के संक्रमण के कारण दर्द हो सकता है।

🩺 **जोखिम स्तर**
🟡 मध्यम

🏠 **क्या करें**
• गुनगुना पानी पिएं
• हल्का भोजन लें
• तेलयुक्त भोजन से बचें

💊 **सामान्य दवा**
Antacid (OTC)

🍎 **क्या खाएं**
• खिचड़ी
• केला
• दही

🚫 **क्या टालें**
• मसालेदार खाना
• कोल्ड ड्रिंक

⚠️ **डॉक्टर को कब दिखाएँ**
• बहुत तेज दर्द
• खून के साथ उल्टी
• लगातार उल्टी

🏥 **नज़दीकी अस्पताल**
सामुदायिक स्वास्थ्य केंद्र (CHC) / सिविल अस्पताल

👩‍⚕️ **ASHA Worker**
अनीताबेन परमार (9876543210)

🏛️ **योजना**
Ayushman Bharat`;
    }

    return `Stomach Pain

🤢 **Possible Causes**
Gas, indigestion, acidity, or stomach infection.

🩺 **Risk Level**
🟡 Moderate

🏠 **Home Care**
• Drink warm water
• Eat light food
• Avoid oily/fried items

💊 **Common Medicine**
Antacid (OTC)

🍎 **Foods to Eat**
• Khichdi, banana, curd

🚫 **Foods to Avoid**
• Spicy food, cold drinks

⚠️ **When to Visit a Doctor**
• Severe pain
• Vomiting with blood
• Persistent vomiting

🏥 **Nearest Hospital**
Community Health Centre (CHC) / Civil Hospital

👩‍⚕️ **ASHA Worker**
Anitaben Parmar (9876543210)

🏛️ **Scheme**
Ayushman Bharat`;
  }

  // Vomiting (ઊલટી / उल्टी)
  if (q.includes("vomit") || q.includes("ઊલટ") || q.includes("ઉલ્ટ") || q.includes("nausea") || q.includes("उल्टी") || q.includes("मतली")) {
    if (isGu) {
      return `ઊલટી

🤮 **સંભવિત કારણ**
ફૂડ પોઈઝનિંગ, ગેસ્ટ્રિક ઇન્ફેક્શન અથવા મુસાફરીને કારણે ઊલટી થઈ શકે છે.

🩺 **જોખમ સ્તર**
🟡 મધ્યમ

🏠 **ઘરગથ્થુ ઉપચાર**
• ORS પીવો
• થોડા થોડા સમયે પાણી પીવો
• આરામ કરો

💊 **સામાન્ય દવા**
ORS Solution

🍎 **શું ખાવું**
• કેળું
• ખીચડી
• ટોસ્ટ

🚫 **શું ટાળવું**
• ભારે ખોરાક
• દૂધ

⚠️ **ડૉક્ટરને ક્યારે બતાવવું**
• સતત ઊલટી
• ડિહાઇડ્રેશન
• લોહી આવે

🏥 **નજીકની હોસ્પિટલ**
સામૂહિક આરોગ્ય કેન્દ્ર (CHC) / સિવિલ હોસ્પિટલ

👩‍⚕️ **ASHA Worker**
ગીતાબેન પટેલ (ASHA કાર્યકર - 9876543211)

🏛️ **યોજના**
Ayushman Bharat`;
    }

    if (isHi) {
      return `उल्टी

🤮 **संभावित कारण**
फूड पॉइजनिंग, गैस्ट्रिक इंफेक्शन या यात्रा के कारण उल्टी हो सकती है।

🩺 **जोखिम स्तर**
🟡 मध्यम

🏠 **क्या करें**
• ORS पिएं
• थोड़ी-थोड़ी देर में पानी पिएं
• आराम करें

💊 **सामान्य दवा**
ORS Solution

🍎 **क्या खाएं**
• केला, खिचड़ी, टोस्ट

🚫 **क्या टालें**
• भारी भोजन, दूध

⚠️ **डॉक्टर को कब दिखाएँ**
• लगातार उल्टी
• डिहाइड्रेशन
• खून आना

🏥 **नज़दीकी अस्पताल**
सामुदायिक स्वास्थ्य केंद्र (CHC) / सिविल अस्पताल

👩‍⚕️ **ASHA Worker**
अनीताबेन परमार (9876543210)

🏛️ **योजना**
Ayushman Bharat`;
    }

    return `Vomiting

🤮 **Possible Causes**
Food poisoning, gastric infection, or motion sickness.

🩺 **Risk Level**
🟡 Moderate

🏠 **Home Care**
• Drink ORS solution
• Sip small amounts of water frequently
• Rest well

💊 **Common Medicine**
ORS Solution

🍎 **Foods to Eat**
• Banana, khichdi, toast

🚫 **Foods to Avoid**
• Heavy food, dairy

⚠️ **When to Visit a Doctor**
• Persistent vomiting
• Signs of dehydration
• Blood in vomit

🏥 **Nearest Hospital**
Community Health Centre (CHC) / Civil Hospital

👩‍⚕️ **ASHA Worker**
Anitaben Parmar (9876543210)

🏛️ **Scheme**
Ayushman Bharat`;
  }

  // Breathing Difficulty (શ્વાસ / सांस)
  if (q.includes("breath") || q.includes("asthma") || q.includes("shortness") || q.includes("inhaler") || q.includes("શ્વાસ") || q.includes("ફેફ") || q.includes("साँस") || q.includes("सांस") || q.includes("श्वास")) {
    if (isGu) {
      return `શ્વાસ લેવામાં તકલીફ

🚨 **સંભવિત કારણ**
અસ્થમા, એલર્જી અથવા ફેફસાના ચેપને કારણે શ્વાસ લેવામાં તકલીફ હોઈ શકે છે.

🩺 **જોખમ સ્તર**
🔴 ઊંચું

🏠 **શું કરવું**
• સીધા બેસો
• તાજી હવા લો
• જો ઇન્હેલર હોય તો તેનો ઉપયોગ કરો

💊 **દવા**
ડૉક્ટરની સલાહ વગર નવી દવા શરૂ ન કરો.

⚠️ **તરત હોસ્પિટલ જાઓ જો**
• છાતીમાં દુખાવો
• હોઠ વાદળી થઈ જાય
• બોલવામાં તકલીફ

🚑 **ઇમરજન્સી**
108 પર કૉલ કરો.

🏥 **નજીકની હોસ્પિટલ**
સામૂહિક આરોગ્ય કેન્દ્ર (CHC) / સિવિલ હોસ્પિટલ

👩‍⚕️ **ASHA Worker**
ગીતાબેન પટેલ (ASHA કાર્યકર - 9876543211)

🏛️ **યોજના**
Ayushman Bharat`;
    }

    if (isHi) {
      return `सांस लेने में तकलीफ

🚨 **संभावित कारण**
अस्थमा, एलर्जी या फेफड़ों के संक्रमण के कारण सांस लेने में तकलीफ हो सकती है।

🩺 **जोखिम स्तर**
🔴 ऊंचा

🏠 **क्या करें**
• सीधे बैठें
• ताजी हवा लें
• यदि इनहेलर है तो उसका उपयोग करें

💊 **दवा**
डॉक्टर की सलाह के बिना नई दवा शुरू न करें।

⚠️ **तुरंत अस्पताल जाएं यदि**
• सीने में दर्द
• होंठ नीले पड़ जाएं
• बोलने में तकलीफ

🚑 **इमरजेंसी**
108 पर कॉल करें।

🏥 **नज़दीकी अस्पताल**
सामुदायिक स्वास्थ्य केंद्र (CHC) / सिविल अस्पताल

👩‍⚕️ **ASHA Worker**
अनीताबेन परमार (9876543210)

🏛️ **योजना**
Ayushman Bharat`;
    }

    return `Breathing Difficulty

🚨 **Possible Causes**
Asthma, allergy, or lung infection.

🩺 **Risk Level**
🔴 High

🏠 **What to Do**
• Sit upright
• Get fresh air
• Use inhaler if available

💊 **Medicine**
Do not start any new medication without a doctor's advice.

⚠️ **Go to Hospital Immediately if**
• Chest pain
• Lips turn blue
• Difficulty speaking

🚑 **Emergency**
Call 108 Ambulance immediately.

🏥 **Nearest Hospital**
Civil Hospital Emergency Ward

👩‍⚕️ **ASHA Worker**
Anitaben Parmar (9876543210)

🏛️ **Scheme**
Ayushman Bharat`;
  }

  // Chest Pain (છાતીમાં દુખાવો / सीने में दर्द) - Emergency
  if (q.includes("chest") || q.includes("heart") || q.includes("cardiac") || q.includes("છાતી") || q.includes("હ્રદ") || q.includes("सीने") || q.includes("हृदय") || q.includes("दिल")) {
    if (isGu) {
      return `છાતીમાં દુખાવો

🚨 **સંભવિત કારણ**
છાતીમાં દુખાવો હાર્ટ એટેક, એસિડિટી અથવા સ્નાયુના દુખાવાને કારણે હોઈ શકે છે.

🩺 **જોખમ સ્તર**
🔴 ઇમરજન્સી

⚠️ **તરત શું કરવું**
• કોઈપણ શારીરિક મહેનત બંધ કરો.
• શાંતિથી બેસો.
• પરિવારના સભ્યને જાણ કરો.

🚑 **તરત જ 108 પર ફોન કરો** અથવા નજીકની હોસ્પિટલમાં જાઓ.

⚠️ **જો નીચેના લક્ષણો હોય તો વિલંબ ન કરો**
• ડાબા હાથમાં દુખાવો
• શ્વાસ લેવામાં તકલીફ
• વધારે પરસેવો
• ચક્કર

🏥 **નજીકની હોસ્પિટલ**
સામૂહિક આરોગ્ય કેન્દ્ર (CHC) / ગવર્નમેન્ટ કાર્ડિયાક હોસ્પિટલ

👩‍⚕️ **ASHA Worker**
ગીતાબેન પટેલ (ASHA કાર્યકર - 9876543211)

🏛️ **યોજના**
Ayushman Bharat`;
    }

    if (isHi) {
      return `सीने में दर्द

🚨 **संभावित कारण**
सीने में दर्द हार्ट अटैक, एसिडिटी या मांसपेशियों के दर्द के कारण हो सकता है।

🩺 **जोखिम स्तर**
🔴 इमरजेंसी

⚠️ **तुरंत क्या करें**
• कोई भी शारीरिक परिश्रम बंद करें।
• शांति से बैठें।
• परिवार के सदस्य को सूचित करें।

🚑 **तुरंत 108 पर कॉल करें** या नजदीकी अस्पताल जाएं।

⚠️ **यदि निम्न लक्षण हों तो देरी न करें**
• बाएं हाथ में दर्द
• सांस लेने में तकलीफ
• अत्यधिक पसीना
• चक्कर आना

🏥 **नज़दीकी अस्पताल**
राजकीय कार्डियक अस्पताल / इमरजेंसी

👩‍⚕️ **ASHA Worker**
अनीताबेन परमार (9876543210)

🏛️ **योजना**
Ayushman Bharat`;
    }

    return `Chest Pain

🚨 **Possible Causes**
Chest pain could be due to heart attack, acidity, or muscle pain.

🩺 **Risk Level**
🔴 EMERGENCY

⚠️ **Immediate Action**
• Stop all physical activity.
• Sit calmly and loosen tight clothing.
• Inform a family member immediately.

🚑 **Call 108 Ambulance immediately** or go to nearest hospital.

⚠️ **Do not delay if you have**
• Left arm pain
• Shortness of breath
• Excessive sweating
• Dizziness

🏥 **Nearest Hospital**
Government Cardiac Hospital / Civil Emergency

👩‍⚕️ **ASHA Worker**
Anitaben Parmar (9876543210)

🏛️ **Scheme**
Ayushman Bharat`;
  }

  // Dizziness (ચક્કર / चक्कर)
  if (q.includes("dizz") || q.includes("vertigo") || q.includes("ચક્ક") || q.includes("चक्कर") || q.includes("घबराहट")) {
    if (isGu) return `ચક્કર આવવું

😵 **સંભવિત કારણ**
ચક્કર આવવાનું કારણ લો બ્લડ પ્રેશર, ડિહાઇડ્રેશન, ઓછી બ્લડ શુગર અથવા થાક હોઈ શકે છે.

🩺 **જોખમ સ્તર**
🟡 મધ્યમ

🏠 **ઘરગથ્થુ ઉપચાર**
• તરત બેસી જાઓ અથવા સૂઈ જાઓ.
• પૂરતું પાણી પીવો.
• હળવો નાસ્તો કરો.
• અચાનક ઊભા ન થાઓ.

💊 **સામાન્ય દવા**
કારણ મુજબ ડૉક્ટરની સલાહ લો.

⚠️ **ડૉક્ટરને ક્યારે બતાવવું**
• વારંવાર ચક્કર આવે
• બેભાન થઈ જાઓ
• બોલવામાં અથવા ચાલવામાં તકલીફ

🏥 **નજીકની હોસ્પિટલ**
સામૂહિક આરોગ્ય કેન્દ્ર (CHC) / સિવિલ હોસ્પિટલ

👩‍⚕️ **ASHA Worker**
ગીતાબેન પટેલ (ASHA કાર્યકર - 9876543211)

🏛️ **યોજના**
Ayushman Bharat`;
    if (isHi) return `चक्कर आना

😵 **संभावित कारण**
लो ब्लड प्रेशर, डिहाइड्रेशन, कम ब्लड शुगर या थकान के कारण चक्कर आ सकते हैं।

🩺 **जोखिम स्तर**
🟡 मध्यम

🏠 **क्या करें**
• तुरंत बैठ जाएं या लेट जाएं।
• पर्याप्त पानी पिएं।
• हल्का नाश्ता करें।
• अचानक खड़े न हों।

💊 **सामान्य दवा**
कारण के अनुसार डॉक्टर की सलाह लें।

⚠️ **डॉक्टर को कब दिखाएँ**
• बार-बार चक्कर आना
• बेहोश हो जाना
• बोलने या चलने में तकलीफ

🏥 **नज़दीकी अस्पताल**
सामुदायिक स्वास्थ्य केंद्र (CHC) / सिविल अस्पताल

👩‍⚕️ **ASHA Worker**
अनीताबेन परमार (9876543210)

🏛️ **योजना**
Ayushman Bharat`;
    return `Dizziness

😵 **Possible Causes**
Low blood pressure, dehydration, low blood sugar, or fatigue.

🩺 **Risk Level**
🟡 Moderate

🏠 **Home Care**
• Sit or lie down immediately.
• Drink plenty of water.
• Have a light snack.
• Avoid getting up suddenly.

💊 **Medicine**
Consult a doctor based on the cause.

⚠️ **When to Visit a Doctor**
• Frequent dizziness
• Loss of consciousness
• Difficulty speaking or walking

🏥 **Nearest Hospital**
Community Health Centre (CHC) / Civil Hospital

👩‍⚕️ **ASHA Worker**
Anitaben Parmar (9876543210)

🏛️ **Scheme**
Ayushman Bharat`;
  }

  // Back Pain (કમરનો દુખાવો / कमर दर्द)
  if (q.includes("back pain") || q.includes("spine") || q.includes("lower back") || q.includes("કમર") || q.includes("kamar") || q.includes("कमर") || q.includes("पीठ")) {
    if (isGu) return `કમરનો દુખાવો

🤕 **સંભવિત કારણ**
લાંબા સમય સુધી બેસવું, ભારે વજન ઉઠાવવું અથવા સ્નાયુ ખેંચાવાને કારણે કમરનો દુખાવો થઈ શકે છે.

🩺 **જોખમ સ્તર**
🟢 ઓછું

🏠 **ઘરગથ્થુ ઉપચાર**
• ગરમ શેક કરો.
• આરામ કરો.
• હળવી કસરત કરો.

💊 **સામાન્ય દવા**
Paracetamol અથવા Ibuprofen (લેબલ મુજબ)

⚠️ **ડૉક્ટરને ક્યારે બતાવવું**
• 1 અઠવાડિયાથી વધુ દુખાવો
• પગમાં સુન્નતા
• પેશાબ પર નિયંત્રણ ન રહે

🏥 **નજીકની હોસ્પિટલ**
સામૂહિક આરોગ્ય કેન્દ્ર (CHC) / સિવિલ હોસ્પિટલ

👩‍⚕️ **ASHA Worker**
ગીતાબેન પટેલ (ASHA કાર્યકર - 9876543211)

🏛️ **યોજના**
Ayushman Bharat`;
    if (isHi) return `कमर दर्द

🤕 **संभावित कारण**
लंबे समय तक बैठना, भारी वजन उठाना या मांसपेशियों में खिंचाव के कारण कमर दर्द हो सकता है।

🩺 **जोखिम स्तर**
🟢 निम्न

🏠 **क्या करें**
• गर्म सिकाई करें।
• आराम करें।
• हल्की कसरत करें।

💊 **सामान्य दवा**
Paracetamol या Ibuprofen (लेबल के अनुसार)

⚠️ **डॉक्टर को कब दिखाएँ**
• 1 हफ्ते से अधिक दर्द
• पैरों में सुन्नपन
• पेशाब पर नियंत्रण न रहना

🏥 **नज़दीकी अस्पताल**
सामुदायिक स्वास्थ्य केंद्र (CHC) / सिविल अस्पताल

👩‍⚕️ **ASHA Worker**
अनीताबेन परमार (9876543210)

🏛️ **योजना**
Ayushman Bharat`;
    return `Back Pain

🤕 **Possible Causes**
Prolonged sitting, heavy lifting, or muscle strain.

🩺 **Risk Level**
🟢 Low

🏠 **Home Care**
• Apply warm compress.
• Take rest.
• Do light stretching exercises.

💊 **Medicine**
Paracetamol or Ibuprofen (as per label)

⚠️ **When to Visit a Doctor**
• Pain lasting more than 1 week
• Numbness in legs
• Loss of bladder control

🏥 **Nearest Hospital**
Community Health Centre (CHC) / Civil Hospital

👩‍⚕️ **ASHA Worker**
Anitaben Parmar (9876543210)

🏛️ **Scheme**
Ayushman Bharat`;
  }

  // Toothache (દાંતનો દુખાવો / दांत दर्द)
  if (q.includes("tooth") || q.includes("dental") || q.includes("gum") || q.includes("દાંત") || q.includes("dant") || q.includes("दांत") || q.includes("दाँत")) {
    if (isGu) return `દાંતમાં દુખાવો

🦷 **સંભવિત કારણ**
દાંતમાં કીડા, ચેપ અથવા મસૂડા સોજાને કારણે દુખાવો થઈ શકે છે.

🩺 **જોખમ સ્તર**
🟢 ઓછું

🏠 **ઘરગથ્થુ ઉપચાર**
• ગરમ મીઠાના પાણીથી કોગળા કરો.
• મીઠાઈ ઓછી ખાઓ.
• દાંત સાફ રાખો.

💊 **સામાન્ય દવા**
Paracetamol (લેબલ મુજબ)

⚠️ **ડૉક્ટરને ક્યારે બતાવવું**
• ગાલમાં સોજો
• તાવ
• ખૂબ જ દુખાવો

🏥 **નજીકની હોસ્પિટલ**
સામૂહિક આરોગ્ય કેન્દ્ર (CHC) / ડેન્ટલ ક્લિનિક

👩‍⚕️ **ASHA Worker**
ગીતાબેન પટેલ (ASHA કાર્યકર - 9876543211)

🏛️ **યોજના**
Ayushman Bharat`;
    if (isHi) return `दांत दर्द

🦷 **संभावित कारण**
दांतों में कीड़ा, संक्रमण या मसूड़ों की सूजन के कारण दर्द हो सकता है।

🩺 **जोखिम स्तर**
🟢 निम्न

🏠 **क्या करें**
• गर्म नमक के पानी से कुल्ला करें।
• मिठाई कम खाएं।
• दांत साफ रखें।

💊 **सामान्य दवा**
Paracetamol (लेबल के अनुसार)

⚠️ **डॉक्टर को कब दिखाएँ**
• गाल में सूजन
• बुखार
• बहुत तेज दर्द

🏥 **नज़दीकी अस्पताल**
सामुदायिक स्वास्थ्य केंद्र / डेंटल क्लिनिक

👩‍⚕️ **ASHA Worker**
अनीताबेन परमार (9876543210)

🏛️ **योजना**
Ayushman Bharat`;
    return `Toothache

🦷 **Possible Causes**
Tooth decay, infection, or inflamed gums.

🩺 **Risk Level**
🟢 Low

🏠 **Home Care**
• Rinse with warm salt water.
• Reduce sweet intake.
• Keep teeth clean.

💊 **Medicine**
Paracetamol (as per label)

⚠️ **When to Visit a Doctor**
• Swelling in cheek
• Fever with tooth pain
• Severe unbearable pain

🏥 **Nearest Hospital**
Community Health Centre / Dental Clinic

👩‍⚕️ **ASHA Worker**
Anitaben Parmar (9876543210)

🏛️ **Scheme**
Ayushman Bharat`;
  }

  // Red Eye (આંખ / आँख)
  if (q.includes("eye") || q.includes("conjunctiv") || q.includes("red eye") || q.includes("આંખ") || q.includes("aankh") || q.includes("आँख") || q.includes("आंख")) {
    if (isGu) return `આંખ લાલ થવી

👁️ **સંભવિત કારણ**
એલર્જી, આંખમાં ચેપ અથવા ધૂળના સંપર્કથી આંખ લાલ થઈ શકે છે.

🩺 **જોખમ સ્તર**
🟡 મધ્યમ

🏠 **ઘરગથ્થુ ઉપચાર**
• આંખને સ્વચ્છ પાણીથી ધોઈ લો.
• આંખ ન ઘસો.
• આરામ કરો.

💊 **સામાન્ય દવા**
Lubricating Eye Drops (ડૉક્ટરની સલાહ મુજબ)

⚠️ **ડૉક્ટરને ક્યારે બતાવવું**
• નજર ધૂંધળી થાય
• ભારે દુખાવો
• આંખમાંથી પીળો પ્રવાહ આવે

🏥 **નજીકની હોસ્પિટલ**
સામૂહિક આરોગ્ય કેન્દ્ર (CHC) / આઈ ક્લિનિક

👩‍⚕️ **ASHA Worker**
ગીતાબેન પટેલ (ASHA કાર્યકર - 9876543211)

🏛️ **યોજના**
Ayushman Bharat`;
    if (isHi) return `आंख लाल होना

👁️ **संभावित कारण**
एलर्जी, आंख में संक्रमण या धूल के संपर्क से आंख लाल हो सकती है।

🩺 **जोखिम स्तर**
🟡 मध्यम

🏠 **क्या करें**
• आंख को साफ पानी से धोएं।
• आंख न रगड़ें।
• आराम करें।

💊 **सामान्य दवा**
Lubricating Eye Drops (डॉक्टर की सलाह अनुसार)

⚠️ **डॉक्टर को कब दिखाएँ**
• नज़र धुंधली हो
• तेज दर्द
• आंख से पीला स्राव आए

🏥 **नज़दीकी अस्पताल**
सामुदायिक स्वास्थ्य केंद्र / आई क्लिनिक

👩‍⚕️ **ASHA Worker**
अनीताबेन परमार (9876543210)

🏛️ **योजना**
Ayushman Bharat`;
    return `Red Eye

👁️ **Possible Causes**
Allergy, eye infection, or dust exposure.

🩺 **Risk Level**
🟡 Moderate

🏠 **Home Care**
• Wash eye with clean water.
• Do not rub your eye.
• Rest your eyes.

💊 **Medicine**
Lubricating Eye Drops (as advised by doctor)

⚠️ **When to Visit a Doctor**
• Blurred vision
• Severe eye pain
• Yellow discharge from eye

🏥 **Nearest Hospital**
Community Health Centre / Eye Clinic

👩‍⚕️ **ASHA Worker**
Anitaben Parmar (9876543210)

🏛️ **Scheme**
Ayushman Bharat`;
  }

  // Ear Pain (કાન / कान)
  if (q.includes("ear") || q.includes("hearing") || q.includes("કાન") || q.includes("kaan") || q.includes("कान") || q.includes("कान दर्द")) {
    if (isGu) return `કાનમાં દુખાવો

👂 **સંભવિત કારણ**
કાનમાં ચેપ, મેલ અથવા પાણી ભરાવાને કારણે દુખાવો થઈ શકે છે.

🩺 **જોખમ સ્તર**
🟡 મધ્યમ

🏠 **ઘરગથ્થુ ઉપચાર**
• કાન સુકું રાખો.
• કાનમાં કોઈ વસ્તુ ન નાખો.

💊 **સામાન્ય દવા**
Paracetamol (લેબલ મુજબ)

⚠️ **ડૉક્ટરને ક્યારે બતાવવું**
• કાનમાંથી પ્રવાહ આવે
• સાંભળવામાં તકલીફ
• ભારે દુખાવો

🏥 **નજીકની હોસ્પિટલ**
સામૂહિક આરોગ્ય કેન્દ્ર (CHC) / ENT ક્લિનિક

👩‍⚕️ **ASHA Worker**
ગીતાબેન પટેલ (ASHA કાર્યકર - 9876543211)

🏛️ **યોજના**
Ayushman Bharat`;
    if (isHi) return `कान दर्द

👂 **संभावित कारण**
कान में संक्रमण, मैल या पानी भरने के कारण दर्द हो सकता है।

🩺 **जोखिम स्तर**
🟡 मध्यम

🏠 **क्या करें**
• कान को सूखा रखें।
• कान में कोई चीज न डालें।

💊 **सामान्य दवा**
Paracetamol (लेबल के अनुसार)

⚠️ **डॉक्टर को कब दिखाएँ**
• कान से स्राव आना
• सुनने में तकलीफ
• बहुत तेज दर्द

🏥 **नज़दीकी अस्पताल**
सामुदायिक स्वास्थ्य केंद्र / ENT क्लिनिक

👩‍⚕️ **ASHA Worker**
अनीताबेन परमार (9876543210)

🏛️ **योजना**
Ayushman Bharat`;
    return `Ear Pain

👂 **Possible Causes**
Ear infection, earwax buildup, or water trapped in ear.

🩺 **Risk Level**
🟡 Moderate

🏠 **Home Care**
• Keep ears dry.
• Do not insert any objects into the ear.

💊 **Medicine**
Paracetamol (as per label)

⚠️ **When to Visit a Doctor**
• Discharge from ear
• Hearing difficulty
• Severe pain

🏥 **Nearest Hospital**
Community Health Centre / ENT Clinic

👩‍⚕️ **ASHA Worker**
Anitaben Parmar (9876543210)

🏛️ **Scheme**
Ayushman Bharat`;
  }

  // Allergy (એલર્જી / एलर्जी)
  if (q.includes("allerg") || q.includes("itch") || q.includes("rash") || q.includes("sneezing") || q.includes("એલર્જ") || q.includes("allergi") || q.includes("एलर्जी") || q.includes("खुजली")) {
    if (isGu) return `એલર્જી

🤧 **સંભવિત કારણ**
ધૂળ, પરાગકણ, દવા, ખોરાક અથવા અન્ય એલર્જનથી એલર્જી થઈ શકે છે.

🩺 **જોખમ સ્તર**
🟢 ઓછું

🏠 **ઘરગથ્થુ ઉપચાર**
• એલર્જીનું કારણ ટાળો.
• પૂરતું પાણી પીવો.
• આરામ કરો.

💊 **સામાન્ય દવા**
Cetirizine (લેબલ મુજબ)

⚠️ **ડૉક્ટરને ક્યારે બતાવવું**
• શ્વાસ લેવામાં તકલીફ
• ચહેરા અથવા જીભમાં સોજો
• ગંભીર એલર્જી

🏥 **નજીકની હોસ્પિટલ**
સામૂહિક આરોગ્ય કેન્દ્ર (CHC) / સિવિલ હોસ્પિટલ

👩‍⚕️ **ASHA Worker**
ગીતાબેન પટેલ (ASHA કાર્યકર - 9876543211)

🏛️ **યોજના**
Ayushman Bharat`;
    if (isHi) return `एलर्जी

🤧 **संभावित कारण**
धूल, पराग, दवा, खाना या अन्य एलर्जन से एलर्जी हो सकती है।

🩺 **जोखिम स्तर**
🟢 निम्न

🏠 **क्या करें**
• एलर्जी के कारण से बचें।
• पर्याप्त पानी पिएं।
• आराम करें।

💊 **सामान्य दवा**
Cetirizine (लेबल के अनुसार)

⚠️ **डॉक्टर को कब दिखाएँ**
• सांस लेने में तकलीफ
• चेहरे या जीभ में सूजन
• गंभीर एलर्जी प्रतिक्रिया

🏥 **नज़दीकी अस्पताल**
सामुदायिक स्वास्थ्य केंद्र (CHC) / सिविल अस्पताल

👩‍⚕️ **ASHA Worker**
अनीताबेन परमार (9876543210)

🏛️ **योजना**
Ayushman Bharat`;
    return `Allergy

🤧 **Possible Causes**
Dust, pollen, medicine, food, or other allergens.

🩺 **Risk Level**
🟢 Low

🏠 **Home Care**
• Avoid the allergy trigger.
• Drink plenty of water.
• Rest well.

💊 **Medicine**
Cetirizine (as per label)

⚠️ **When to Visit a Doctor**
• Difficulty breathing
• Swelling of face or tongue
• Severe allergic reaction

🏥 **Nearest Hospital**
Community Health Centre (CHC) / Civil Hospital

👩‍⚕️ **ASHA Worker**
Anitaben Parmar (9876543210)

🏛️ **Scheme**
Ayushman Bharat`;
  }

  // Insomnia / Sleep Issues (અનિદ્રા / अनिद्रा)
  if (q.includes("sleep") || q.includes("insomnia") || q.includes("અનિદ્ર") || q.includes("ઊંઘ") || q.includes("anidra") || q.includes("अनिद्रा") || q.includes("नींद")) {
    if (isGu) return `અનિદ્રા

😴 **સંભવિત કારણ**
તણાવ, ચિંતા અથવા અનિયમિત ઊંઘની આદતોને કારણે અનિદ્રા થઈ શકે છે.

🩺 **જોખમ સ્તર**
🟢 ઓછું

🏠 **ઘરગથ્થુ ઉપચાર**
• દરરોજ એક જ સમયે સૂવો.
• સૂતા પહેલાં મોબાઇલનો ઉપયોગ ઓછો કરો.
• કેફીન ટાળો.

💊 **સામાન્ય દવા**
ડૉક્ટરની સલાહ વિના ઊંઘની દવા ન લો.

⚠️ **ડૉક્ટરને ક્યારે બતાવવું**
• 2 અઠવાડિયાથી વધુ ઊંઘ ન આવે
• દિવસભર થાક લાગે

🏥 **નજીકની હોસ્પિટલ**
સામૂહિક આરોગ્ય કેન્દ્ર (CHC) / સિવિલ હોસ્પિટલ

👩‍⚕️ **ASHA Worker**
ગીતાબેન પટેલ (ASHA કાર્યકર - 9876543211)

🏛️ **યોજના**
Ayushman Bharat`;
    if (isHi) return `अनिद्रा (नींद न आना)

😴 **संभावित कारण**
तनाव, चिंता या अनियमित नींद की आदतों के कारण अनिद्रा हो सकती है।

🩺 **जोखिम स्तर**
🟢 निम्न

🏠 **क्या करें**
• रोज़ एक ही समय पर सोएं।
• सोने से पहले मोबाइल का उपयोग कम करें।
• कैफीन से बचें।

💊 **सामान्य दवा**
डॉक्टर की सलाह के बिना नींद की दवा न लें।

⚠️ **डॉक्टर को कब दिखाएँ**
• 2 हफ्ते से अधिक नींद न आना
• दिन भर थकान महसूस करना

🏥 **नज़दीकी अस्पताल**
सामुदायिक स्वास्थ्य केंद्र (CHC) / सिविल अस्पताल

👩‍⚕️ **ASHA Worker**
अनीताबेन परमार (9876543210)

🏛️ **योजना**
Ayushman Bharat`;
    return `Insomnia

😴 **Possible Causes**
Stress, anxiety, or irregular sleep habits.

🩺 **Risk Level**
🟢 Low

🏠 **Home Care**
• Sleep at the same time every day.
• Reduce screen time before bed.
• Avoid caffeine.

💊 **Medicine**
Do not take sleeping pills without a doctor's advice.

⚠️ **When to Visit a Doctor**
• Unable to sleep for more than 2 weeks
• Extreme daytime fatigue

🏥 **Nearest Hospital**
Community Health Centre (CHC) / Civil Hospital

👩‍⚕️ **ASHA Worker**
Anitaben Parmar (9876543210)

🏛️ **Scheme**
Ayushman Bharat`;
  }

  // Stress & Mental Health (તણાવ / तनाव)
  if (q.includes("stress") || q.includes("anxiety") || q.includes("depress") || q.includes("mental") || q.includes("worry") || q.includes("તણાવ") || q.includes("tanav") || q.includes("तनाव") || q.includes("चिंता")) {
    if (isGu) return `તણાવ

😟 **સંભવિત કારણ**
કામનો ભાર, પરીક્ષા, આર્થિક સમસ્યાઓ અથવા વ્યક્તિગત કારણોથી તણાવ થઈ શકે છે.

🩺 **જોખમ સ્તર**
🟡 મધ્યમ

🏠 **ઘરગથ્થુ ઉપચાર**
• ઊંડા શ્વાસ લો.
• ધ્યાન (Meditation) કરો.
• મિત્રો અથવા પરિવાર સાથે વાત કરો.
• પૂરતી ઊંઘ લો.

💊 **સામાન્ય દવા**
સામાન્ય રીતે દવા જરૂરી નથી. જરૂર પડે તો ડૉક્ટરની સલાહ લો.

⚠️ **ડૉક્ટરને ક્યારે બતાવવું**
• સતત ઉદાસીનતા
• કામમાં ધ્યાન ન રહે
• પોતાને નુકસાન પહોંચાડવાના વિચારો આવે

🏥 **નજીકની હોસ્પિટલ**
સામૂહિક આરોગ્ય કેન્દ્ર (CHC) / સિવિલ હોસ્પિટલ

👩‍⚕️ **ASHA Worker**
ગીતાબેન પટેલ (ASHA કાર્યકર - 9876543211)

🏛️ **યોજના**
Ayushman Bharat`;
    if (isHi) return `तनाव (Stress)

😟 **संभावित कारण**
काम का बोझ, परीक्षा, आर्थिक समस्याएं या व्यक्तिगत कारणों से तनाव हो सकता है।

🩺 **जोखिम स्तर**
🟡 मध्यम

🏠 **क्या करें**
• गहरी सांस लें।
• ध्यान (Meditation) करें।
• मित्रों या परिवार से बात करें।
• पर्याप्त नींद लें।

💊 **सामान्य दवा**
सामान्यतः दवा की जरूरत नहीं। जरूरत पड़ने पर डॉक्टर से सलाह लें।

⚠️ **डॉक्टर को कब दिखाएँ**
• लगातार उदासी
• काम में ध्यान न लगना
• खुद को नुकसान पहुँचाने के विचार आना

🏥 **नज़दीकी अस्पताल**
सामुदायिक स्वास्थ्य केंद्र (CHC) / सिविल अस्पताल

👩‍⚕️ **ASHA Worker**
अनीताबेन परमार (9876543210)

🏛️ **योजना**
Ayushman Bharat`;
    return `Stress / Anxiety

😟 **Possible Causes**
Work pressure, exams, financial issues, or personal problems.

🩺 **Risk Level**
🟡 Moderate

🏠 **Home Care**
• Practice deep breathing.
• Meditate daily.
• Talk to friends or family.
• Get adequate sleep.

💊 **Medicine**
Usually no medication needed. Consult a doctor if severe.

⚠️ **When to Visit a Doctor**
• Persistent sadness
• Inability to concentrate
• Thoughts of self-harm

🏥 **Nearest Hospital**
Community Health Centre (CHC) / Civil Hospital

👩‍⚕️ **ASHA Worker**
Anitaben Parmar (9876543210)

🏛️ **Scheme**
Ayushman Bharat`;
  }

  // Pregnancy (ગર્ભાવસ્થા / गर्भावस्था)
  if (q.includes("pregnan") || q.includes("ગર્ભ") || q.includes("garbh") || q.includes("गर्भ") || q.includes("प्रेग्नेंसी") || q.includes("maternity")) {
    if (isGu) return `ગર્ભાવસ્થા

🤰 **સંભવિત કારણ**
ગર્ભાવસ્થા દરમિયાન શરીરમાં થતા હોર્મોનલ ફેરફારોને કારણે વિવિધ લક્ષણો જોવા મળી શકે છે.

🩺 **જોખમ સ્તર**
🟡 મધ્યમ

🏠 **ઘરગથ્થુ ઉપચાર**
• પૌષ્ટિક આહાર લો.
• પૂરતું પાણી પીવો.
• નિયમિત પ્રેગ્નન્સી ચેકઅપ કરાવો.
• આયર્ન અને ફોલિક એસિડ ડૉક્ટરની સલાહ મુજબ લો.

💊 **દવા**
માત્ર ડૉક્ટરની સલાહ મુજબ જ દવા લો.

⚠️ **ડૉક્ટરને ક્યારે બતાવવું**
• ભારે રક્તસ્ત્રાવ
• પેટમાં તીવ્ર દુખાવો
• બાળકની હિલચાલ બંધ લાગે

🏥 **નજીકની હોસ્પિટલ**
જિલ્લા મહિલા હોસ્પિટલ / PHC (Primary Health Centre)

👩‍⚕️ **ASHA Worker**
ગીતાબેન પટેલ (ASHA કાર્યકર - 9876543211)

🏛️ **યોજના**
Pradhan Mantri Matru Vandana Yojana | Ayushman Bharat`;
    if (isHi) return `गर्भावस्था

🤰 **संभावित कारण**
गर्भावस्था के दौरान शरीर में होने वाले हार्मोनल बदलावों के कारण विभिन्न लक्षण हो सकते हैं।

🩺 **जोखिम स्तर**
🟡 मध्यम

🏠 **क्या करें**
• पौष्टिक आहार लें।
• पर्याप्त पानी पिएं।
• नियमित प्रेग्नेंसी चेकअप करवाएं।
• आयरन और फोलिक एसिड डॉक्टर की सलाह अनुसार लें।

💊 **दवा**
केवल डॉक्टर की सलाह के अनुसार दवा लें।

⚠️ **डॉक्टर को कब दिखाएँ**
• भारी रक्तस्राव
• पेट में तेज दर्द
• बच्चे की हलचल बंद लगे

🏥 **नज़दीकी अस्पताल**
जिला महिला अस्पताल / PHC (Primary Health Centre)

👩‍⚕️ **ASHA Worker**
अनीताबेन परमार (9876543210)

🏛️ **योजना**
Pradhan Mantri Matru Vandana Yojana | Ayushman Bharat`;
    return `Pregnancy

🤰 **Possible Causes**
Hormonal changes during pregnancy can cause various symptoms.

🩺 **Risk Level**
🟡 Moderate

🏠 **Home Care**
• Eat a nutritious diet.
• Stay well hydrated.
• Attend all prenatal check-ups regularly.
• Take Iron & Folic Acid as prescribed by doctor.

💊 **Medicine**
Only take medicines prescribed by your doctor.

⚠️ **When to Visit a Doctor**
• Heavy bleeding
• Severe abdominal pain
• Reduced or no fetal movements

🏥 **Nearest Hospital**
District Women's Hospital / PHC

👩‍⚕️ **ASHA Worker**
Anitaben Parmar (9876543210)

🏛️ **Scheme**
Pradhan Mantri Matru Vandana Yojana | Ayushman Bharat`;
  }

  // General Healthcare Query Fallback
  return isGu
    ? `<ctrl42> **સંભવિત કારણ**
તમને વાયરલ ઈન્ફેક્શન અથવા થાક હોઈ શકે છે.

🏠 **ઘરગથ્થુ ઉપચાર**
• પૂરતું પાણી પીવો
• 7–8 કલાક ઊંઘ લો
• પૌષ્ટિક આહાર લો

💊 **સામાન્ય દવા**
Paracetamol 500 mg

⚠️ **ડૉક્ટરને ક્યારે બતાવવું**
• 2-3 દિવસથી વધુ લક્ષણો રહેવા પર

🏥 **નજીકની હોસ્પિટલ**
સામૂહિક આરોગ્ય કેન્દ્ર (CHC)

👩‍⚕️ **ASHA Worker**
ગીતાબેન પટેલ (9876543211)

🏛️ **યોજના**
Ayushman Bharat (PM-JAY)`
    : isHi
    ? `🤒 **संभावित कारण**
आपको मौसमी संक्रमण या शारीरिक थकान हो सकती है।

🏠 **क्या करें**
• पर्याप्त पानी पिएँ
• 7–8 घंटे की नींद लें
• हल्का पौष्टिक आहार लें

💊 **सामान्य दवा**
Paracetamol 500 mg

⚠️ **डॉक्टर को कब दिखाएँ**
• 2-3 दिन से अधिक लक्षण रहने पर

🏥 **नज़दीकी अस्पताल**
सामुदायिक स्वास्थ्य केंद्र (CHC)

👩‍⚕️ **ASHA Worker**
अनीताबेन परमार (9876543210)

🏛️ **योजना**
Ayushman Bharat (PM-JAY)`
    : `🤒 **Possible Causes**
Seasonal viral infection or body fatigue.

🏠 **Home Care**
• Drink plenty of fluids
• Get 7–8 hours of sleep
• Eat light nutritious meals

💊 **Common Medicine**
Paracetamol 500 mg

⚠️ **When to Visit a Doctor**
• Symptoms persisting over 2-3 days

🏥 **Nearest Hospital**
Community Health Centre (CHC)

👩‍⚕️ **ASHA Worker**
Anitaben Parmar (9876543210)

🏛️ **Scheme**
Ayushman Bharat (PM-JAY)`;
}

export const handleChatRequest: RequestHandler = async (req, res) => {
  try {
    const { messages, language = "en" } = req.body as ChatRequest;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const userLastMsg = [...messages].reverse().find(m => m.role === "user")?.content || "";
    const langInstruction = language === "gu"
      ? "Identify and respond in Gujarati language. Follow the exact structured template layout (સંભવિત કારણ, ઘરગથ્થુ ઉપચાર, સામાન્ય દવા, ડૉક્ટરને ક્યારે બતાવવું, નજીકની હોસ્પિટલ, ASHA Worker, યોજના)."
      : language === "hi" 
      ? "Identify and respond in Hindi language. Follow the exact structured template layout (संभावित कारण, क्या करें, सामान्य दवा, डॉक्टर को कब दिखाएँ, नज़दीकी अस्पताल, ASHA Worker, योजना)."
      : "Respond in the same language as the user's message using the structured template format.";

    const systemPrompt = `${MASTER_SYSTEM_PROMPT}\n\nCURRENT LANGUAGE INSTRUCTION: ${langInstruction}`;

    try {
      const contents = [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am SwasthyaMitra AI. I will format all medical responses in the exact requested template layout with causes, home care, medicine, doctor warnings, hospital, ASHA worker, and scheme." }],
        },
        ...messages.map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        }))
      ];

      const result = await generateAIContent(contents);
      const aiResponse = await result.response;
      const text = aiResponse.text();

      if (text && text.trim().length > 0) {
        return res.json({ reply: text });
      }
    } catch (aiErr) {
      console.warn("[SwasthyaMitra AI Structured Layout] Gemini API fallback active:", aiErr);
    }

    const fallbackReply = getSmartMedicalFallbackResponse(userLastMsg, language);
    res.json({ reply: fallbackReply });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.json({ 
      reply: "🌸 **SwasthyaMitra AI:** How can I assist your health or symptoms today?" 
    });
  }
};
