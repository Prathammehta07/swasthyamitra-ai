import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Share2, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { checkGenericSubstitute } from '@shared/medications';

interface PrescriptionShareProps {
  doctorName: string;
  patientName: string;
  medicines: { name: string; dosage: string }[];
}

export function PrescriptionShare({ doctorName, patientName, medicines }: PrescriptionShareProps) {
  const prescriptionRef = useRef<HTMLDivElement>(null);

  const handleShareWhatsApp = async () => {
    if (!prescriptionRef.current) return;
    
    try {
      const canvas = await html2canvas(prescriptionRef.current, { scale: 2 });
      const imageBase64 = canvas.toDataURL("image/jpeg", 0.8);
      
      // 1. Download image
      const link = document.createElement('a');
      link.download = `Prescription_${patientName.replace(/\s+/g, '_')}.jpg`;
      link.href = imageBase64;
      link.click();
      
      // 2. Open WhatsApp
      const message = encodeURIComponent(`Hello Pharmacy, this is a prescription for ${patientName} from Dr. ${doctorName}. I will send the attached image for dispensing.`);
      window.open(`https://wa.me/?text=${message}`, '_blank');
      
    } catch (err) {
      console.error("Failed to generate prescription image", err);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        ref={prescriptionRef} 
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-md mx-auto"
      >
        <div className="border-b pb-4 mb-4 text-center">
          <h2 className="text-xl font-bold text-slate-800">SwasthyaMitra Clinic</h2>
          <p className="text-sm text-slate-500">Dr. {doctorName}</p>
        </div>
        
        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-700">Patient: {patientName}</p>
          <p className="text-xs text-slate-500">Date: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-bold border-b pb-1">Rx</h3>
          {medicines.map((med, idx) => {
            const generic = checkGenericSubstitute(med.name);
            return (
              <div key={idx} className="bg-slate-50 p-3 rounded-md">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-slate-800">{med.name}</span>
                  <span className="text-sm text-slate-600">{med.dosage}</span>
                </div>
                {generic && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full w-fit">
                    <CheckCircle className="h-3 w-3" />
                    <span>Jan Aushadhi: {generic.genericName} ({generic.estimatedPriceDiff})</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex justify-center gap-4">
        <Button onClick={handleShareWhatsApp} className="bg-green-600 hover:bg-green-700 gap-2">
          <Share2 className="h-4 w-4" />
          Share to Local Pharmacy
        </Button>
      </div>
    </div>
  );
}
