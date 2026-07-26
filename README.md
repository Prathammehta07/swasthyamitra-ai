# 🏥 Smart Telemedicine for Rural Healthcare

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)

A comprehensive telemedicine platform designed to bridge the healthcare gap in rural areas, specifically tailored for Nabha region. This full-stack web application connects rural patients with qualified doctors through virtual consultations, appointment scheduling, and health awareness resources.

## ✨ Features

### 👥 Patient Portal
- **User Authentication**: Secure patient registration and login
- **Appointment Booking**: Easy online appointment scheduling with available doctors
- **Virtual Consultations**: Real-time video/audio consultation capabilities
- **Medical History**: Access to past consultations and prescriptions
- **Structured Prescriptions**: Beautifully formatted medical cards detailing medicine name, color-coded timings (Morning/Afternoon/Night), and explicit duration.
- **Prescription Acknowledgment**: Secure, one-tap visual confirmation system replacing complex forms for acknowledging prescriptions.
- **Health Records**: Digital storage of medical reports and documents with smart client-side file compression warnings to protect rural 3G bandwidth.
- **Medicine Reminders**: Automated medication tracking and alerts
- **Visual Dosage Guidance**: Color-coded, time-of-day visual icons (Morning/Afternoon/Night) replacing text-heavy medication instructions to prevent confusion.

### 👨‍⚕️ Doctor Dashboard
- **Professional Profile Management**: Manage specialization, availability, and credentials
- **Appointment Management**: View, accept, or reschedule patient appointments
- **Patient Records**: Access to patient medical history during consultations
- **Robust Prescription Builder**: A dynamic list builder replacing basic text areas. Doctors can add medications one by one, selecting exact timings and durations securely into the database schema.
- **Slot Management**: Flexible scheduling system for consultation slots
- **Consultation Notes**: Detailed documentation of each consultation

### 🌐 General Features
- **Multi-language Support**: Real-time interface translation (English/Hindi) ensuring critical medical context isn't lost for rural patients.
- **Elderly-Friendly Font Toggler**: Dynamic UI scaling button to increase text size across the app for visually impaired patients.
- **Health Awareness**: Educational content on common diseases and preventive care
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Offline Network Banner**: A dynamic warning banner actively monitors connectivity and warns users during internet drops (critical for rural 3G networks).
- **Emergency Help Button**: A persistent fallback button enabling one-click native phone calls (108) or pre-filled WhatsApp messages if video calls fail.
- **Guest Dashboard**: Explore platform features without registration
- **Admin Panel**: Comprehensive administration tools for platform management

### 📱 Ultra-Low Bandwidth & Connectivity Features
- **PWA Offline Medical Passport**: Turn the frontend into a Progressive Web App (PWA). If a mother loses signal while walking to the clinic, she should still be able to open the app offline and show the doctor her child's locally cached medical history, QR code, and recent prescriptions.
- **Audio-Only Consultation Fallback**: If a video stream drops below a certain bitrate, the app should automatically degrade to a lightweight, high-compression audio call instead of throwing a connection error.
- **SMS-Bridged Alerts (Twilio/Infobip)**: Do not rely on push notifications or emails for appointment reminders. Integrate an automated SMS gateway that pushes appointment slots, confirmations, and automated daily pill reminders via standard text messages.

### 🗣️ Accessibility & Low-Literacy Enhancements
- **Voice-to-Text Complaint Input**: Integrated browser-native SpeechRecognition API to allow patients to describe their ailments using their native tongue (e.g., Punjabi/Hindi), instantly transcribing the speech into text fields for complaint inputs and appointment notes.
- **Voice-Guided Prescriptions (Text-to-Speech)**: Added a small speaker icon next to prescriptions. Clicking it plays a clear audio clip reading the prescription aloud using the browser's SpeechSynthesis API in the patient's local dialect.
- **Interactive Dynamic Pill Dashboard**: Instead of just static icons, give patients a "Today's Routine" dashboard where they can physically check off visual pill images as they take them. This gamifies adherence and tracks real-world data for the doctor.

