import React, { useState, useEffect } from 'react';
import { offlineDB } from '../lib/indexedDB';
import { Disease, Crop } from '../types';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Shield,
  Calendar,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export const Treatments: React.FC = () => {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const dList = await offlineDB.getDiseases();
    const cList = await offlineDB.getCrops();
    setDiseases(dList);
    setCrops(cList);
  };

  const filteredDiseases = diseases.filter((d) => {
    const matchesCrop = selectedCrop === 'all' || d.cropId.toLowerCase() === selectedCrop.toLowerCase();
    const matchesSeverity = selectedSeverity === 'all' || d.severity === selectedSeverity;
    const matchesSearch =
      !searchQuery ||
      d.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.symptoms.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.organicTreatment.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCrop && matchesSeverity && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          Karnataka Crop Pathology Guide
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Treatment & Disease Library
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
          Verified organic remedies, certified chemical controls, and cultural prevention methods for Tomato, Potato, Paddy, Cotton, and Chilli.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="kisan-card p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search diseases, symptoms, or organic treatments (e.g. Blight, Trichoderma, Neem)..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Crop Filter Pills */}
          <button
            onClick={() => setSelectedCrop('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              selectedCrop === 'all'
                ? 'bg-[#2E7D32] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Crops
          </button>
          {crops.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCrop(c.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                selectedCrop === c.id
                  ? 'bg-[#2E7D32] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}

          {/* Severity Dropdown */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="text-xs p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700"
            >
              <option value="all">All Severities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low / Healthy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Disease Cards List */}
      <div className="space-y-4">
        {filteredDiseases.length === 0 ? (
          <div className="kisan-card p-10 text-center space-y-2 text-slate-500 text-xs">
            <p>No diseases matched your search criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCrop('all');
                setSelectedSeverity('all');
              }}
              className="text-[#2E7D32] font-bold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredDiseases.map((disease) => {
            const isExpanded = expandedId === disease.id;
            return (
              <div
                key={disease.id}
                className="kisan-card overflow-hidden hover:border-slate-300 transition-all"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : disease.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32] bg-[#F1F8E9] px-2 py-0.5 rounded-md">
                        {disease.cropId}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          disease.severity === 'High'
                            ? 'bg-rose-50 text-rose-700'
                            : disease.severity === 'Medium'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {disease.severity} Severity
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {disease.englishName}
                    </h3>

                    <p className="text-xs text-slate-500 italic">
                      {disease.scientificName}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      {isExpanded ? 'Collapse' : 'Details'}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {disease.description}
                    </p>

                    {/* Symptoms */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-900">Primary Symptoms:</h4>
                      <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                        {disease.symptoms.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Organic & Chemical Treatments Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 space-y-1.5">
                        <div className="text-[11px] font-bold text-[#1B5E20] flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-[#2E7D32]" />
                          Organic & Biological Recommendation
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {disease.organicTreatment}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 space-y-1.5">
                        <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Verified Chemical Treatment
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {disease.chemicalTreatment}
                        </p>
                        <div className="text-[10px] text-amber-800 font-semibold mt-1">
                          Always check with local agricultural officer for certified dosage.
                        </div>
                      </div>
                    </div>

                    {/* Prevention */}
                    <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700 space-y-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-[#2E7D32]" />
                        Preventive Cultural Practices:
                      </div>
                      <p>{disease.prevention}</p>
                    </div>

                    {/* References & Review Date */}
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      <div>
                        References: {disease.approvedReferences.join('; ')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Reviewed: {disease.lastReviewedDate}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
