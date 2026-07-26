export interface MedicationLookup {
  brandName: string;
  genericName: string;
  janAushadhiAvailable: boolean;
  estimatedPriceDiff: string; // e.g., "70% cheaper"
}

export const JAN_AUSHADHI_MEDICATIONS: MedicationLookup[] = [
  { brandName: "Crocin", genericName: "Paracetamol 500mg", janAushadhiAvailable: true, estimatedPriceDiff: "80% cheaper" },
  { brandName: "Augmentin", genericName: "Amoxicillin + Clavulanic Acid", janAushadhiAvailable: true, estimatedPriceDiff: "60% cheaper" },
  { brandName: "Pan-D", genericName: "Pantoprazole + Domperidone", janAushadhiAvailable: true, estimatedPriceDiff: "75% cheaper" },
  { brandName: "Allegra", genericName: "Fexofenadine 120mg", janAushadhiAvailable: true, estimatedPriceDiff: "65% cheaper" },
  { brandName: "Amlokind", genericName: "Amlodipine 5mg", janAushadhiAvailable: true, estimatedPriceDiff: "90% cheaper" },
  { brandName: "Glycomet", genericName: "Metformin 500mg", janAushadhiAvailable: true, estimatedPriceDiff: "70% cheaper" }
];

export const checkGenericSubstitute = (medName: string): MedicationLookup | null => {
  const query = medName.toLowerCase();
  return JAN_AUSHADHI_MEDICATIONS.find(
    med => med.brandName.toLowerCase().includes(query) || med.genericName.toLowerCase().includes(query)
  ) || null;
};
