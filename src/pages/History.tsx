import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { offlineDB } from '../lib/indexedDB';
import { ScanResult, Crop } from '../types';
import {
  History as HistoryIcon,
  Search,
  Trash2,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Filter,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const list = await offlineDB.getScans();
    const cList = await offlineDB.getCrops();
    setScans(list);
    setCrops(cList);
  };

  const handleDeleteScan = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this scan record?')) {
      await offlineDB.deleteScan(id);
      loadHistory();
    }
  };

  const handleClearAll = async () => {
    await offlineDB.clearScans();
    setShowClearConfirm(false);
    loadHistory();
  };

  const filteredScans = scans.filter((scan) => {
    const matchCrop = selectedCrop === 'all' || scan.cropId.toLowerCase() === selectedCrop.toLowerCase();
    const matchSearch =
      !searchQuery ||
      scan.predictedDisease.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.cropName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCrop && matchSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] uppercase tracking-wider">
            <HistoryIcon className="w-4 h-4" />
            Field Diagnostics Log
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Scan History
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            All your offline and synchronized crop disease diagnoses.
          </p>
        </div>

        {scans.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="kisan-btn-outline text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Clear All Scans
          </button>
        )}
      </div>

      {/* Clear All Confirmation Dialog */}
      {showClearConfirm && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-100">
          <div>
            <span className="font-bold">Permanently erase all scan history?</span>
            <p className="text-[11px] text-rose-700">This action will clear all saved leaf images and AI reports from this device.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold"
            >
              Confirm Delete All
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="kisan-card p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved scans by disease or crop..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <button
            onClick={() => setSelectedCrop('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              selectedCrop === 'all'
                ? 'bg-[#2E7D32] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Crops ({scans.length})
          </button>

          {crops.map((c) => {
            const count = scans.filter((s) => s.cropId.toLowerCase() === c.id.toLowerCase()).length;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCrop(c.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                  selectedCrop === c.id
                    ? 'bg-[#2E7D32] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Scans List */}
      <div className="space-y-3">
        {filteredScans.length === 0 ? (
          <div className="kisan-card p-12 text-center text-slate-500 text-xs space-y-3">
            <HistoryIcon className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800">No scans match your criteria</h3>
            <p className="max-w-sm mx-auto text-slate-500">
              Your previous leaf scans are stored securely on this device and synced whenever connected.
            </p>
            <button
              onClick={() => navigate('/scan')}
              className="kisan-btn-primary text-xs"
            >
              Scan a Crop Now
            </button>
          </div>
        ) : (
          filteredScans.map((scan) => (
            <div
              key={scan.id}
              onClick={() => navigate(`/scan?resultId=${scan.id}`)}
              className="kisan-card p-4 sm:p-5 hover:border-slate-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                <img
                  src={scan.imageUrl}
                  alt={scan.cropName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-xs"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32] bg-[#F1F8E9] px-2 py-0.5 rounded-md">
                      {scan.cropName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        scan.severity === 'High'
                          ? 'bg-rose-50 text-rose-700'
                          : scan.severity === 'Medium'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {scan.severity} Severity
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-[#2E7D32] transition-colors">
                    {scan.predictedDisease}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(scan.timestamp).toLocaleDateString()} at{' '}
                      {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">
                      {scan.confidence}% Confidence
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span className="text-xs font-bold text-[#2E7D32] group-hover:underline flex items-center gap-1">
                  View Full Report
                </span>
                <button
                  onClick={(e) => handleDeleteScan(scan.id, e)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete scan record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
