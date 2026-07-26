import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, FileText, ArrowRight } from 'lucide-react';
import { InteractivePillDashboard } from '@/components/patient/InteractivePillDashboard';

export default function AshaDashboard() {
  const [activePatient, setActivePatient] = useState<string | null>(null);

  const villagePatients = [
    { id: '1', name: 'Ramesh Kumar', age: 45, pendingConsultations: 1 },
    { id: '2', name: 'Sita Devi', age: 38, pendingConsultations: 0 },
    { id: '3', name: 'Amit Singh', age: 52, pendingConsultations: 2 },
  ];

  if (activePatient) {
    const patient = villagePatients.find(p => p.id === activePatient);
    return (
      <div className="container mx-auto p-4 space-y-6 max-w-4xl">
        <Button variant="ghost" onClick={() => setActivePatient(null)} className="mb-4">
          ← Back to Village Roster
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Patient Profile: {patient?.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Button className="w-full h-24 text-lg flex flex-col gap-2">
                <UserPlus className="h-6 w-6" />
                Upload Vitals
              </Button>
              <Button variant="outline" className="w-full h-24 text-lg flex flex-col gap-2">
                <FileText className="h-6 w-6" />
                Queue Appointment
              </Button>
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Current Prescriptions</h3>
              <InteractivePillDashboard />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">ASHA Worker Portal</h1>
          <p className="text-slate-500">Managing block: Nabha North</p>
        </div>
        <Users className="h-10 w-10 text-primary opacity-80" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Village Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {villagePatients.map(patient => (
              <div 
                key={patient.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-lg">{patient.name}</h3>
                  <p className="text-sm text-slate-500">Age: {patient.age} • Pending Consultations: {patient.pendingConsultations}</p>
                </div>
                <Button onClick={() => setActivePatient(patient.id)} className="gap-2">
                  Open File <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
