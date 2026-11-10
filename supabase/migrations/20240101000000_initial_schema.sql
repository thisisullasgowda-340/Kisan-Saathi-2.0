-- KisanSaathi PostgreSQL Database Schema
-- Production-ready schema with Row Level Security (RLS)

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    district TEXT,
    taluk TEXT,
    village TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER ROLES ('farmer', 'expert', 'admin')
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('farmer', 'expert', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- 3. CROPS
CREATE TABLE IF NOT EXISTS public.crops (
    id TEXT PRIMARY KEY, -- 'tomato', 'potato', 'paddy', 'cotton', 'chilli'
    name TEXT NOT NULL,
    scientific_name TEXT,
    icon TEXT,
    image_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DISEASES
CREATE TABLE IF NOT EXISTS public.diseases (
    id TEXT PRIMARY KEY,
    crop_id TEXT NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
    english_name TEXT NOT NULL,
    scientific_name TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High')),
    description TEXT NOT NULL,
    symptoms TEXT[] NOT NULL DEFAULT '{}',
    causes TEXT[] NOT NULL DEFAULT '{}',
    organic_treatment TEXT NOT NULL,
    chemical_treatment TEXT NOT NULL,
    prevention TEXT NOT NULL,
    approved_references TEXT[] NOT NULL DEFAULT '{}',
    last_reviewed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TREATMENTS
CREATE TABLE IF NOT EXISTS public.treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disease_id TEXT NOT NULL REFERENCES public.diseases(id) ON DELETE CASCADE,
    crop_id TEXT NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
    treatment_type TEXT NOT NULL CHECK (treatment_type IN ('organic', 'chemical', 'preventive', 'cultural')),
    title TEXT NOT NULL,
    instructions TEXT NOT NULL,
    safety_warning TEXT,
    dosage_info TEXT DEFAULT 'Consult your local agricultural expert for the correct dosage and application instructions.',
    is_approved BOOLEAN DEFAULT TRUE,
    reviewed_by TEXT DEFAULT 'University of Agricultural Sciences, Bangalore',
    last_reviewed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AGRICULTURAL SHOPS (Karnataka)
CREATE TABLE IF NOT EXISTS public.agricultural_shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_name TEXT NOT NULL,
    owner_name TEXT,
    phone_number TEXT NOT NULL,
    district TEXT NOT NULL,
    taluk TEXT NOT NULL,
    village TEXT,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    services TEXT[] DEFAULT ARRAY['Seeds', 'Fertilizers', 'Organic Bio-inputs', 'Pesticide Advisory'],
    verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending', 'unverified')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SCAN HISTORY
CREATE TABLE IF NOT EXISTS public.scan_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    crop_id TEXT NOT NULL REFERENCES public.crops(id),
    crop_name TEXT NOT NULL,
    disease_id TEXT NOT NULL REFERENCES public.diseases(id),
    predicted_disease TEXT NOT NULL,
    confidence NUMERIC(5,2) NOT NULL,
    severity TEXT NOT NULL,
    diagnosis_mode TEXT NOT NULL DEFAULT 'demo_fallback', -- 'hosted_ai', 'tflite_onnx', 'demo_fallback'
    image_url TEXT,
    treatment_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EXPERT CONSULTATIONS
CREATE TABLE IF NOT EXISTS public.expert_consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    crop_id TEXT NOT NULL REFERENCES public.crops(id),
    disease_id TEXT REFERENCES public.diseases(id),
    scan_id UUID REFERENCES public.scan_history(id),
    leaf_image_url TEXT NOT NULL,
    farmer_notes TEXT,
    district TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under Review', 'Response Provided', 'Completed')),
    assigned_expert_id UUID REFERENCES public.profiles(id),
    expert_observations TEXT,
    recommended_treatment TEXT,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AGRICULTURAL SOURCES
CREATE TABLE IF NOT EXISTS public.agricultural_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    publication_year INT,
    url TEXT,
    notes TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. APP SETTINGS
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_diseases_crop_id ON public.diseases(crop_id);
CREATE INDEX IF NOT EXISTS idx_treatments_disease_id ON public.treatments(disease_id);
CREATE INDEX IF NOT EXISTS idx_shops_district_taluk ON public.agricultural_shops(district, taluk);
CREATE INDEX IF NOT EXISTS idx_scan_history_user_id ON public.scan_history(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_farmer_id ON public.expert_consultations(farmer_id);
CREATE INDEX IF NOT EXISTS idx_consultations_expert_id ON public.expert_consultations(assigned_expert_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.expert_consultations(status);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agricultural_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agricultural_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- HELPER FUNCTIONS FOR RLS ROLES
CREATE OR REPLACE FUNCTION public.is_admin(user_uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_expert(user_uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uid AND (role = 'expert' OR role = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS POLICIES

-- Profiles: Users can read and update their own profile; admins can read all
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User Roles: Read own role; Admins manage roles
CREATE POLICY "Users can read own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage user roles" ON public.user_roles
    FOR ALL USING (public.is_admin(auth.uid()));

-- Crops: Anyone can view active crops; Admins can manage
CREATE POLICY "Public can view active crops" ON public.crops
    FOR SELECT USING (is_active = TRUE OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage crops" ON public.crops
    FOR ALL USING (public.is_admin(auth.uid()));

-- Diseases: Anyone can view active diseases; Admins can manage
CREATE POLICY "Public can view active diseases" ON public.diseases
    FOR SELECT USING (is_active = TRUE OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage diseases" ON public.diseases
    FOR ALL USING (public.is_admin(auth.uid()));

-- Treatments: Public can view approved treatments; Admins can manage
CREATE POLICY "Public can view approved treatments" ON public.treatments
    FOR SELECT USING (is_approved = TRUE OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage treatments" ON public.treatments
    FOR ALL USING (public.is_admin(auth.uid()));

-- Shops: Public can view verified/active shops; Admins can manage
CREATE POLICY "Public can view active shops" ON public.agricultural_shops
    FOR SELECT USING (is_active = TRUE OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage shops" ON public.agricultural_shops
    FOR ALL USING (public.is_admin(auth.uid()));

-- Scan History: Users view and delete their own scan history; Admins can view all for stats
CREATE POLICY "Users manage their own scan history" ON public.scan_history
    FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Consultations: Farmers view/create their own; Experts view assigned/submitted; Admins manage
CREATE POLICY "Farmers manage their own consultations" ON public.expert_consultations
    FOR ALL USING (auth.uid() = farmer_id);
CREATE POLICY "Experts can view and update consultations" ON public.expert_consultations
    FOR SELECT USING (public.is_expert(auth.uid()));
CREATE POLICY "Experts can update consultation responses" ON public.expert_consultations
    FOR UPDATE USING (public.is_expert(auth.uid()));
CREATE POLICY "Admins full access to consultations" ON public.expert_consultations
    FOR ALL USING (public.is_admin(auth.uid()));

-- Sources & Settings: Public read, Admin write
CREATE POLICY "Public read sources" ON public.agricultural_sources FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage sources" ON public.agricultural_sources FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Public read app settings" ON public.app_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage app settings" ON public.app_settings FOR ALL USING (public.is_admin(auth.uid()));
