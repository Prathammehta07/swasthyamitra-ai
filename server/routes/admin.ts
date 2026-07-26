import { RequestHandler } from "express";
import { PharmacyService, MedicineService, SymptomService, SymptomRecordService } from "../services/database";
import database from "../config/database";

// Health check for database connection
export const handleDatabaseHealth: RequestHandler = async (_req, res) => {
  try {
    const isConnected = database.getConnectionStatus();
    
    if (isConnected) {
      res.json({ 
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({ 
        status: 'unhealthy',
        database: 'disconnected',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Get analytics data
export const handleAnalytics: RequestHandler = async (req, res) => {
  try {
    const { startDate, endDate, limit } = req.query;
    
    const start = startDate ? new Date(String(startDate)) : undefined;
    const end = endDate ? new Date(String(endDate)) : undefined;
    const resultLimit = limit ? parseInt(String(limit)) : 10;

    const [triageAnalytics, commonSymptoms] = await Promise.all([
      SymptomRecordService.getTriageAnalytics(start, end),
      SymptomRecordService.getCommonSymptomsAnalytics(resultLimit, start, end)
    ]);

    res.json({
      triageAnalytics,
      commonSymptoms,
      period: {
        startDate: start?.toISOString(),
        endDate: end?.toISOString()
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
};

// Search medicines
export const handleMedicineSearch: RequestHandler = async (req, res) => {
  try {
    const { q: query, pincode } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const medicines = await MedicineService.searchMedicines(
      query, 
      pincode ? String(pincode) : undefined
    );

    res.json({
      query,
      pincode: pincode || null,
      results: medicines.map(med => ({
        id: med._id,
        name: med.name,
        stock: med.stock,
        pharmacy: med.pharmacy,
        pincode: med.pincode,
        category: med.category,
        requiresPrescription: med.requiresPrescription
      })),
      count: medicines.length
    });
  } catch (error) {
    console.error('Medicine search error:', error);
    res.status(500).json({ error: 'Failed to search medicines' });
  }
};

// Search symptoms
export const handleSymptomSearch: RequestHandler = async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const symptoms = await SymptomService.searchSymptoms(query);

    res.json({
      query,
      results: symptoms.map(symptom => ({
        id: symptom._id,
        name: symptom.name,
        category: symptom.category,
        description: symptom.description,
        severity: symptom.severity,
        bodyPart: symptom.bodyPart
      })),
      count: symptoms.length
    });
  } catch (error) {
    console.error('Symptom search error:', error);
    res.status(500).json({ error: 'Failed to search symptoms' });
  }
};

// Get pharmacies by pincode
export const handlePharmacies: RequestHandler = async (req, res) => {
  try {
    const { pincode } = req.query;
    
    if (!pincode || typeof pincode !== 'string') {
      return res.status(400).json({ error: 'Pincode parameter is required' });
    }

    const pharmacies = await PharmacyService.getPharmaciesByPincode(pincode);

    res.json({
      pincode,
      pharmacies: pharmacies.map(pharmacy => ({
        id: pharmacy._id,
        name: pharmacy.name,
        address: pharmacy.address,
        phone: pharmacy.phone,
        openingHours: pharmacy.openingHours,
        coordinates: pharmacy.coordinates
      })),
      count: pharmacies.length
    });
  } catch (error) {
    console.error('Pharmacies fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch pharmacies' });
  }
};

// Add medicine (for admin/pharmacy management)
export const handleAddMedicine: RequestHandler = async (req, res) => {
  try {
    const medicineData = req.body;
    
    // Basic validation
    if (!medicineData.name || !medicineData.pharmacy || !medicineData.pincode) {
      return res.status(400).json({ 
        error: 'Name, pharmacy, and pincode are required' 
      });
    }

    const medicine = await MedicineService.addOrUpdateMedicine(medicineData);

    res.status(201).json({
      message: 'Medicine added/updated successfully',
      medicine: {
        id: medicine._id,
        name: medicine.name,
        stock: medicine.stock,
        pharmacy: medicine.pharmacy,
        pincode: medicine.pincode,
        category: medicine.category
      }
    });
  } catch (error) {
    console.error('Add medicine error:', error);
    res.status(500).json({ error: 'Failed to add medicine' });
  }
};