import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConnectivity } from '../context/ConnectivityContext';
import { offlineDB } from '../lib/indexedDB';
import { Crop, ScanResult } from '../types';
import {
  Scan,
  Store,
  BookOpen,
  History,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  MapPin,
  Stethoscope,
  Info
} from 'lucide-react';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const { isOnline } = useConnectivity();
  const navigate = useNavigate();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [stats, setStats] = useState({
    totalScans: 0,
    healthyCount: 0,
    diseaseCount: 0,
    highConfidenceCount: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const loadedCrops = await offlineDB.getCrops();
    const loadedScans = await offlineDB.getScans();
    setCrops(loadedCrops);
    setScans(loadedScans);

    const healthy = loadedScans.filter((s) => s.predictedDisease.toLowerCase().includes('healthy')).length;
    const diseased = loadedScans.length - healthy;
    const highConf = loadedScans.filter((s) => s.confidence >= 85).length;

    setStats({
      totalScans: loadedScans.length,
      healthyCount: healthy,
      diseaseCount: diseased,
      highConfidenceCount: highConf,
    });
  };

  const handleCropSelect = (cropId: string) => {
    navigate(`/scan?crop=${cropId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Offline Status Alert if offline */}
      {!isOnline && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-amber-800 text-xs shadow-xs">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm">Offline Mode Active</div>
            <p className="mt-0.5 text-amber-700 leading-relaxed">
              You are currently offline. KisanSaathi is using local cached databases for crop pathology, treatments, shops, and scan history. You can still scan and browse guidance!
            </p>
          </div>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#2E7D32] via-[#1B5E20] to-[#0E3B13] text-white p-6 sm:p-10 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-[#A5D6A7] border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-[#A5D6A7]" />
            Offline AI Crop Protection System
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Namaskara, {user?.fullName || 'Farmer'}!
          </h1>

          <p className="text-sm sm:text-base text-slate-200 font-normal leading-relaxed">
            Scan your crop leaf for instant AI disease identification, certified organic treatments, and verified pesticide advice from Karnataka agricultural universities.
          </p>

          {/* District & Location Badge */}
          {user?.district && (
            <div className="flex items-center gap-2 text-xs text-white/90">
              <MapPin className="w-4 h-4 text-[#A5D6A7]" />
              <span>
                {user.village ? `${user.village}, ` : ''}
                {user.taluk ? `${user.taluk} Taluk, ` : ''}
                {user.district} District
              </span>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/scan"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-[#1B5E20] hover:bg-[#F1F8E9] font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <Scan className="w-5 h-5 text-[#2E7D32]" />
              Scan Crop Now
            </Link>

            <Link
              to="/shops"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-semibold text-sm border border-white/25 transition-all"
            >
              <Store className="w-4 h-4" />
              Find Agri Shops
            </Link>
          </div>
        </div>

        {/* Decorative Background Accent */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
          <Scan className="w-80 h-80" />
        </div>
      </div>

      {/* Key Diagnostic Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="kisan-card p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#2E7D32] flex items-center justify-center shrink-0">
            <Scan className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{stats.totalScans}</div>
            <div className="text-[11px] sm:text-xs font-medium text-slate-500">Total Leaf Scans</div>
          </div>
        </div>

        <div className="kisan-card p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{stats.healthyCount}</div>
            <div className="text-[11px] sm:text-xs font-medium text-slate-500">Healthy Leaf Scans</div>
          </div>
        </div>

        <div className="kisan-card p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{stats.diseaseCount}</div>
            <div className="text-[11px] sm:text-xs font-medium text-slate-500">Diseases Detected</div>
          </div>
        </div>

        <div className="kisan-card p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{stats.highConfidenceCount}</div>
            <div className="text-[11px] sm:text-xs font-medium text-slate-500">High Confidence (≥85%)</div>
          </div>
        </div>
      </div>

      {/* Step 1 Preview: Supported Crops Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Supported Karnataka Crops</h2>
            <p className="text-xs text-slate-500">Select any crop to begin instant leaf disease scanning</p>
          </div>
          <Link
            to="/scan"
            className="text-xs font-bold text-[#2E7D32] hover:text-[#1B5E20] flex items-center gap-1"
          >
            Start Scan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {crops.map((crop) => (
            <button
              key={crop.id}
              onClick={() => handleCropSelect(crop.id)}
              className="kisan-card group overflow-hidden text-left hover:border-[#2E7D32] hover:shadow-md transition-all active:scale-98"
            >
              <div className="h-28 sm:h-32 w-full overflow-hidden relative">
                <img
                  src={crop.imageUrl}
                  alt={crop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-[#2E7D32]/80 backdrop-blur-xs px-2 py-0.5 rounded-md">
                  Active
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
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/treatments"
          className="kisan-card p-5 hover:border-[#2E7D32] hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F1F8E9] text-[#2E7D32] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 group-hover:text-[#2E7D32] transition-colors">
              Treatment Guide
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore verified organic remedies, chemical options, and prevention guidelines for all 5 crops.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#2E7D32]">
            <span>Browse Library</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/shops"
          className="kisan-card p-5 hover:border-[#2E7D32] hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 group-hover:text-teal-700 transition-colors">
              Agricultural Shop Directory
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Locate verified fertilizer, seed, and bio-input dealers in Mandya, Kolar, Dharwad, and across Karnataka.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
            <span>Find Nearby Stores</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/consultations"
          className="kisan-card p-5 hover:border-[#2E7D32] hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-700 transition-colors">
              Expert Consultation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Need confirmation? Send your leaf image and symptoms directly to agricultural university scientists.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
            <span>Request Review</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Scans Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Recent Crop Diagnoses</h2>
            <p className="text-xs text-slate-500">Your latest offline and cloud-synced leaf scans</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-bold text-[#2E7D32] hover:text-[#1B5E20] flex items-center gap-1"
          >
            View All ({scans.length}) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {scans.length === 0 ? (
          <div className="kisan-card p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No scans recorded yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Scan your first tomato, potato, paddy, cotton, or chilli leaf to see AI diagnoses and treatment recommendations here.
            </p>
            <Link to="/scan" className="kisan-btn-primary text-xs">
              Take First Scan
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {scans.slice(0, 3).map((scan) => (
              <div key={scan.id} className="kisan-card p-4 space-y-3 flex flex-col justify-between">
                <div className="flex items-start gap-3">
                  <img
                    src={scan.imageUrl}
                    alt={scan.cropName}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32] bg-[#F1F8E9] px-2 py-0.5 rounded-md">
                      {scan.cropName}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 truncate mt-1">
                      {scan.predictedDisease}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>{new Date(scan.timestamp).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">{scan.confidence}% Confidence</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                      scan.severity === 'High'
                        ? 'bg-rose-50 text-rose-700'
                        : scan.severity === 'Medium'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {scan.severity} Severity
                  </span>

                  <Link
                    to={`/scan?resultId=${scan.id}`}
                    className="text-xs font-bold text-[#2E7D32] hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
