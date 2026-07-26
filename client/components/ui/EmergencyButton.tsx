import React from 'react';
import { PhoneCall, MessageCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { useLocation } from "react-router-dom";

export function EmergencyButton() {
  const location = useLocation();
  if (location.pathname === "/whatsapp-bot") return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            className="h-16 w-16 rounded-full bg-[#25D366] hover:bg-[#20ba59] shadow-2xl flex items-center justify-center relative group transition-all duration-300 transform hover:scale-105 border-0" 
            aria-label="WhatsApp Support & Help"
            title="WhatsApp Support & Help"
          >
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-white fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.666.988 3.313 1.488 5.349 1.489 5.385.002 9.764-4.376 9.767-9.764.001-2.61-1.01-5.064-2.85-6.906C17.065 2.128 14.61 1.116 12 1.117 6.617 1.117 2.24 5.492 2.237 10.88c-.001 2.039.507 4.02 1.492 5.727l-.961 3.509 3.59-.942h.001-.001zm10.741-6.987c-.294-.148-1.745-.862-2.015-.961-.271-.099-.467-.148-.663.148-.196.297-.761.961-.933 1.159-.172.197-.344.222-.638.074-1.429-.715-2.385-1.272-3.342-2.909-.253-.433.253-.402.723-1.347.079-.158.04-.297-.02-.421-.06-.124-.467-1.126-.64-1.54-.168-.406-.339-.35-.467-.357l-.398-.008c-.136 0-.358.051-.546.256-.188.205-.717.701-.717 1.709 0 1.008.733 1.98.835 2.118.102.137 1.442 2.202 3.493 3.087 2.05.885 2.05.59 2.428.556.378-.034 1.745-.713 1.99-1.402.245-.689.245-1.28.172-1.402-.073-.123-.27-.197-.565-.345z" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
            </span>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-64 mb-3 p-2 rounded-2xl shadow-2xl border-red-100 dark:border-red-900 bg-white dark:bg-slate-900 animate-in slide-in-from-bottom-3 duration-200">
          <DropdownMenuLabel className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm px-2 py-1.5">
            <ShieldAlert className="h-4 w-4 text-red-600" />
            <span>Emergency Medical SOS</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-red-100 dark:bg-red-900/50" />
          
          <DropdownMenuItem className="cursor-pointer focus:bg-red-50 dark:focus:bg-red-950/40 rounded-xl my-1 p-2.5" asChild>
            <a href="/whatsapp-bot?emergency=true" className="flex items-center gap-3 text-red-600 dark:text-red-400 font-semibold text-sm">
              <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-lg">
                <PhoneCall className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div>Call Ambulance (108)</div>
                <div className="text-[11px] text-muted-foreground font-normal">Opens simulated emergency response & dialer</div>
              </div>
            </a>
          </DropdownMenuItem>

          <DropdownMenuItem 
            className="cursor-pointer focus:bg-emerald-50 dark:focus:bg-emerald-950/40 rounded-xl my-1 p-2.5"
            onClick={() => {
              window.open('/whatsapp-bot', '_blank');
            }}
          >
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-semibold text-sm w-full">
              <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-lg shrink-0">
                <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold">WhatsApp Doctor SOS</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <div className="text-[11px] text-muted-foreground font-normal">Opens full page WhatsApp AI Doctor Web Chat ↗</div>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
