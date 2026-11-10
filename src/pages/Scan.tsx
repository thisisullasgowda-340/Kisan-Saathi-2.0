import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { offlineDB } from '../lib/indexedDB';
import { Crop, ScanResult } from '../types';
import { CropDiseaseAI, ImageQualityReport } from '../services/cropDiseaseAI';
import { CameraModal } from '../components/scanner/CameraModal';
import { ImageQualityCheck } from '../components/scanner/ImageQualityCheck';
import {
  Camera,
  Upload,
  RotateCw,
  Trash2,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  Stethoscope,
  Store,
  ArrowRight,
  Info,
  Sparkles,
  ExternalLink,
  Share2
} from 'lucide-react';

export const Scan: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Workflow states
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);

  // Image states
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [qualityReport, setQualityReport] = useState<ImageQualityReport | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Analysis & Result states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<ScanResult | null>(null);

  // Expert consultation modal
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [farmerNotes, setFarmerNotes] = useState('');
  const [consultSubmitted, setConsultSubmitted] = useState(false);

  useEffect(() => {
    loadCrops();
  }, []);

  // Handle URL param ?crop=potato or ?resultId=xxx
  useEffect(() => {
    const cropParam = searchParams.get('crop');
    const resultIdParam = searchParams.get('resultId');

    if (resultIdParam) {
      loadPreviousResult(resultIdParam);
    } else if (cropParam && crops.length > 0) {
      const match = crops.find((c) => c.id.toLowerCase() === cropParam.toLowerCase());
      if (match) {
        setSelectedCrop(match);
        setStep(2);
      }
    }
  }, [searchParams, crops]);

  const loadCrops = async () => {
    const list = await offlineDB.getCrops();
    setCrops(list);
  };

  const loadPreviousResult = async (id: string) => {
    const scans = await offlineDB.getScans();
    const match = scans.find((s) => s.id === id);
    if (match) {
      setDiagnosisResult(match);
      setStep(4);
    }
  };

  // STEP 1: Select Crop
  const handleSelectCrop = (crop: Crop) => {
    setSelectedCrop(crop);
    setStep(2);
  };

  // STEP 2: Handle File Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setFileError('Invalid file format. Please upload a JPG, PNG, or WebP leaf image.');
      return;
    }

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setFileError('File size exceeds 10MB. Please upload a smaller leaf image.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setImageDataUrl(dataUrl);

      // Perform Image Quality Assessment
      const report = await CropDiseaseAI.validateImageQuality(file);
      setQualityReport(report);
    };
    reader.readAsDataURL(file);
  };

  // Handle Camera Capture
  const handleCameraCapture = async (dataUrl: string) => {
    setFileError(null);
    setImageDataUrl(dataUrl);

    // Convert dataUrl to File for quality checking
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'camera-leaf.jpg', { type: 'image/jpeg' });
      setImageFile(file);

      const report = await CropDiseaseAI.validateImageQuality(file);
      setQualityReport(report);
    } catch {
      // Basic fallback
      setQualityReport({
        isValid: true,
        score: 0.88,
        brightnessScore: 0.5,
        contrastScore: 0.6,
        warnings: [],
        dimensions: { width: 640, height: 480 },
      });
    }
  };

  const handleRemoveImage = () => {
    setImageDataUrl(null);
    setImageFile(null);
    setQualityReport(null);
    setFileError(null);
  };

  // STEP 3: Run AI Analysis
  const handleStartAnalysis = async () => {
    if (!selectedCrop || !imageDataUrl) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setStep(3);

    try {
      const result = await CropDiseaseAI.analyzeCrop(
        selectedCrop.id,
        selectedCrop.name,
        imageDataUrl,
        user?.id
      );

      setDiagnosisResult(result);
      setStep(4);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisError(err.message || 'AI diagnosis service encountered an unexpected error.');
      setStep(2);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset workflow
  const handleResetScanner = () => {
    setStep(1);
    setSelectedCrop(null);
    setImageDataUrl(null);
    setImageFile(null);
    setQualityReport(null);
    setDiagnosisResult(null);
    setFileError(null);
    setAnalysisError(null);
  };

  // Submit for expert consultation
  const handleSubmitConsultation = async () => {
    if (!diagnosisResult || !user) return;

    try {
      await offlineDB.saveConsultation({
        id: 'consult-' + Date.now(),
        farmerId: user.id,
        farmerName: user.fullName,
        cropId: diagnosisResult.cropId,
        cropName: diagnosisResult.cropName,
        diseaseId: diagnosisResult.diseaseId,
        scanId: diagnosisResult.id,
        leafImageUrl: diagnosisResult.imageUrl,
        farmerNotes: farmerNotes || 'Submitted for expert verification via KisanSaathi scanner.',
        district: user.district || 'Mandya',
        status: 'Submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setConsultSubmitted(true);
      setTimeout(() => {
        setShowConsultModal(false);
        setConsultSubmitted(false);
        setFarmerNotes('');
      }, 2000);
    } catch (err) {
      console.error('Failed to submit consultation:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Workflow Step Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#2E7D32]' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step >= 1 ? 'bg-[#2E7D32] text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              1
            </span>
            <span className="hidden sm:inline">Select Crop</span>
          </div>
          <div className="h-0.5 w-8 sm:w-16 bg-slate-200" />

          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#2E7D32]' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step >= 2 ? 'bg-[#2E7D32] text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              2
            </span>
            <span className="hidden sm:inline">Upload Leaf</span>
          </div>
          <div className="h-0.5 w-8 sm:w-16 bg-slate-200" />

          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#2E7D32]' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step >= 3 ? 'bg-[#2E7D32] text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              3
            </span>
            <span className="hidden sm:inline">AI Analysis</span>
          </div>
          <div className="h-0.5 w-8 sm:w-16 bg-slate-200" />

          <div className={`flex items-center gap-2 ${step === 4 ? 'text-[#2E7D32]' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step === 4 ? 'bg-[#2E7D32] text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              4
            </span>
            <span className="hidden sm:inline">Diagnosis</span>
          </div>
        </div>
      </div>

      {/* STEP 1: SELECT CROP */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Step 1: Select Your Crop
            </h2>
            <p className="text-xs text-slate-600">
              Choose the crop you want to scan from our Karnataka agronomy library.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 pt-2">
            {crops.map((crop) => (
              <button
                key={crop.id}
                onClick={() => handleSelectCrop(crop)}
                className="kisan-card overflow-hidden text-left hover:border-[#2E7D32] hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="h-32 w-full overflow-hidden relative">
                    <img
                      src={crop.imageUrl}
                      alt={crop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-[#2E7D32] px-2 py-0.5 rounded-md">
                      Select
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#2E7D32] transition-colors">
                      {crop.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 italic truncate">
                      {crop.scientificName}
                    </p>
                  </div>
                </div>
                <div className="p-3 pt-0 text-[10px] text-slate-400">
                  {crop.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: UPLOAD OR CAPTURE IMAGE */}
      {step === 2 && selectedCrop && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-bold text-[#2E7D32] uppercase tracking-wider">
                Crop Selected: {selectedCrop.name}
              </span>
              <h2 className="text-xl font-black text-slate-900">
                Step 2: Capture or Upload Leaf Image
              </h2>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
            >
              Change Crop
            </button>
          </div>

          {fileError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{fileError}</span>
            </div>
          )}

          {analysisError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{analysisError}</span>
            </div>
          )}

          {!imageDataUrl ? (
            /* Upload & Camera Buttons */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Live Camera */}
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="kisan-card p-8 border-2 border-dashed border-[#A5D6A7] hover:border-[#2E7D32] hover:bg-[#F1F8E9]/40 transition-all flex flex-col items-center justify-center text-center space-y-3 group"
              >
                <div className="w-16 h-16 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-[#2E7D32] transition-colors">
                    Take Photo with Camera
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Hold phone 10-15 cm from the leaf with diseased lesions in focus.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#2E7D32] bg-[#A5D6A7]/30 px-3 py-1 rounded-full">
                  Launch Camera
                </span>
              </button>

              {/* Option B: Gallery File Upload */}
              <label className="kisan-card p-8 border-2 border-dashed border-slate-300 hover:border-[#2E7D32] hover:bg-slate-50/70 transition-all flex flex-col items-center justify-center text-center space-y-3 cursor-pointer group">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-[#2E7D32] transition-colors">
                    Upload from Gallery
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Supports JPG, PNG, and WebP up to 10MB in size.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                  Choose File
                </span>
              </label>
            </div>
          ) : (
            /* Image Preview & Quality Check */
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center max-h-96">
                <img
                  src={imageDataUrl}
                  alt="Leaf to Analyze"
                  className="max-h-96 w-full object-contain"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={handleRemoveImage}
                    className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>

              {/* Image Quality Report */}
              <ImageQualityCheck
                report={qualityReport}
                fileSizeMb={imageFile ? imageFile.size / (1024 * 1024) : undefined}
              />

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleRemoveImage}
                  className="kisan-btn-outline text-xs justify-center flex-1"
                >
                  <RotateCw className="w-4 h-4 mr-1.5" />
                  Retake / Choose Another Photo
                </button>
                <button
                  onClick={handleStartAnalysis}
                  disabled={qualityReport ? !qualityReport.isValid : false}
                  className="kisan-btn-primary text-sm font-bold justify-center flex-1 py-3"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Leaf with AI
                </button>
              </div>
            </div>
          )}

          {/* Guidelines on Taking Clear Leaf Photos */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-600 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#2E7D32]" />
              Tips for Highest Diagnosis Accuracy:
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] list-disc list-inside">
              <li>Focus directly on the infected portion of the leaf.</li>
              <li>Capture in bright daytime daylight without casting shadows.</li>
              <li>Avoid blurry or shaking camera movements.</li>
              <li>Include only one leaf type matching the selected crop.</li>
            </ul>
          </div>

          {/* Camera Modal */}
          <CameraModal
            isOpen={isCameraOpen}
            onClose={() => setIsCameraOpen(false)}
            onCapture={handleCameraCapture}
          />
        </div>
      )}

      {/* STEP 3: ANALYZING STATE */}
      {step === 3 && (
        <div className="kisan-card p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-20 h-20 rounded-full border-4 border-[#A5D6A7]/40 border-t-[#2E7D32] animate-spin" />
            <Sparkles className="w-8 h-8 text-[#2E7D32] absolute inset-0 m-auto" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-slate-900">
              CropDiseaseAI Engine Running...
            </h3>
            <p className="text-xs text-slate-500">
              Validating leaf morphology, evaluating pathogen symptoms, and matching agricultural treatment database.
            </p>
          </div>
          <div className="text-[11px] font-semibold text-[#2E7D32] bg-[#F1F8E9] px-3 py-1 rounded-full inline-block">
            Analyzing {selectedCrop?.name} Leaf
          </div>
        </div>
      )}

      {/* STEP 4: DIAGNOSIS RESULTS */}
      {step === 4 && diagnosisResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Transparent Demo Mode Banner */}
          {diagnosisResult.diagnosisMode === 'demo_fallback' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-700" />
                TRANSPARENT DEMO MODE
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                {diagnosisResult.isDemoModeNote || 'A real hosted AI model is not connected in the environment variables (CROP_AI_API_URL). This result is generated by our transparent demonstration classifier based on authentic Karnataka agronomy databases.'}
              </p>
            </div>
          )}

          {/* Main Diagnosis Summary Card */}
          <div className="kisan-card overflow-hidden">
            <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-200/70">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img
                    src={diagnosisResult.imageUrl}
                    alt="Diagnosed Leaf"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 border-2 border-white shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D32] bg-[#F1F8E9] px-2.5 py-0.5 rounded-md">
                        {diagnosisResult.cropName}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                          diagnosisResult.severity === 'High'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : diagnosisResult.severity === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {diagnosisResult.severity} Severity
                      </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      {diagnosisResult.predictedDisease}
                    </h1>

                    {diagnosisResult.scientificName && (
                      <p className="text-xs text-slate-500 italic">
                        Pathogen: {diagnosisResult.scientificName}
                      </p>
                    )}

                    <div className="text-[11px] text-slate-400 mt-1">
                      Scanned on {new Date(diagnosisResult.timestamp).toLocaleString()} • Engine: {diagnosisResult.modelVersion}
                    </div>
                  </div>
                </div>

                {/* Confidence Level Badge */}
                <div className="sm:text-right shrink-0">
                  <div
                    className={`inline-flex flex-col items-center sm:items-end p-3 rounded-2xl border ${
                      diagnosisResult.confidence >= 85
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : diagnosisResult.confidence >= 70
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    <div className="text-2xl font-black">
                      {diagnosisResult.confidence}%
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider">
                      {diagnosisResult.confidence >= 85
                        ? 'High Confidence'
                        : diagnosisResult.confidence >= 70
                        ? 'Medium Confidence'
                        : 'Low / Uncertain'}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5 max-w-[130px] text-center sm:text-right">
                      {diagnosisResult.confidence >= 85
                        ? 'Confidence is indicative'
                        : 'Expert verification advised'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Action Box */}
            {diagnosisResult.recommendedAction && (
              <div className="p-4 bg-emerald-50/50 border-b border-slate-100 flex items-start gap-2.5 text-xs text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Agronomist Recommendation: </span>
                  {diagnosisResult.recommendedAction}
                </div>
              </div>
            )}

            {/* Symptoms & Causes Grid */}
            <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Symptoms */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-slate-600" />
                  Key Disease Symptoms
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {diagnosisResult.symptoms && diagnosisResult.symptoms.length > 0 ? (
                    diagnosisResult.symptoms.map((sym, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#2E7D32] font-bold">•</span>
                        <span>{sym}</span>
                      </li>
                    ))
                  ) : (
                    <li>No characteristic symptoms logged for this crop.</li>
                  )}
                </ul>
              </div>

              {/* Causes */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-slate-600" />
                  Possible Causes & Environmental Triggers
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {diagnosisResult.causes && diagnosisResult.causes.length > 0 ? (
                    diagnosisResult.causes.map((cause, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{cause}</span>
                      </li>
                    ))
                  ) : (
                    <li>Optimal environmental and nutritional conditions.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Treatment & Management Plan */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Recommended Agricultural Treatments
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Organic Treatment */}
              <div className="kisan-card p-5 border-l-4 border-l-[#2E7D32] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E7D32] bg-[#F1F8E9] px-2.5 py-0.5 rounded-md">
                    Organic / Biological Solution
                  </span>
                  <CheckCircle className="w-4 h-4 text-[#2E7D32]" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Natural Crop Protection</h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {diagnosisResult.organicTreatment || 'Maintain soil health with balanced organic amendments and beneficial bio-fertilizers.'}
                </p>
              </div>

              {/* Chemical Treatment (with strict dosage safety warning) */}
              <div className="kisan-card p-5 border-l-4 border-l-amber-500 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md">
                    Verified Chemical Treatment
                  </span>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Chemical Intervention (If Severe)</h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {diagnosisResult.chemicalTreatment || 'Consult your local agricultural expert for the correct dosage and application instructions.'}
                </p>
                <div className="p-2.5 rounded-xl bg-amber-50/80 text-[11px] text-amber-900 font-medium">
                  <strong>Dosage Notice:</strong> Consult your local agricultural officer or Raitha Samparka Kendra (RSK) for certified dosage before mixing.
                </div>
              </div>
            </div>

            {/* Preventive Practices */}
            {diagnosisResult.prevention && (
              <div className="kisan-card p-5 space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Long-term Cultural Prevention
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {diagnosisResult.prevention}
                </p>
              </div>
            )}
          </div>

          {/* Alternative Diagnoses if available */}
          {diagnosisResult.alternativePredictions && diagnosisResult.alternativePredictions.length > 0 && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold text-slate-700">Alternative Diagnostic Possibilities:</span>
              <div className="flex flex-wrap gap-2">
                {diagnosisResult.alternativePredictions.map((alt, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-medium">
                    {alt.name}: <strong className="text-slate-900">{alt.confidence}%</strong>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons: Expert Review, Find Shops, Scan Again */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setShowConsultModal(true)}
              className="kisan-btn-primary text-xs py-3 px-5 flex-1 min-w-[200px]"
            >
              <Stethoscope className="w-4 h-4 mr-2" />
              Request Expert Consultation
            </button>

            <button
              onClick={() => navigate('/shops')}
              className="kisan-btn-secondary text-xs py-3 px-5 flex-1 min-w-[200px]"
            >
              <Store className="w-4 h-4 mr-2" />
              Find Agricultural Shops
            </button>

            <button
              onClick={handleResetScanner}
              className="kisan-btn-outline text-xs py-3 px-4"
            >
              <RotateCw className="w-4 h-4 mr-1.5" />
              Scan Another Leaf
            </button>
          </div>

          {/* Expert Consultation Request Modal */}
          {showConsultModal && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-100">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-[#2E7D32]" />
                    <h3 className="font-bold text-base text-slate-900">
                      Submit for Expert Review
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowConsultModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                {consultSubmitted ? (
                  <div className="p-6 text-center space-y-2">
                    <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                    <h4 className="font-bold text-base text-slate-900">Consultation Request Submitted!</h4>
                    <p className="text-xs text-slate-600">
                      Assigned to plant pathologists at UAS Bangalore & Dharwad. You will be notified in your Consultations tab once reviewed.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-600">
                      Your leaf photo and AI diagnosis for <strong>{diagnosisResult.cropName} ({diagnosisResult.predictedDisease})</strong> will be routed to registered agricultural scientists.
                    </p>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Field Symptoms or Observations:
                      </label>
                      <textarea
                        rows={3}
                        value={farmerNotes}
                        onChange={(e) => setFarmerNotes(e.target.value)}
                        placeholder="e.g. Symptoms began 4 days ago after heavy rainfall. Lower leaves turning yellow with spots..."
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
                      />
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Location: <strong>{user?.district || 'Karnataka'}</strong>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setShowConsultModal(false)}
                        className="kisan-btn-outline text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitConsultation}
                        className="kisan-btn-primary text-xs"
                      >
                        Submit Request
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
