import { useI18n } from "@/lib/i18n";
import { Globe, Menu, UserPlus, Check, Users, Heart, Stethoscope } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUnifiedAuth } from "@/lib/unified-auth";
import { NetworkStatusBanner } from "@/components/ui/NetworkStatusBanner";
import { EmergencyButton } from "@/components/ui/EmergencyButton";
import { FontSizeToggler } from "@/components/ui/FontSizeToggler";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-background text-foreground relative">
      <NetworkStatusBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Header() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-[12px] border-b border-slate-200 dark:border-slate-800 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] transition-all duration-300">
      <div className="w-full max-w-[1440px] mx-auto h-[80px] px-4 lg:px-6 xl:px-10 flex items-center justify-between gap-2">
        
        {/* Left Section: Logo & Nav Links */}
        <div className="flex items-center gap-4 lg:gap-6 xl:gap-[48px] min-w-0">
          {/* Logo Section */}
          <a
            href="/"
            className="flex items-center gap-2 lg:gap-3 group shrink-0 hover:opacity-95 transition-opacity"
          >
            <img 
              src="/logo.png" 
              alt="SwasthyaMitra AI Logo" 
              className="h-8 w-8 lg:h-[42px] lg:w-[42px] object-contain drop-shadow-xs group-hover:rotate-6 group-hover:scale-105 transition-transform duration-300" 
            />
            <div className="flex flex-col justify-center">
              <span className="text-xl lg:text-[24px] xl:text-[28px] font-bold tracking-tight leading-none text-slate-900 dark:text-white">
                Swasthya<span className="text-blue-600 dark:text-blue-400">Mitra AI</span>
              </span>
              <span className="text-[9px] lg:text-[10px] xl:text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-1 leading-none">
                Your Digital Health Buddy
              </span>
            </div>
          </a>

          {/* Center Section (Navigation Links) */}
          <nav className="hidden lg:flex items-center gap-3 lg:gap-4 xl:gap-[36px] text-xs lg:text-sm xl:text-[16px] font-semibold text-slate-800 dark:text-slate-100 shrink-0">
            <a 
              href="/#features" 
              className="relative py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-full after:scale-x-0 after:bg-blue-600 dark:after:bg-blue-500 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left"
            >
              Features
            </a>
            <a 
              href="/awareness" 
              className="relative py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-full after:scale-x-0 after:bg-blue-600 dark:after:bg-blue-500 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left"
            >
              Health Tips
            </a>
            <a 
              href="/#symptom" 
              className="relative py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-full after:scale-x-0 after:bg-blue-600 dark:after:bg-blue-500 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left"
            >
              Symptom Checker
            </a>
            <a 
              href="/#records" 
              className="relative py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-full after:scale-x-0 after:bg-blue-600 dark:after:bg-blue-500 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left"
            >
              Health Records
            </a>
          </nav>
        </div>

        {/* Right Section Actions for Desktop */}
        <div className="hidden lg:flex items-center gap-1.5 lg:gap-2 xl:gap-[14px] shrink-0">
          <LanguageSwitcher />
          <AuthButtons />
          <PrimaryCTA />
        </div>

        {/* Right Section Actions for Mobile/Tablet */}
        <div className="lg:hidden flex items-center gap-[14px]">
          <PrimaryCTA />
          <button
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 shrink-0"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          <a
            href="/#features"
            className="block text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-3 rounded-lg transition-all"
            onClick={() => setOpen(false)}
          >
            Features
          </a>

          <a
            href="/awareness"
            className="block text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-3 rounded-lg transition-all"
            onClick={() => setOpen(false)}
          >
            Health Tips
          </a>
          <a
            href="/#symptom"
            className="block text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-3 rounded-lg transition-all"
            onClick={() => setOpen(false)}
          >
            Symptom Checker
          </a>
          <a
            href="/#records"
            className="block text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-3 rounded-lg transition-all"
            onClick={() => setOpen(false)}
          >
            Health Records
          </a>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
            <LanguageSwitcher />
            <AuthButtons />
          </div>
        </div>
      )}
    </header>
  );
}

function PrimaryCTA() {
  return (
    <a
      href="/#symptom"
      className="flex items-center justify-center h-[38px] lg:h-[44px] rounded-[10px] lg:rounded-[12px] px-3 lg:px-[18px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs lg:text-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-blue-600/10 hover:shadow-indigo-600/10 active:scale-[0.98] whitespace-nowrap shrink-0"
    >
      Start symptom check →
    </a>
  );
}

