# Database Integration Documentation

## Overview

The SehatSetu project now includes comprehensive MongoDB database integration with the following features:

- **Robust connection management** with automatic reconnection
- **Graceful fallback** to static data when database is unavailable
- **Comprehensive data models** for medicines, symptoms, pharmacies, and symptom records
- **Analytics and reporting** capabilities
- **RESTful API endpoints** for all database operations

## Quick Start

### 1. Database Setup Options

#### Option A: Local MongoDB (Recommended for Development)
```bash
# Install MongoDB locally and start the service
# Then set up the database:
npm run setup:database
```

#### Option B: MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a cluster and get the connection string
3. Update `.env` file with your connection string:
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/sehatsetu
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI`: Your MongoDB connection string
- `RAPIDAPI_KEY`: For AI symptom analysis (optional)

### 3. Start the Application
```bash
npm run dev
```

## Database Models

### Medicine Model
- **Purpose**: Store medicine inventory and availability
- **Key Fields**: name, stock, pharmacy, pincode, price, category
- **Indexes**: pincode + name, pharmacy + stock

### Symptom Model
- **Purpose**: Available symptoms for the symptom checker
- **Key Fields**: name, category, description, severity
- **Categories**: general, respiratory, digestive, neurological, etc.

### Pharmacy Model
- **Purpose**: Pharmacy location and contact information
- **Key Fields**: name, address, pincode, phone, coordinates
- **Features**: Geospatial queries, opening hours

### Symptom Record Model
- **Purpose**: Store symptom check sessions for analytics
- **Key Fields**: symptoms, triageLevel, aiAnalysis, userAge
- **Privacy**: No personally identifiable information stored

## API Endpoints

### Core Endpoints
- `GET /api/medicines` - Get medicines by pincode
- `POST /api/symptoms/check` - Analyze symptoms
- `GET /api/symptoms/list` - Get available symptoms

### Extended Endpoints
- `GET /api/health/database` - Database health check
- `GET /api/analytics` - Triage and symptom analytics
- `GET /api/medicines/search?q=<query>` - Search medicines
- `GET /api/symptoms/search?q=<query>` - Search symptoms
- `GET /api/pharmacies?pincode=<code>` - Get pharmacies by pincode
- `POST /api/medicines` - Add/update medicine (admin)

## Graceful Degradation

The application is designed to work even when the database is unavailable:

1. **Automatic Fallback**: If database connection fails, APIs return static data
2. **No Interruption**: Users can still access core functionality
3. **Transparent Recovery**: When database reconnects, it automatically switches back

## Security Features

- **Input Validation**: All inputs validated using Zod schemas
- **Connection Security**: Secure connection options and timeouts
- **Error Handling**: Comprehensive error handling prevents data exposure
- **Privacy**: Symptom records store no personal information

## Troubleshooting

### Connection Issues
1. **Check MongoDB Service**: Ensure MongoDB is running
2. **Verify Connection String**: Check `MONGODB_URI` in `.env`
3. **Network Access**: Ensure firewall allows MongoDB connections
4. **Atlas Users**: Whitelist your IP address in MongoDB Atlas

### Fallback Behavior
If you see "falling back to static data" in logs, the database is unavailable but the application continues to work with predefined data.

## Development Commands

```bash
# Setup database with initial data
npm run setup:database

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

**Note**: The application is designed to be resilient and will continue operating even if the database is temporarily unavailable, ensuring uninterrupted service to users.