### 👨‍⚕️ Clinical Efficiency Tools for Doctors
- **Asha Worker / Health Worker Triage Mode**: In many villages, an ASHA (Accredited Social Health Activist) worker acts as the proxy user with a tablet, helping 10 different villagers. Create an "ASHA Mode" login where one coordinator can quickly swap between multiple patient profiles, upload vitals, and queue up appointments for a single village block.
- **Modular Quick-Text Prescription Templates**: Allow doctors to save "Common Ailment Bundles" (e.g., standard iron-deficiency anemia regimen, basic gastroenteritis treatment). With one click, the doctor populates the prescription, saving critical minutes per patient.

### 🏬 Localized Pharmacy & Delivery Integration
- **Village Pharmacy WhatsApp Routing**: Rural patients rarely use e-pharmacy shipping. Instead, add a feature that automatically generates a clean, compact image snippet of the prescription and provides a one-click button to send it directly to registered local chemists or community dispensaries in Nabha via WhatsApp.
- **Jan Aushadhi Generic Substitute Suggester**: Integrate a small backend lookup or data tag that highlights whether a lower-cost generic equivalent exists under the Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP). This helps doctors prescribe affordable options for low-income families.

### 🩺 Community & Proxy-Care Models
- **Family Group Profiles (Single Device Multi-User)**: In many rural households, there is only one smartphone. Allow a single phone number / account to host up to 5 individual patient profiles (e.g., Grandfather, Mother, Daughter) with segregated medical histories, avoiding the need for everyone to have a unique phone or email.
- **Offline QR Health Card Generation**: Allow the app to generate a printable "Health QR Code Card." A patient can laminate this and carry it with them. If they go to an ASHA worker or a nearby clinic, the provider can simply scan the QR code to instantly pull up their full medical timeline on the platform.

### ⚡ AI-Assisted Low-Hardware Diagnostics
- **Rich Markdown AI Diagnostics**: Complex AI symptom analysis is parsed and rendered beautifully on the client-side using native Markdown formatting and Tailwind Typography, preventing massive, unreadable walls of text.
- **Camera-Based Smart Wound/Rash Triage**: Before the call, the patient captures a Smart Wound Triage image (auto-compressed on-device) or records a 5-second Cough Audio Sample, providing doctors with high-fidelity static data to augment the low-bandwidth video call.
- **Cough Audio Analyzer for Respiratory Screening**: Allow patients to record a 5-second audio clip of their cough. This can be stored alongside their appointment metadata, giving remote doctors an acoustic sample to help differentiate between dry, wet, or asthmatic wheezing before the live interaction.

## 🛠️ Implementation Architecture

To see how these features weave into your existing setup without overcomplicating your database schema, here is how the data maps together:

| Feature | Primary Tech Layer | Frontend Impact | Backend Impact |
|---------|--------------------|-----------------|----------------|
| **Multi-Profile Accounts** | Database Schema | Profile switching dropdown on login | Update User schema to support a `dependent_patients` array |
| **Jan Aushadhi Lookup** | Rest API / Static JSON | Small green badge next to matching generic drugs | A dictionary lookup file `shared/medications.ts` |
| **Prescription Image Export** | Client-side canvas rendering | "Share to WhatsApp" button | Zero server load (handled entirely via `html2canvas` in browser) |

## 🗺️ Patient-Care Timeline

**Phase 1: Patient Booking & Prep**
Patient opens app via 3G. Uses Font Toggler and Guest Dashboard to check availability. System flags bandwidth and caches vital records locally via PWA. *If the patient lacks a device, their profile can be accessed via Family Group Profiles or a physical QR Health Card.*

**Phase 2: Pre-Consultation Diagnostics**
Before the call, the patient captures a Smart Wound Triage image (auto-compressed on-device) or records a 5-second Cough Audio Sample, providing doctors with high-fidelity static data to augment the low-bandwidth video call.

**Phase 3: The Consultation**
Video call initiates. If bandwidth drops, app triggers the Audio-Only Fallback or shifts the user to the Emergency WhatsApp/Call bypass.

**Phase 4: Post-Care & Adherence**
Doctor uses Quick-Text Templates to instantly issue a prescription. Patient reviews via Visual Dosage Icons and listens to Voice-Guided Text-to-Speech reminders.

**Phase 5: Pharmacy & Fulfillment**
Patient generates a clean image snippet of the prescription and forwards it to a local chemist via WhatsApp routing. The system highlights Jan Aushadhi generic substitutes to ensure affordable medication options for low-income families.

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **React Router 6** - Client-side routing
- **TypeScript** - Type-safe development
- **TailwindCSS 3** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Vite** - Fast build tool and dev server
- **Lucide React** - Beautiful icon library

