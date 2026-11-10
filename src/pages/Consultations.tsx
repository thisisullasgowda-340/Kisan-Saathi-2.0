import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { offlineDB } from '../lib/indexedDB';
import { ExpertConsultation, ConsultationStatus } from '../types';
import {
  Stethoscope,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  User,
  MapPin,
  Calendar,
  Send,
  Eye,
  ShieldAlert
} from 'lucide-react';

export const Consultations: React.FC = () => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<ExpertConsultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<ExpertConsultation | null>(null);

  // Expert response form states
  const [observations, setObservations] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [newStatus, setNewStatus] = useState<ConsultationStatus>('Response Provided');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  useEffect(() => {
    loadConsultations();
  }, [user]);

  const loadConsultations = async () => {
    const list = await offlineDB.getConsultations();
    setConsultations(list);
    if (list.length > 0 && !selectedConsultation) {
      setSelectedConsultation(list[0]);
    }
  };

  const handleSelectConsultation = (item: ExpertConsultation) => {
    setSelectedConsultation(item);
    setObservations(item.expertObservations || '');
    setRecommendations(item.recommendedTreatment || '');
    setNewStatus(item.status);
  };

  const handleSaveExpertResponse = async () => {
    if (!selectedConsultation || !user) return;
    setIsSubmittingResponse(true);

    const updated: ExpertConsultation = {
      ...selectedConsultation,
      expertObservations: observations,
      recommendedTreatment: recommendations,
      status: newStatus,
      assignedExpertId: user.id,
      expertName: user.fullName,
      respondedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await offlineDB.saveConsultation(updated);
    setSelectedConsultation(updated);
    setIsSubmittingResponse(false);
    loadConsultations();
  };

  const isExpertUser = user?.role === 'expert' || user?.role === 'admin';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider">
          <Stethoscope className="w-4 h-4" />
          Plant Pathology Tele-Advisory
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {isExpertUser ? 'Expert Consultation Workbench' : 'My Expert Consultations'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
          {isExpertUser
            ? 'Review farmer-submitted crop pathology requests, inspect high-resolution leaf photos, and issue certified agronomic observations.'
            : 'Track review statuses and certified treatment recommendations from plant pathologists.'}
        </p>
      </div>

      {consultations.length === 0 ? (
        <div className="kisan-card p-12 text-center text-slate-500 text-xs space-y-3">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-slate-800">No consultation requests recorded</h3>
          <p className="max-w-md mx-auto text-slate-500 leading-relaxed">
            When you scan a leaf with uncertain or high severity symptoms, you can submit it directly to plant pathologists from the Scan Results page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: List of Consultations */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isExpertUser ? 'Queue / Cases' : 'Submitted Cases'} ({consultations.length})
            </h3>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {consultations.map((item) => {
                const isSelected = selectedConsultation?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectConsultation(item)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/70 border-teal-500 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1.5">
                      <span className="text-[10px] font-bold uppercase text-[#2E7D32]">
                        {item.cropName || item.cropId}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          item.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Response Provided'
                            ? 'bg-teal-100 text-teal-800'
                            : item.status === 'Under Review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-slate-900 truncate">
                      {item.farmerNotes}
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{item.district}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Consultation Details & Response */}
          {selectedConsultation && (
            <div className="lg:col-span-2 kisan-card p-5 sm:p-6 space-y-6">
              {/* Header details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32] bg-[#F1F8E9] px-2 py-0.5 rounded-md">
                    Case #{selectedConsultation.id.substring(0, 12)}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedConsultation.cropName} Leaf Review
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Farmer: {selectedConsultation.farmerName || 'Registered Grower'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {selectedConsultation.district} District
                    </span>
                  </div>
                </div>

                <div className="self-start sm:self-auto">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      selectedConsultation.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedConsultation.status === 'Response Provided'
                        ? 'bg-teal-100 text-teal-800'
                        : selectedConsultation.status === 'Under Review'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {selectedConsultation.status}
                  </span>
                </div>
              </div>

              {/* Farmer Leaf Image and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Farmer Submitted Leaf Photo
                  </label>
                  <img
                    src={selectedConsultation.leafImageUrl}
                    alt="Farmer Leaf"
                    className="w-full h-48 object-cover rounded-2xl border border-slate-200"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Reported Symptoms & Notes
                    </label>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800 leading-relaxed min-h-[90px]">
                      {selectedConsultation.farmerNotes}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <div>Submitted: {new Date(selectedConsultation.createdAt).toLocaleString()}</div>
                    {selectedConsultation.respondedAt && (
                      <div>Responded: {new Date(selectedConsultation.respondedAt).toLocaleString()}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expert Observations & Guidance View / Edit */}
              {isExpertUser ? (
                /* Expert Form for Providing Guidance */
                <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200/60 space-y-4">
                  <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                    <Stethoscope className="w-4 h-4 text-teal-700" />
                    Provide Agricultural Scientist Observations & Prescription
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Expert Diagnostic Observations:
                    </label>
                    <textarea
                      rows={3}
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="e.g. Lesions confirm early blight with typical concentric zonation. Defoliation is beginning on lower leaves..."
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-teal-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Verified Treatment Guidance:
                    </label>
                    <textarea
                      rows={3}
                      value={recommendations}
                      onChange={(e) => setRecommendations(e.target.value)}
                      placeholder="e.g. Recommend immediate spray of Mancozeb 75% WP @ 2.5 g/L. Stop furrow flooding and remove fallen leaves..."
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-teal-600"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700">Status:</span>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as ConsultationStatus)}
                        className="text-xs p-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Response Provided">Response Provided</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <button
                      onClick={handleSaveExpertResponse}
                      disabled={isSubmittingResponse}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Save & Send Response
                    </button>
                  </div>
                </div>
              ) : (
                /* Farmer View of Expert Response */
                <div className="space-y-4">
                  {selectedConsultation.expertObservations ? (
                    <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-teal-700" />
                          Expert Review by {selectedConsultation.expertName || 'Agricultural University Scientist'}
                        </span>
                        <span className="text-[10px] text-teal-800 font-medium">
                          Verified Advisory
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-600 uppercase">
                          Scientist Observations:
                        </div>
                        <p className="text-xs text-slate-800 leading-relaxed">
                          {selectedConsultation.expertObservations}
                        </p>
                      </div>

                      {selectedConsultation.recommendedTreatment && (
                        <div className="space-y-1 pt-2 border-t border-teal-200/60">
                          <div className="text-[11px] font-bold text-slate-600 uppercase">
                            Prescribed Treatment:
                          </div>
                          <p className="text-xs text-slate-800 leading-relaxed font-medium">
                            {selectedConsultation.recommendedTreatment}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Your case is currently pending review by an Agricultural Scientist. Check back shortly for verified guidance.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
