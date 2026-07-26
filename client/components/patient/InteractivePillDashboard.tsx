import React, { useState } from 'react';
import { CheckCircle2, Circle, Sun, Moon, Sunrise } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { VoicePrescription } from '../ui/VoicePrescription';

interface Pill {
  id: string;
  name: string;
  timeOfDay: 'morning' | 'afternoon' | 'night';
  taken: boolean;
  instructions: string;
}

export function InteractivePillDashboard({ initialPills = [] }: { initialPills?: Pill[] }) {
  const [pills, setPills] = useState<Pill[]>([
    { id: '1', name: 'Amoxicillin', timeOfDay: 'morning', taken: false, instructions: 'Take 1 pill after breakfast' },
    { id: '2', name: 'Iron Supplement', timeOfDay: 'afternoon', taken: false, instructions: 'Take with food' },
    { id: '3', name: 'Paracetamol', timeOfDay: 'night', taken: false, instructions: 'Take before sleeping if you have fever' },
    ...initialPills
  ]);

  const togglePill = (id: string) => {
    setPills(pills.map(p => p.id === id ? { ...p, taken: !p.taken } : p));
  };

  const getTimeIcon = (time: string) => {
    switch (time) {
      case 'morning': return <Sunrise className="text-orange-400 h-6 w-6" />;
      case 'afternoon': return <Sun className="text-yellow-500 h-6 w-6" />;
      case 'night': return <Moon className="text-blue-400 h-6 w-6" />;
      default: return <Sun className="h-6 w-6" />;
    }
  };

  const getTimeColor = (time: string) => {
    switch (time) {
      case 'morning': return 'bg-orange-50 border-orange-200';
      case 'afternoon': return 'bg-yellow-50 border-yellow-200';
      case 'night': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-sm">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          💊 Today's Routine
        </CardTitle>
        <p className="text-sm text-slate-500">Check off your medicines as you take them.</p>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {pills.map(pill => (
          <div 
            key={pill.id} 
            className={cn(
              "p-4 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer shadow-sm hover:shadow-md",
              getTimeColor(pill.timeOfDay),
              pill.taken ? "opacity-60 grayscale-[0.5]" : ""
            )}
            onClick={() => togglePill(pill.id)}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-full shadow-sm">
                {getTimeIcon(pill.timeOfDay)}
              </div>
              <div>
                <h3 className={cn("text-lg font-bold text-slate-800", pill.taken && "line-through text-slate-500")}>
                  {pill.name}
                </h3>
                <p className="text-slate-600 text-sm font-medium capitalize">
                  {pill.timeOfDay} • {pill.instructions}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <VoicePrescription 
                text={`Take ${pill.name} in the ${pill.timeOfDay}. ${pill.instructions}`} 
              />
              <button 
                onClick={() => togglePill(pill.id)}
                className="text-primary hover:scale-110 transition-transform"
                aria-label={pill.taken ? "Mark as not taken" : "Mark as taken"}
              >
                {pill.taken ? (
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                ) : (
                  <Circle className="h-10 w-10 text-slate-300" />
                )}
              </button>
            </div>
          </div>
        ))}
        
        {pills.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No medicines scheduled for today.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
