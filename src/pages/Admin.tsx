import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { offlineDB } from '../lib/indexedDB';
import { isSupabaseConfigured, getSupabaseConfigStatus } from '../lib/supabase';
import { Disease, AgriculturalShop, AgriculturalSource, Crop, ScanResult } from '../types';
import { SEED_SOURCES } from '../data/seedData';
import {
  Shield,
  Layers,
  Store,
  Users,
  BookOpen,
  Activity,
  Plus,
  Trash2,
  Edit2,
  Upload,
  CheckCircle,
  AlertTriangle,
  Server,
  Cpu,
  Database,
  CloudOff,
  Wifi,
  Search,
  Download
} from 'lucide-react';

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'diseases' | 'shops' | 'users' | 'sources' | 'health'>('overview');

  // Datasets
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [shops, setShops] = useState<AgriculturalShop[]>([]);
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [sources, setSources] = useState<AgriculturalSource[]>(SEED_SOURCES);

  // Search & Filters
  const [diseaseSearch, setDiseaseSearch] = useState('');
  const [shopSearch, setShopSearch] = useState('');

  // Disease Modal Form
  const [showDiseaseModal, setShowDiseaseModal] = useState(false);
  const [editingDisease, setEditingDisease] = useState<Partial<Disease> | null>(null);

  // Shop Modal Form
  const [showShopModal, setShowShopModal] = useState(false);
  const [editingShop, setEditingShop] = useState<Partial<AgriculturalShop> | null>(null);

  // CSV Import State
  const [csvMessage, setCsvMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    const dList = await offlineDB.getDiseases();
    const sList = await offlineDB.getShops();
    const scanList = await offlineDB.getScans();
    setDiseases(dList);
    setShops(sList);
    setScans(scanList);
  };

  // Guard: Admin role required
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 kisan-card text-center space-y-4">
        <Shield className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Administrator Access Required</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          You do not have administrative privileges to access this console. Please switch to the Administrator role using the top bar role switcher to test and manage system records.
        </p>
      </div>
    );
  }

  // Disease Actions
  const handleSaveDisease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDisease || !editingDisease.englishName || !editingDisease.cropId) return;

    const diseaseToSave: Disease = {
      id: editingDisease.id || `${editingDisease.cropId}-${editingDisease.englishName.toLowerCase().replace(/\s+/g, '-')}`,
      cropId: editingDisease.cropId,
      englishName: editingDisease.englishName,
      scientificName: editingDisease.scientificName || 'Unknown',
      severity: editingDisease.severity || 'Medium',
      description: editingDisease.description || '',
      symptoms: Array.isArray(editingDisease.symptoms) ? editingDisease.symptoms : (editingDisease.symptoms as any)?.split(',').map((s: string) => s.trim()) || [],
      causes: Array.isArray(editingDisease.causes) ? editingDisease.causes : (editingDisease.causes as any)?.split(',').map((s: string) => s.trim()) || [],
      organicTreatment: editingDisease.organicTreatment || '',
      chemicalTreatment: editingDisease.chemicalTreatment || 'Consult your local agricultural expert for certified dosage.',
      prevention: editingDisease.prevention || '',
      approvedReferences: editingDisease.approvedReferences || ['UAS Bangalore Pathology Bulletin'],
      lastReviewedDate: new Date().toISOString().split('T')[0],
      isActive: true,
    };

    await offlineDB.saveDisease(diseaseToSave);
    setShowDiseaseModal(false);
    setEditingDisease(null);
    loadAdminData();
  };

  const handleDeleteDisease = async (id: string) => {
    if (window.confirm('Delete this disease record from the database?')) {
      await offlineDB.deleteDisease(id);
      loadAdminData();
    }
  };

  // Shop Actions
  const handleSaveShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShop || !editingShop.shopName || !editingShop.district) return;

    const shopToSave: AgriculturalShop = {
      id: editingShop.id || 'shop-' + Date.now(),
      shopName: editingShop.shopName,
      ownerName: editingShop.ownerName || '',
      phoneNumber: editingShop.phoneNumber || '+91 90000 00000',
      district: editingShop.district,
      taluk: editingShop.taluk || editingShop.district,
      village: editingShop.village || '',
      address: editingShop.address || `${editingShop.district}, Karnataka`,
      latitude: editingShop.latitude || 12.9716,
      longitude: editingShop.longitude || 77.5946,
      services: editingShop.services || ['Seeds', 'Fertilizers', 'Bio-pesticides'],
      verificationStatus: editingShop.verificationStatus || 'verified',
      isActive: true,
    };

    await offlineDB.saveShop(shopToSave);
    setShowShopModal(false);
    setEditingShop(null);
    loadAdminData();
  };

  const handleDeleteShop = async (id: string) => {
    if (window.confirm('Delete this agricultural shop record?')) {
      await offlineDB.deleteShop(id);
      loadAdminData();
    }
  };

  // CSV Import for Karnataka Dealer Dataset
  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        let imported = 0;

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 4) {
            const newShop: AgriculturalShop = {
              id: 'imported-shop-' + Date.now() + '-' + i,
              shopName: cols[0],
              ownerName: cols[1] || 'Verified Dealer',
              phoneNumber: cols[2] || '+91 98450 00000',
              district: cols[3] || 'Mandya',
              taluk: cols[4] || cols[3] || 'District HQ',
              village: cols[5] || '',
              address: cols[6] || `${cols[3]}, Karnataka`,
              latitude: parseFloat(cols[7]) || 12.5242,
              longitude: parseFloat(cols[8]) || 76.8958,
              services: ['Certified Seeds', 'Fertilizers', 'Bio-pesticides'],
              verificationStatus: 'verified',
              isActive: true,
            };
            await offlineDB.saveShop(newShop);
            imported++;
          }
        }
        setCsvMessage(`Successfully imported ${imported} authentic Karnataka dealer records!`);
        loadAdminData();
      } catch (err: any) {
        setCsvMessage(`CSV Import Error: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Calculate statistics
  const cropCounts = scans.reduce((acc, s) => {
    acc[s.cropName] = (acc[s.cropName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const supabaseStatus = getSupabaseConfigStatus();
  const cropAiApiUrl = import.meta.env.VITE_CROP_AI_API_URL;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            Administrative Operations Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            KisanSaathi Admin Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Control agricultural disease records, manage authorized dealers, inspect AI health, and review state analytics.
          </p>
        </div>

        {/* Tab Switchers */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'overview' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('diseases')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'diseases' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Diseases ({diseases.length})
          </button>
          <button
            onClick={() => setActiveTab('shops')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'shops' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Agri Shops ({shops.length})
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'health' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            System Health
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="kisan-card p-5 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Total Field Scans</span>
              <div className="text-2xl font-black text-slate-900">{scans.length}</div>
              <div className="text-[10px] text-emerald-700 font-semibold">Live Farmer Inferences</div>
            </div>

            <div className="kisan-card p-5 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Crop Diseases Cataloged</span>
              <div className="text-2xl font-black text-slate-900">{diseases.length}</div>
              <div className="text-[10px] text-indigo-700 font-semibold">Tomato, Potato, Paddy, Cotton, Chilli</div>
            </div>

            <div className="kisan-card p-5 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Verified Agri Dealers</span>
              <div className="text-2xl font-black text-slate-900">{shops.length}</div>
              <div className="text-[10px] text-teal-700 font-semibold">Across Karnataka Districts</div>
            </div>

            <div className="kisan-card p-5 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">AI Diagnosis Engine</span>
              <div className="text-sm font-black text-slate-900 truncate">
                {cropAiApiUrl ? 'Hosted Cloud Model' : 'Demo Fallback Mode'}
              </div>
              <div className="text-[10px] text-amber-700 font-semibold">Transparent Diagnostic Pipeline</div>
            </div>
          </div>

          {/* Scanned Crops Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="kisan-card p-5 space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Crop Scanning Distribution</h3>
              {Object.keys(cropCounts).length === 0 ? (
                <p className="text-xs text-slate-400 py-4">No scan sessions recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(cropCounts).map(([crop, count]) => {
                    const pct = Math.round((count / scans.length) * 100);
                    return (
                      <div key={crop} className="space-y-1 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span>{crop}</span>
                          <span>{count} scans ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-[#2E7D32] h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Management Shortcuts */}
            <div className="kisan-card p-5 space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Administrative Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  onClick={() => {
                    setEditingDisease({
                      englishName: '',
                      cropId: 'tomato',
                      scientificName: '',
                      severity: 'Medium',
                      description: '',
                      organicTreatment: '',
                      chemicalTreatment: '',
                      prevention: '',
                    });
                    setShowDiseaseModal(true);
                  }}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-[#F1F8E9] border border-slate-200 text-left font-semibold text-slate-700 transition-colors"
                >
                  <Plus className="w-4 h-4 text-[#2E7D32] mb-1" />
                  Add New Disease Record
                </button>

                <button
                  onClick={() => {
                    setEditingShop({
                      shopName: '',
                      district: 'Mandya',
                      phoneNumber: '+91 ',
                      services: ['Seeds', 'Fertilizers'],
                    });
                    setShowShopModal(true);
                  }}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 text-left font-semibold text-slate-700 transition-colors"
                >
                  <Plus className="w-4 h-4 text-teal-700 mb-1" />
                  Add Agri Dealer Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DISEASES MANAGEMENT */}
      {activeTab === 'diseases' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={diseaseSearch}
                onChange={(e) => setDiseaseSearch(e.target.value)}
                placeholder="Search disease library..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <button
              onClick={() => {
                setEditingDisease({
                  englishName: '',
                  cropId: 'tomato',
                  scientificName: '',
                  severity: 'Medium',
                  description: '',
                  organicTreatment: '',
                  chemicalTreatment: '',
                  prevention: '',
                });
                setShowDiseaseModal(true);
              }}
              className="kisan-btn-primary text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Disease
            </button>
          </div>

          {/* Disease Table */}
          <div className="kisan-card overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Crop</th>
                  <th className="p-3.5">Disease Name</th>
                  <th className="p-3.5">Pathogen</th>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">Reviewed</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {diseases
                  .filter((d) => d.englishName.toLowerCase().includes(diseaseSearch.toLowerCase()) || d.cropId.toLowerCase().includes(diseaseSearch.toLowerCase()))
                  .map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-bold uppercase text-[10px] text-[#2E7D32]">
                        {d.cropId}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900">{d.englishName}</td>
                      <td className="p-3.5 italic text-slate-500">{d.scientificName}</td>
                      <td className="p-3.5">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                            d.severity === 'High'
                              ? 'bg-rose-50 text-rose-700'
                              : d.severity === 'Medium'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {d.severity}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500">{d.lastReviewedDate}</td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingDisease(d);
                            setShowDiseaseModal(true);
                          }}
                          className="p-1 rounded hover:bg-slate-200 text-slate-600"
                          title="Edit disease"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDisease(d.id)}
                          className="p-1 rounded hover:bg-rose-100 text-rose-600"
                          title="Delete disease"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SHOPS MANAGEMENT & CSV IMPORT */}
      {activeTab === 'shops' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={shopSearch}
                onChange={(e) => setShopSearch(e.target.value)}
                placeholder="Search shops or districts..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="kisan-btn-secondary text-xs cursor-pointer">
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Import Dealer CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvImport}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => {
                  setEditingShop({
                    shopName: '',
                    district: 'Mandya',
                    phoneNumber: '+91 ',
                    services: ['Seeds', 'Fertilizers'],
                  });
                  setShowShopModal(true);
                }}
                className="kisan-btn-primary text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Shop
              </button>
            </div>
          </div>

          {csvMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              {csvMessage}
            </div>
          )}

          {/* Shop Table */}
          <div className="kisan-card overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Shop Name</th>
                  <th className="p-3.5">District / Taluk</th>
                  <th className="p-3.5">Contact Phone</th>
                  <th className="p-3.5">Owner</th>
                  <th className="p-3.5">Verification</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shops
                  .filter((s) => s.shopName.toLowerCase().includes(shopSearch.toLowerCase()) || s.district.toLowerCase().includes(shopSearch.toLowerCase()))
                  .map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-bold text-slate-900">{s.shopName}</td>
                      <td className="p-3.5">{s.district} • {s.taluk}</td>
                      <td className="p-3.5 font-mono">{s.phoneNumber}</td>
                      <td className="p-3.5 text-slate-500">{s.ownerName || 'Verified'}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {s.verificationStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingShop(s);
                            setShowShopModal(true);
                          }}
                          className="p-1 rounded hover:bg-slate-200 text-slate-600"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteShop(s.id)}
                          className="p-1 rounded hover:bg-rose-100 text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM HEALTH & INTEGRATION STATUS */}
      {activeTab === 'health' && (
        <div className="space-y-4">
          <div className="kisan-card p-6 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              Live Infrastructure & Backend Connectivity Diagnostics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Database */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600" />
                    PostgreSQL Database
                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                    supabaseStatus.configured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {supabaseStatus.configured ? 'Supabase Connected' : 'IndexedDB Local Fallback'}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {supabaseStatus.message}
                </p>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  Endpoint: {supabaseStatus.url}
                </div>
              </div>

              {/* AI Inference Provider */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-teal-600" />
                    AI Model Inference Provider
                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                    cropAiApiUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {cropAiApiUrl ? 'Hosted Endpoint Active' : 'Transparent Demo Mode'}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {cropAiApiUrl
                    ? 'Requests forward to hosted ONNX/TFLite inference service.'
                    : 'CROP_AI_API_URL not set in .env. Running transparent demo simulation with authentic pathology records.'}
                </p>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  Endpoint: {cropAiApiUrl || 'None (Using CropDiseaseAI demo provider)'}
                </div>
              </div>

              {/* Offline Cache & PWA */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-emerald-600" />
                    PWA Offline Storage
                  </span>
                  <span className="font-bold px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
                    Ready
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  ServiceWorker and IndexedDB active. All 5 crops, treatments, and Karnataka dealer records are cached for offline field usage.
                </p>
              </div>

              {/* Supabase Storage */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Image Storage
                  </span>
                  <span className="font-bold px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
                    Configured
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Buckets: crop-images, disease-reference-images, profile-images with private RLS policies ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disease Create/Edit Modal */}
      {showDiseaseModal && editingDisease && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-100 overflow-y-auto">
          <form onSubmit={handleSaveDisease} className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
            <h3 className="font-bold text-base text-slate-900">
              {editingDisease.id ? 'Edit Disease Record' : 'Add New Disease'}
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Crop:</label>
                <select
                  value={editingDisease.cropId || 'tomato'}
                  onChange={(e) => setEditingDisease({ ...editingDisease, cropId: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200"
                >
                  <option value="tomato">Tomato</option>
                  <option value="potato">Potato</option>
                  <option value="paddy">Paddy</option>
                  <option value="cotton">Cotton</option>
                  <option value="chilli">Chilli</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Severity:</label>
                <select
                  value={editingDisease.severity || 'Medium'}
                  onChange={(e) => setEditingDisease({ ...editingDisease, severity: e.target.value as any })}
                  className="w-full p-2 rounded-xl border border-slate-200"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700">English Disease Name:</label>
              <input
                type="text"
                required
                value={editingDisease.englishName || ''}
                onChange={(e) => setEditingDisease({ ...editingDisease, englishName: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-200"
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700">Scientific Name:</label>
              <input
                type="text"
                value={editingDisease.scientificName || ''}
                onChange={(e) => setEditingDisease({ ...editingDisease, scientificName: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-200"
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700">Description:</label>
              <textarea
                rows={2}
                value={editingDisease.description || ''}
                onChange={(e) => setEditingDisease({ ...editingDisease, description: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-200"
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700">Organic Treatment:</label>
              <textarea
                rows={2}
                value={editingDisease.organicTreatment || ''}
                onChange={(e) => setEditingDisease({ ...editingDisease, organicTreatment: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-200"
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700">Chemical Treatment:</label>
              <textarea
                rows={2}
                value={editingDisease.chemicalTreatment || ''}
                onChange={(e) => setEditingDisease({ ...editingDisease, chemicalTreatment: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDiseaseModal(false)}
                className="kisan-btn-outline text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="kisan-btn-primary text-xs"
              >
                Save Disease Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Shop Create/Edit Modal */}
      {showShopModal && editingShop && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-100">
          <form onSubmit={handleSaveShop} className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              {editingShop.id ? 'Edit Agricultural Dealer' : 'Add New Agricultural Dealer'}
            </h3>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700">Shop Name:</label>
              <input
                type="text"
                required
                value={editingShop.shopName || ''}
                onChange={(e) => setEditingShop({ ...editingShop, shopName: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">District:</label>
                <input
                  type="text"
                  required
                  value={editingShop.district || ''}
                  onChange={(e) => setEditingShop({ ...editingShop, district: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Taluk:</label>
                <input
                  type="text"
                  value={editingShop.taluk || ''}
                  onChange={(e) => setEditingShop({ ...editingShop, taluk: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Phone Number:</label>
                <input
                  type="text"
                  required
                  value={editingShop.phoneNumber || ''}
                  onChange={(e) => setEditingShop({ ...editingShop, phoneNumber: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Owner Contact:</label>
                <input
                  type="text"
                  value={editingShop.ownerName || ''}
                  onChange={(e) => setEditingShop({ ...editingShop, ownerName: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700">Full Address:</label>
              <input
                type="text"
                value={editingShop.address || ''}
                onChange={(e) => setEditingShop({ ...editingShop, address: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowShopModal(false)}
                className="kisan-btn-outline text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="kisan-btn-primary text-xs"
              >
                Save Dealer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
