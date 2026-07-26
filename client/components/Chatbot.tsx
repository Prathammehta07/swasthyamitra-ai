import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Globe, Loader2, Sparkles, Stethoscope, PhoneCall, ExternalLink, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChatMessage, ChatRequest, ChatResponse } from "@shared/api";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const QUICK_PROMPTS_EN = [
  "Check Symptoms 🩺",
  "WhatsApp SOS Doctor 🟢",
  "First Aid Advice 🩹",
  "Medicine Info 💊"
];

const QUICK_PROMPTS_HI = [
  "लक्षण जाँचें 🩺",
  "WhatsApp डाक्टर SOS 🟢",
  "प्राथमिक उपचार 🩹",
  "दवा की जानकारी 💊"
];

const QUICK_PROMPTS_GU = [
  "લક્ષણો ચકાસો 🩺",
  "WhatsApp ડૉક્ટર SOS 🟢",
  "પ્રાથમિક સારવાર 🩹",
  "દવાની માહિતી 💊"
];

import { useLocation } from "react-router-dom";

export default function Chatbot() {
  const location = useLocation();
  const { lang } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  if (location.pathname === "/whatsapp-bot") return null;
  const [isWhatsAppMode, setIsWhatsAppMode] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I am SwasthyaMitra AI, your digital health buddy.\n\nनमस्ते! मैं आपका स्वास्थ्यमित्र AI हूँ।\n\nનમસ્તે! હું તમારો સ્વાસ્થ્યમિત્ર AI છું.",
    },
  ]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<"en" | "hi" | "gu">(() => (lang === "gu" ? "gu" : lang === "hi" ? "hi" : "en"));
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Listen for global open events
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setIsWhatsAppMode(false);
    };

    const handleOpenWhatsApp = () => {
      setIsOpen(true);
      setIsWhatsAppMode(true);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "🟢 **WhatsApp Doctor SOS AI Activated!**\n\nI am your 24/7 Emergency Medical Assistant. Please describe your symptoms or urgent health concern below, or click the button to chat directly on WhatsApp!"
        }
      ]);
    };

    window.addEventListener('open-chatbot', handleOpenChat);
    window.addEventListener('open-whatsapp-bot', handleOpenWhatsApp);

    return () => {
      window.removeEventListener('open-chatbot', handleOpenChat);
      window.removeEventListener('open-whatsapp-bot', handleOpenWhatsApp);
    };
  }, []);

  useEffect(() => {
    if (lang === "gu" || lang === "hi" || lang === "en") {
      setLanguage(lang);
    }
  }, [lang]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isLoading]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage = textToSend.trim();
    setInput("");
    
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const payload: ChatRequest = {
        messages: newMessages,
        language,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = (await response.json()) as ChatResponse;
        if (data && data.reply) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.reply },
          ]);
          return;
        }
      }
    } catch (error) {
      console.warn("SwasthyaMitra AI Chat network notice:", error);
    } finally {
      setIsLoading(false);
    }

    // Client fallback response
    const isGu = language === "gu";
    const isHi = language === "hi";
    const fallbackAnswer = isGu
      ? "🩺 **સ્વાસ્થ્યમિત્ર AI સપોર્ટ:**\nઇમરજન્સી ડૉક્ટર સહાય માટે કૃપા કરીને તમારા લક્ષણો શેર કરો. જો ગંભીર હોય તો તરત જ 108 એમ્બ્યુલન્સ પર કૉલ કરો!"
      : isHi
      ? "🩺 **स्वास्थ्यमित्र AI सहायता:**\nआपकी स्वास्थ्य समस्या नोट कर ली गई है। यदि यह आपातकालीन स्थिति है, तो कृपया तुरंत 108 एम्बुलेंस डायल करें!"
      : "🩺 **SwasthyaMitra AI Support:**\nYour health query has been recorded. If you are experiencing severe symptoms, please dial 108 emergency ambulance immediately!";

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: fallbackAnswer },
    ]);
  };

  const handleSend = () => sendMessage(input);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === "en" ? "hi" : prev === "hi" ? "gu" : "en"));
  };

  const quickPrompts = language === "gu" ? QUICK_PROMPTS_GU : language === "hi" ? QUICK_PROMPTS_HI : QUICK_PROMPTS_EN;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Bubble Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => { setIsOpen(true); setIsWhatsAppMode(false); }}
          className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 flex items-center justify-center relative group transition-all duration-300 transform hover:scale-105"
          aria-label="Open SwasthyaMitra AI Chatbot"
        >
          <MessageCircle className="h-8 w-8 text-white animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="w-80 md:w-96 shadow-2xl flex flex-col h-[530px] max-h-[82vh] animate-in slide-in-from-bottom-5 fade-in duration-300 border-emerald-200 dark:border-emerald-900 rounded-2xl overflow-hidden">
          {/* Header */}
          <CardHeader className={cn(
            "text-white flex flex-row items-center justify-between p-4 shadow-md transition-colors",
            isWhatsAppMode 
              ? "bg-[#075E54]" 
              : "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600"
          )}>
            <div className="flex items-center gap-2.5">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  {isWhatsAppMode ? "WhatsApp Doctor SOS" : "SwasthyaMitra AI"}
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                </CardTitle>
                <p className="text-[11px] text-emerald-100 font-medium flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse"></span>
                  {isWhatsAppMode ? "Instant Doctor Assistance" : "Your Digital Health Buddy"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge 
                variant="secondary" 
                className="cursor-pointer bg-white/20 hover:bg-white/30 text-white border-none flex items-center gap-1 text-[11px] font-semibold"
                onClick={toggleLanguage}
                title="Toggle Language (EN / HI / GU)"
              >
                <Globe className="h-3 w-3" />
                {language.toUpperCase()}
              </Badge>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-full h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          {/* Direct WhatsApp External Launch Banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2 flex items-center justify-between">
            <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-emerald-600" /> 24/7 Medical Assistance Active
            </span>
            <a
              href="https://wa.me/919601262388?text=Emergency:%20I%20need%20immediate%20medical%20assistance"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs transition-colors"
            >
              Open WhatsApp <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          
          <CardContent className="flex-1 p-0 overflow-hidden flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="flex flex-col gap-3">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "flex max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed",
                      msg.role === "user" 
                        ? "bg-emerald-600 text-white self-end rounded-br-none font-medium" 
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 self-start rounded-bl-none"
                    )}
                  >
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  </div>
                ))}
                
                {/* Quick Prompts */}
                {messages.length <= 2 && !isLoading && (
                  <div className="mt-2 flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground font-medium px-1">
                      {language === "en" ? "Quick Healthcare Actions:" : "त्वरित स्वास्थ्य क्रियाएं:"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {quickPrompts.map((promptText, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(promptText)}
                          className="text-xs bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full px-3 py-1.5 font-medium transition-colors text-left"
                        >
                          {promptText}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 self-start rounded-2xl rounded-bl-none px-4 py-2.5 max-w-[80%] flex items-center gap-2 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                    <span className="text-xs text-muted-foreground font-medium">SwasthyaMitra AI is analyzing...</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-3 border-t bg-white dark:bg-slate-900">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
              className="flex w-full items-center gap-2"
            >
              <Input 
                placeholder={language === "en" ? "Ask WhatsApp Doctor AI..." : "स्वास्थ्यमित्र AI से पूछें..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-full focus-visible:ring-emerald-500 border-slate-200 dark:border-slate-700 text-xs h-10"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!input.trim() || isLoading}
                className="rounded-full shrink-0 h-10 w-10 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
