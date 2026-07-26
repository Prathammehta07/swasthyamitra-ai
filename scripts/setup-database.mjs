#!/usr/bin/env node

/**
 * Database Setup Script for SehatSetu
 */

import 'dotenv/config';
import database from '../server/config/database.js';
import { SeedService } from '../server/services/database.js';

async function setupDatabase() {
  console.log('🏥 SehatSetu Database Setup');
  
  try {
    console.log('🔌 Connecting to database...');
    await database.connect();
    
    console.log('🌱 Seeding initial data...');
    await SeedService.seedInitialData();
    
    console.log('✅ Database setup completed successfully!');
    console.log('You can now start the application with: npm run dev');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.log('Check MongoDB connection and .env configuration');
    process.exit(1);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
}

setupDatabase();