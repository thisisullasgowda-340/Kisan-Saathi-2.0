import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { offlineDB } from '../lib/indexedDB';
import { KARNATAKA_DISTRICTS } from '../data/seedData';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Shield,
  Trash2,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  LogOut,
  Save
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [district, setDistrict] = useState(user?.district || 'Mandya');
  const [taluk, setTaluk] = useState(user?.taluk || '');
  const [village, setVillage] = useState(user?.village || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cacheClearSuccess, setCacheClearSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPhoneNumber(user.phoneNumber || '');
      setDistrict(user.district || 'Mandya');
      setTaluk(user.taluk || '');
      setVillage(user.village || '');
    }
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      phoneNumber,
      district,
      taluk,
      village,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClearCache = async () => {
    await offlineDB.clearScans();
    setCacheClearSuccess(true);
    setTimeout(() => setCacheClearSuccess(false), 2500);
  };

  const handleConfirmDeleteAccount = async () => {
    await deleteAccount();
    await offlineDB.clearScans();
    setShowDeleteModal(false);
    navigate('/');
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 kisan-card text-center space-y-4">
        <User className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Sign in to View Profile</h2>
        <p className="text-xs text-slate-500">
          Access your farm location settings, offline database preferences, and scan history.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="kisan-btn-primary text-xs"
        >
          Sign In / Guest Access
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] uppercase tracking-wider">
          <User className="w-4 h-4" />
          Account & Farm Settings
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          User Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Manage your personal details, regional agricultural jurisdiction, and offline privacy controls.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          Profile updated successfully!
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="kisan-card p-6 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2E7D32] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {fullName.substring(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900">{fullName}</h2>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D32] bg-[#F1F8E9] px-2 py-0.5 rounded-md">
                Role: {user.role} {user.isGuest ? '(Guest Mode)' : ''}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="kisan-btn-outline text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Full Name:</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Phone Number:</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 98450 12345"
              className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Karnataka Revenue District:</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
            >
              {KARNATAKA_DISTRICTS.filter((d) => d !== 'All Districts').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Taluk:</label>
            <input
              type="text"
              value={taluk}
              onChange={(e) => setTaluk(e.target.value)}
              placeholder="e.g. Pandavapura, Kolar, Byadgi"
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-semibold text-slate-700">Village / Hobli (Optional):</label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder="e.g. Melukote, Tamaka, Navalgund"
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="kisan-btn-primary text-xs py-2.5 px-6 font-bold"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Save Profile Changes
          </button>
        </div>
      </form>

      {/* Offline Storage & Privacy Controls */}
      <div className="kisan-card p-6 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-[#2E7D32]" />
          Offline Device Storage & Privacy Control
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          KisanSaathi stores scan history, diagnostic photos, and Karnataka seed databases locally in IndexedDB to support field use without network signal.
        </p>

        {cacheClearSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs">
            Offline scan cache successfully cleared from this device.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleClearCache}
            className="kisan-btn-outline text-xs text-slate-700"
          >
            Clear Offline Scan Cache
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="kisan-btn-outline text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Erase All Account Data
          </button>
        </div>
      </div>

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">
                Permanently Delete Account & Data?
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This action complies with privacy standards. It will permanently remove your profile, locally cached leaf scans, and consultation history from this device.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="kisan-btn-outline text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAccount}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Yes, Delete My Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
