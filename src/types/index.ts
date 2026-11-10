export type UserRole = 'farmer' | 'expert' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  district?: string;
  taluk?: string;
  village?: string;
  avatarUrl?: string;
  role: UserRole;
  isGuest?: boolean;
}

export interface Crop {
  id: string;
  name: string;
  scientificName: string;
  icon: string;
  imageUrl: string;
  description: string;
  isActive: boolean;
}

export type DiseaseSeverity = 'Low' | 'Medium' | 'High';

export interface Disease {
  id: string;
  cropId: string;
  englishName: string;
  scientificName: string;
  severity: DiseaseSeverity;
  description: string;
  symptoms: string[];
  causes: string[];
  organicTreatment: string;
  chemicalTreatment: string;
  prevention: string;
  approvedReferences: string[];
  lastReviewedDate: string;
  isActive: boolean;
}

export interface Treatment {
  id: string;
  diseaseId: string;
  cropId: string;
  treatmentType: 'organic' | 'chemical' | 'preventive' | 'cultural';
  title: string;
  instructions: string;
  safetyWarning?: string;
  dosageInfo?: string;
  isApproved: boolean;
  reviewedBy: string;
  lastReviewedDate: string;
}

export interface AgriculturalShop {
  id: string;
  shopName: string;
  ownerName?: string;
  phoneNumber: string;
  district: string;
  taluk: string;
  village?: string;
  address: string;
  latitude: number;
  longitude: number;
  services: string[];
  verificationStatus: 'verified' | 'pending' | 'unverified';
  isActive: boolean;
}

export type DiagnosisMode = 'hosted_ai' | 'tflite_onnx' | 'demo_fallback';

export interface PredictionAlternative {
  diseaseId: string;
  name: string;
  confidence: number;
}

export interface ScanResult {
  id: string;
  userId?: string;
  cropId: string;
  cropName: string;
  diseaseId: string;
  predictedDisease: string;
  scientificName?: string;
  confidence: number; // 0 to 100
  severity: DiseaseSeverity;
  diagnosisMode: DiagnosisMode;
  modelVersion: string;
  timestamp: string;
  imageUrl: string;
  symptoms?: string[];
  causes?: string[];
  organicTreatment?: string;
  chemicalTreatment?: string;
  prevention?: string;
  recommendedAction?: string;
  alternativePredictions?: PredictionAlternative[];
  isDemoModeNote?: string;
}

export type ConsultationStatus = 'Submitted' | 'Under Review' | 'Response Provided' | 'Completed';

export interface ExpertConsultation {
  id: string;
  farmerId: string;
  farmerName?: string;
  cropId: string;
  cropName?: string;
  diseaseId?: string;
  scanId?: string;
  leafImageUrl: string;
  farmerNotes: string;
  district: string;
  status: ConsultationStatus;
  assignedExpertId?: string;
  expertName?: string;
  expertObservations?: string;
  recommendedTreatment?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgriculturalSource {
  id: string;
  title: string;
  organization: string;
  publicationYear?: number;
  url?: string;
  notes?: string;
  isVerified: boolean;
}

export interface SystemHealthStatus {
  databaseConnected: boolean;
  databaseType: 'supabase_cloud' | 'local_indexeddb';
  aiProviderConfigured: boolean;
  aiProviderEndpoint?: string;
  storageAvailable: boolean;
  authProviderActive: boolean;
  offlineCacheReady: boolean;
  lastChecked: string;
}