### Backend
- **Express.js** - Node.js web framework
- **TypeScript** - Server-side type safety
- **RESTful API** - Clean API architecture
- **Integrated Vite Server** - Unified development experience

### Database & Storage
- Configurable database support (see [DATABASE.md](./DATABASE.md))
- Secure data storage for patient records and appointments

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **pnpm** (preferred) or npm/yarn - Package manager
- **Git** - Version control system

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/kevindesai1312/biothron_sehatsetu.git
cd biothron_sehatsetu
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Database Configuration (if applicable)
DATABASE_URL=your_database_url

# JWT Secret (for authentication)
JWT_SECRET=your_secret_key_here

# Gemini API Key (for AI diagnostics)
GEMINI_API_KEY=your_gemini_api_key_here

# Other configuration variables...
```

### 4. Database Setup

If your project uses a database, run the setup script:

```bash
node scripts/setup-database.mjs
```

Refer to [DATABASE.md](./DATABASE.md) for detailed database configuration instructions.

### 5. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:8080`

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run test suite with Vitest |

## 🏗️ Project Structure

```
biothron_sehatsetu/
├── client/                 # React SPA frontend
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Radix UI components
│   │   ├── guards/       # Route protection components
│   │   └── layout/       # Layout components
│   ├── pages/            # Route page components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and configurations
│   └── App.tsx           # Main application entry point
│
├── server/                # Express backend
│   ├── routes/           # API route handlers
│   ├── models/           # Data models
│   ├── services/         # Business logic services
│   ├── config/           # Server configuration
│   └── index.ts          # Server entry point
│
├── shared/                # Shared types and utilities
│   └── api.ts            # API type definitions
│
├── scripts/               # Utility scripts
├── public/                # Static assets
└── dist/                  # Production build output
```

## 🔑 Key Pages & Routes

### Public Routes
- `/` - Landing page / Guest dashboard
- `/auth` - Unified authentication page

### Patient Routes
- `/patient/dashboard` - Patient dashboard
- `/patient/book-appointment` - Book new appointment
- `/patient/appointments` - View appointments
- `/patient/profile` - Manage profile
- `/patient/management` - Patient management

### Doctor Routes
- `/doctor/auth` - Doctor authentication
- `/doctor/dashboard` - Doctor dashboard
- `/doctor/slot-management` - Manage consultation slots
- `/doctor/patients` - Patient management

### General
- `/awareness` - Health awareness resources

## 🎨 UI Components

This project includes a comprehensive library of pre-built UI components located in `client/components/ui/`:

- Forms, Inputs, Buttons
- Dialogs, Modals, Popups
- Navigation components
- Data display components (Tables, Cards)
- Feedback components (Toasts, Alerts)
- And many more...

All components are built with **Radix UI** primitives and styled with **TailwindCSS**.

## 🌍 Deployment

### Docker Deployment

The project includes Docker configuration for easy deployment:

```bash
# Build Docker image
docker build -t telemedicine-app .

# Run with Docker Compose
docker-compose up -d
```

### Cloud Platforms

The application is configured for deployment on:
- **Vercel** - See `vercel.json`
- **Netlify** - See `netlify.toml`
- **Render** - See `render.yaml`

Follow the respective platform's documentation for deployment steps.

## 🔒 Security Features

- JWT-based authentication
- Protected routes with auth guards
- Role-based access control (Patient/Doctor/Admin)
- Secure password handling
- CORS configuration
- Input validation and sanitization

## 📱 Responsive Design

The application is fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1280px+)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Pratham Mehta** - *Initial work* - [Prathammehta07](https://github.com/Prathammehta07)
- **Kevin Desai** - *Developer* - [kevindesai1312](https://github.com/kevindesai1312)

## 🙏 Acknowledgments

- Built for improving healthcare access in rural Nabha region
- Inspired by the need for accessible telemedicine solutions
- Thanks to all contributors and supporters

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## 🌟 Show Your Support

Give a ⭐️ if this project helped you improve healthcare accessibility!

---

**Note**: This is a healthcare-focused application. Please ensure compliance with local healthcare regulations and data privacy laws (such as HIPAA, GDPR, etc.) when deploying and using this platform with real patient data.