function AuthButtons() {
  const { user, logout, isPatient, isDoctor, isGuest, guestLogin } = useUnifiedAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  
  const handleGuestAccess = () => {
    guestLogin();
    navigate("/");
  };

  if (user) {
    const roleText = isPatient ? t("role_patient") : isDoctor ? t("role_doctor") : isGuest ? t("role_guest") : t("role_user");
    const initials = user.name ? user.name.charAt(0).toUpperCase() : "U";

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-[38px] lg:h-[44px] w-[38px] lg:w-[44px] rounded-[10px] lg:rounded-[12px] border border-slate-200 dark:border-slate-800 p-0 hover:scale-105 active:scale-95 transition-all">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-sm">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800/60 p-2.5" align="end" forceMount>
          <DropdownMenuLabel className="font-normal p-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none">{user.name || t("role_user")}</p>
              <p className="text-xs font-semibold leading-none text-slate-400 mt-1">
                {t("role")} {roleText}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1.5" />
          {isGuest && (
            <DropdownMenuItem asChild className="rounded-lg font-semibold text-xs py-2 cursor-pointer">
              <a href="/login">
                <UserPlus className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                {t("nav_signup")}
              </a>
            </DropdownMenuItem>
          )}
          {isPatient && (
            <DropdownMenuItem asChild className="rounded-lg font-semibold text-xs py-2 cursor-pointer">
              <a href="/patient/dashboard">{t("nav_dashboard")}</a>
            </DropdownMenuItem>
          )}
          {isDoctor && (
            <DropdownMenuItem asChild className="rounded-lg font-semibold text-xs py-2 cursor-pointer">
              <a href="/doctor/dashboard">{t("nav_dashboard")}</a>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="my-1.5" />
          <DropdownMenuItem onClick={logout} className="rounded-lg font-bold text-xs py-2 cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20">
            {isGuest ? t("nav_exit_guest") : t("nav_logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  return (
    <div className="flex items-center gap-[14px]">
      <a
        href="/login"
        className="h-[38px] lg:h-[44px] rounded-[10px] lg:rounded-[12px] px-3 lg:px-[18px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-600 dark:hover:border-blue-500 font-semibold text-xs lg:text-sm transition-all duration-300 whitespace-nowrap flex items-center justify-center shrink-0 active:scale-[0.98]"
      >
        Login / Sign up
      </a>
    </div>
  );
}

function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <Select value={lang} onValueChange={(v) => setLang(v as any)}>
      <SelectTrigger className="h-[38px] lg:h-[44px] w-[95px] lg:w-[130px] rounded-[10px] lg:rounded-[12px] border border-slate-200 dark:border-slate-800 text-xs lg:text-sm font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 hover:border-blue-600 dark:hover:border-blue-500 transition-all duration-300 shadow-2xs focus:ring-1 focus:ring-blue-500 shrink-0">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <Globe className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-slate-500 dark:text-slate-400 shrink-0" />
          <SelectValue placeholder="English" />
        </div>
      </SelectTrigger>
      <SelectContent align="end" className="rounded-xl shadow-xl">
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="hi">हिंदी</SelectItem>
        <SelectItem value="gu">ગુજરાતી</SelectItem>
      </SelectContent>
    </Select>
  );
}


function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t bg-white/80 dark:bg-background/80 mt-12">
      <div className="container py-8 grid gap-6 md:grid-cols-3 text-sm">
        <div>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SwasthyaMitra AI Logo" className="h-9 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                Swasthya<span className="text-blue-600 dark:text-blue-400">Mitra AI</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 tracking-wider">Your Digital Health Buddy</span>
            </div>
          </div>
          <p className="mt-3 text-muted-foreground max-w-sm">{t("tagline")}</p>
        </div>
        <div className="space-y-2">
          <div className="font-semibold text-slate-900 dark:text-white">{t("features_title")}</div>
          <a href="#features" className="block text-muted-foreground hover:text-[#5b3bf1] transition-colors">
            {t("f1_title")}
          </a>
          <a href="#features" className="block text-muted-foreground hover:text-[#5b3bf1] transition-colors">
            {t("f2_title")}
          </a>
          <a href="#features" className="block text-muted-foreground hover:text-[#5b3bf1] transition-colors">
            {t("f3_title")}
          </a>
          <a href="#features" className="block text-muted-foreground hover:text-[#5b3bf1] transition-colors">
            {t("f4_title")}
          </a>
        </div>
        <div className="space-y-2">
          <div className="font-semibold text-slate-900 dark:text-white">{t("footer_resources")}</div>

          <a href="#about" className="block text-muted-foreground hover:text-[#5b3bf1] transition-colors">
            {t("nav_about")}
          </a>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {t("appName")} · {t("footer_made_for")}
      </div>
    </footer>
  );
}
