import "dotenv/config";
import express from "express";
import cors from "cors";
import database from "./config/database";
import { SeedService } from "./services/database";
import { handleDemo } from "./routes/demo";
import { handleMedicines } from "./routes/medicines";
import { handleSymptomCheck, getSymptomsList } from "./routes/symptoms";
import { 
  handleDatabaseHealth, 
  handleAnalytics, 
  handleMedicineSearch,
  handleSymptomSearch,
  handlePharmacies,
  handleAddMedicine
} from "./routes/admin";
import { handleChatRequest } from "./routes/chatbot";
import doctorRoutes from "./routes/doctor";
import patientRoutes from "./routes/patient";

export function createServer() {
  const app = express();

  // Initialize database connection
  database.connect().then(async () => {
    // Seed initial data if needed
    try {
      await SeedService.seedInitialData();
    } catch (error) {
      console.warn('Warning: Could not seed initial data:', error);
    }
  }).catch(error => {
    console.warn('Warning: Database connection failed. Running without database.');
    console.warn('To enable database features, install MongoDB or configure MongoDB Atlas.');
    console.warn('Error details:', error.message);
  });

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Core application routes
  app.get("/api/demo", handleDemo);
  app.get("/api/medicines", handleMedicines);
  app.post("/api/symptoms/check", handleSymptomCheck);
  app.get("/api/symptoms/list", getSymptomsList);
  app.post("/api/chat", handleChatRequest);

  // Doctor routes
  app.use("/api/doctor", doctorRoutes);

  // Patient routes
  app.use("/api/patient", patientRoutes);

  // Database and admin routes
  app.get("/api/health/database", handleDatabaseHealth);
  app.get("/api/analytics", handleAnalytics);
  app.get("/api/medicines/search", handleMedicineSearch);
  app.get("/api/symptoms/search", handleSymptomSearch);
  app.get("/api/pharmacies", handlePharmacies);
  app.post("/api/medicines", handleAddMedicine);

  return app;
}
