# KISANSAATHI (ಕಿಸಾನ್ ಸಾಥಿ)
> **Smarter Farming. Healthier Crops. Better Harvests.**  
> *Offline AI Crop Disease Scanner for Farmers across Karnataka, India.*

---

## 1. Executive Summary

**KisanSaathi** is a full-stack, production-ready agricultural technology platform designed to empower small, marginal, and commercial farmers across Karnataka with instant, field-level leaf disease detection, certified organic remedies, verified chemical controls, and authentic dealer directories.

The application operates with an **offline-first Progressive Web App (PWA)** architecture, ensuring farmers can diagnose crops, read pathogen treatments, and access local shop data even in rural farm locations with zero cellular reception.

---

## 2. Technology Architecture

```
[ Mobile / Desktop PWA Client ]
         |
         +--> [ Service Worker & IndexedDB ] (Offline Cache, History, Pathology DB)
         |
         +--> [ CropDiseaseAI Modular Service ]
                   |
                   +--> [ CROP_AI_API_URL Hosted Model (ONNX / TFLite) ]
                   |
                   +--> [ Transparent Demo Classifier (When API unconfigured) ]
         |
         +--> [ Supabase PostgreSQL Backend ]
                   |
                   +--> Authentication & Row Level Security (RLS)
                   +--> PostgreSQL Database (10 Tables)
                   +--> Edge Functions (analyze-crop, validate-image, etc.)
                   +--> Secure Image Storage Buckets
```

### Frontend Stack:
- **React 18 + TypeScript + Vite 6**
- **Tailwind CSS** with specialized agronomy design system (Primary: `#2E7D32`, Secondary: `#A5D6A7`, Canvas: `#F8FAF5`)
- **Lucide Icons**
- **React Router v7**
- **TanStack Query**
- **PWA Service Worker** with IndexedDB (`KisanSaathi_DB`)

### Backend Stack:
- **Supabase Cloud / PostgreSQL**
- **Row Level Security (RLS)** with distinct policies for Farmers, Experts, and Admins
- **Database Migrations** in `supabase/migrations/`
- **Seed Scripts** in `supabase/seed.sql`
- **Supabase Edge Functions** in `supabase/functions/`
- **Supabase Storage** (`crop-images`, `disease-reference-images`, `profile-images`)

---

## 3. Supported Crops & Disease Library

KisanSaathi includes authenticated pathology profiles for the top 5 commercial Karnataka crops:

| Crop | Representative Diseases Covered | Scientific Reference Sources |
| :--- | :--- | :--- |
| **Tomato** | Early Blight, Late Blight, Leaf Mold, Bacterial Spot, Healthy | ICAR-IIHR Hessaraghatta & UAS Bangalore |
| **Potato** | Early Blight, Late Blight, Common Scab, Healthy | ICAR-CPRI Shimla & Hassan Zonal Station |
| **Paddy (Rice)** | Bacterial Leaf Blight, Brown Spot, Leaf Blast, Healthy | ICAR-NRRI & UAS Raichur / Mandya |
| **Cotton** | Bacterial Blight (Black Arm), Cotton Leaf Curl Virus, Alternaria Spot, Healthy | ICAR-CICR Nagpur & UAS Dharwad |
| **Chilli** | Anthracnose (Die-back), Cercospora Leaf Spot, Chilli Leaf Curl Virus, Healthy | Spices Board India & UAS Dharwad |

---

## 4. User Roles & Capabilities

### A. Farmer
- Register, login, or continue via **1-click Guest Mode**.
- Select crop, take camera leaf photo or upload from gallery.
- Review image quality scores (lighting, sharpness, resolution).
- Receive instant AI diagnosis with confidence level:
  - **High (≥85%)**: Primary identification with organic and chemical controls.
  - **Medium (70-84%)**: Likely diagnosis with expert verification prompt.
  - **Low (<70%)**: Uncertain result; recommends professional extension consult.
- Submit leaf photo for **Agricultural Expert Tele-Review**.
- Find verified agricultural shops with **Call Now (`tel:`)** and **Get Directions (Google Maps)**.
- Local scan history with full offline persistence.

### B. Agricultural Expert
- Access assigned consultation cases.
- Inspect farmer leaf photographs alongside initial AI detections.
- Formulate certified diagnostic observations and recommended treatments.
- Update consultation state: `Submitted` ➔ `Under Review` ➔ `Response Provided` ➔ `Completed`.

### C. Administrator
- Live system analytics: scan counts, crop distribution, dealer networks.
- Full CRUD for disease catalog (add new strains, update symptoms, modify treatments).
- Agricultural dealer management with **CSV batch import**.
- System health status: Database connectivity, AI provider status, storage, and cache integrity.

---

## 5. CropDiseaseAI Service & Inference Modes

The application enforces strict diagnostic transparency:
1. **Hosted Cloud Inference (`diagnosis_mode: 'hosted_ai'`)**:
   - Routes requests to `CROP_AI_API_URL` with secure authorization.
2. **Edge ONNX / TFLite Interface (`diagnosis_mode: 'tflite_onnx'`)**:
   - Modular hook for client-side WebAssembly models.
3. **Transparent Demo Mode (`diagnosis_mode: 'demo_fallback'`)**:
   - Active when no hosted model URL is provided.
   - Distinctly labeled in the UI as **DEMO MODE**.
   - Simulates realistic pathogen results from authentic Karnataka university records without generating false model accuracy claims.

---

## 6. Environment Configuration

Copy the template from `.env.example`:

```bash
# Supabase Backend Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Hosted AI Model Endpoint (Optional)
VITE_CROP_AI_API_URL=https://api.your-inference-server.com/v1

# Environment
VITE_APP_ENV=development
```

> **Note on Zero Configuration**: If Supabase credentials or model endpoints are left empty, the application seamlessly runs in **offline-first IndexedDB mode** with full demo capabilities.

---

## 7. Running the Application Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

---

## 8. Database Deployment (Supabase)

1. Open your Supabase Project Dashboard.
2. Navigate to the **SQL Editor**.
3. Run the migrations in sequence:
   - `supabase/migrations/20240101000000_initial_schema.sql` (Creates tables & RLS policies)
   - `supabase/migrations/20240101000001_storage_setup.sql` (Creates storage buckets & access rules)
   - `supabase/seed.sql` (Populates crops, diseases, shops, and sources)
4. Deploy edge functions:
   ```bash
   supabase functions deploy analyze-crop
   supabase functions deploy validate-image
   supabase functions deploy get-disease-details
   supabase functions deploy get-treatment-recommendations
   supabase functions deploy request-expert-review
   ```

---

## 9. Chemical Safety & Agricultural Disclaimer

Chemical recommendations and dosages provided in KisanSaathi are derived from University of Agricultural Sciences (UAS) package of practices. **Farmers must always consult their local Raitha Samparka Kendra (RSK) or Taluk Agricultural Officer for certified dosage, water dilution rates, and safety intervals before application.**
