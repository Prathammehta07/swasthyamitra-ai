import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';
import { Button } from '../ui/button';

interface QRHealthCardProps {
  patientId: string;
  name: string;
  bloodGroup?: string;
  emergencyContact?: string;
}

export function QRHealthCard({ patientId, name, bloodGroup, emergencyContact }: QRHealthCardProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Health Card - ${name}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f8fafc; }
            .card { background: white; border: 2px solid #2563eb; border-radius: 12px; padding: 24px; width: 320px; text-align: center; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); position: relative; overflow: hidden; }
            .header-bar { position: absolute; top: 0; left: 0; right: 0; height: 60px; background-color: #2563eb; z-index: 0; }
            .content { position: relative; z-index: 10; }
            .title { color: white; font-weight: bold; font-size: 18px; margin-bottom: 24px; margin-top: 4px; }
            .qr-wrapper { background: white; padding: 12px; border-radius: 8px; border: 2px dashed #e2e8f0; display: inline-block; margin-bottom: 16px; }
            .name { font-size: 20px; font-weight: bold; margin-bottom: 16px; color: #1e293b; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; text-align: left; font-size: 14px; background: #f8fafc; padding: 12px; border-radius: 6px; }
            .label { display: block; font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase; }
            .value { color: #334155; }
            .blood { color: #ef4444; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header-bar"></div>
            <div class="content">
              <div class="title">SwasthyaMitra Health Card</div>
              <div class="qr-wrapper">
                ${printRef.current.querySelector('.qr-code-svg-container')?.innerHTML || ''}
              </div>
              <div class="name">${name}</div>
              <div class="details">
                <div><span class="label">ID Number</span><span class="value font-mono">${patientId.slice(-6).toUpperCase()}</span></div>
                <div><span class="label">Blood</span><span class="value blood">${bloodGroup || 'N/A'}</span></div>
                ${emergencyContact ? `<div style="grid-column: span 2; margin-top: 4px; padding-top: 8px; border-top: 1px solid #e2e8f0;"><span class="label">Emergency</span><span class="value">${emergencyContact}</span></div>` : ''}
              </div>
            </div>
          </div>
          <script>
            window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 250); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // The QR code contains a secure URL that an ASHA worker/doctor can scan to load the profile
  const qrData = `${window.location.origin}/doctor/patient-scan/${patientId}`;

  return (
    <div className="flex flex-col items-center gap-6">
      <div 
        ref={printRef}
        className="bg-white border-2 border-blue-600 rounded-xl p-6 w-80 text-center shadow-md relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-16 bg-blue-600" />
        
        <div className="relative z-10">
          <h2 className="text-white font-bold text-lg mb-6">SwasthyaMitra Health Card</h2>
          
          <div className="qr-code-svg-container bg-white p-3 rounded-lg border-2 border-dashed border-slate-200 inline-block mb-4 shadow-sm">
            <QRCodeSVG value={qrData} size={150} level="H" />
          </div>
          
          <h3 className="text-xl font-bold text-slate-800">{name}</h3>
          
          <div className="mt-4 grid grid-cols-2 gap-2 text-left text-sm text-slate-600 bg-slate-50 p-3 rounded-md">
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">ID Number</span>
              <span className="font-mono text-slate-800">{patientId.slice(-6).toUpperCase()}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Blood</span>
              <span className="font-bold text-red-500">{bloodGroup || 'N/A'}</span>
            </div>
            {emergencyContact && (
              <div className="col-span-2 mt-1 border-t pt-2">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Emergency</span>
                <span className="text-slate-800">{emergencyContact}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Button onClick={handlePrint} className="gap-2">
        <Printer className="h-4 w-4" />
        Print Laminate Card
      </Button>
    </div>
  );
}
