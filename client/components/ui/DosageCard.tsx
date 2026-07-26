import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon, Sunset, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DosageCardProps {
  medication: string;
  onRemove?: () => void;
}

export function DosageCard({ medication, onRemove }: DosageCardProps) {
  const normalizedStr = medication.toLowerCase();
  
  const hasMorning = normalizedStr.includes('morning') || normalizedStr.includes('1-') || normalizedStr.match(/\b1-0-0\b/);
  const hasAfternoon = normalizedStr.includes('afternoon') || normalizedStr.includes('evening') || normalizedStr.match(/\b\d-1-\d\b/);
  const hasNight = normalizedStr.includes('night') || normalizedStr.match(/\b\d-\d-1\b/) || normalizedStr.includes('bedtime');

  // If no time is specified, just show it normally
  const hasTimeSpecified = hasMorning || hasAfternoon || hasNight;

  // Attempt to separate medicine name from dosage if possible (basic split by hyphen)
  const parts = medication.split('-');
  const name = parts.length > 1 && parts[0].trim().length > 2 ? parts[0].trim() : medication;
  const customInstructions = parts.length > 1 ? parts.slice(1).join('-').trim() : '';

  return (
    <Card className="relative overflow-hidden w-full mb-2 bg-slate-50 dark:bg-slate-900/50">
      {onRemove && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-1 top-1 h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <CardContent className="p-3">
        <div className="font-semibold text-sm mb-1 pr-6">{name}</div>
        
        {hasTimeSpecified ? (
          <div className="flex flex-wrap gap-2 mt-2">
            {hasMorning && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200">
                <Sun className="w-3 h-3 mr-1" /> Morning
              </Badge>
            )}
            {hasAfternoon && (
              <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200">
                <Sunset className="w-3 h-3 mr-1" /> Afternoon
              </Badge>
            )}
            {hasNight && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200">
                <Moon className="w-3 h-3 mr-1" /> Night
              </Badge>
            )}
          </div>
        ) : customInstructions ? (
          <div className="text-xs text-muted-foreground mt-2">
            {customInstructions}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground mt-2">
            No specific time provided
          </div>
        )}
      </CardContent>
    </Card>
  );
}
