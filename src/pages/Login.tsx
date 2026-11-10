import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  Sprout,
  UserCheck,
  Stethoscope,
  Shield,
  ArrowRight,
  Sparkles,
  Lock,
  Mail
} from 'lucide-react';

export const Login: React.FC = () => {
  const { loginAsGuest, loginWithRole } = useAuth();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithRole(selectedRole, fullName || undefined);
    if (selectedRole === 'admin') navigate('/admin');
    else if (selectedRole === 'expert') navigate('/consultations');
    else navigate('/');
  };

  const handleQuickRoleLogin = (role: UserRole) => {
    loginWithRole(role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'expert') navigate('/consultations');
    else navigate('/');
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-3xl bg-[#2E7D32] flex items-center justify-center text-white mx-auto shadow-md">
          <Sprout className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Welcome to KISANSAATHI
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
          Offline AI Crop Disease Scanner for Farmers across Karnataka.
        </p>
      </div>

      {/* Instant 1-Click Role Logins (Ideal for Pair Programming & Testing) */}
      <div className="kisan-card p-5 space-y-3 bg-linear-to-b from-white to-[#F8FAF5] border-[#A5D6A7]/60 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B5E20]">
          <Sparkles className="w-4 h-4 text-[#2E7D32]" />
          Instant Role Tester (One-Click Access)
        </div>
        <p className="text-[11px] text-slate-500">
          Switch into any role immediately to inspect role-based workflows and permissions:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => handleQuickRoleLogin('farmer')}
            className="p-3 rounded-xl bg-white hover:bg-[#F1F8E9] border border-slate-200 hover:border-[#2E7D32] text-left transition-all group"
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 group-hover:text-[#2E7D32]">
              <UserCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
              Farmer
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Scan crops & shops</div>
          </button>

          <button
            onClick={() => handleQuickRoleLogin('expert')}
            className="p-3 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-600 text-left transition-all group"
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 group-hover:text-teal-700">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              Agri Expert
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Review farmer cases</div>
          </button>

          <button
            onClick={() => handleQuickRoleLogin('admin')}
            className="p-3 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-600 text-left transition-all group"
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 group-hover:text-indigo-700">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              Administrator
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Manage diseases & data</div>
          </button>
        </div>
      </div>

      {/* Guest Mode Quick Link */}
      <div className="text-center">
        <button
          onClick={handleGuestLogin}
          className="text-xs font-bold text-[#2E7D32] hover:text-[#1B5E20] hover:underline"
        >
          Or continue as a Guest Farmer without an account →
        </button>
      </div>

      {/* Standard Email Authentication Card */}
      <div className="kisan-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-800">
            {isSignUp ? 'Create KisanSaathi Account' : 'Sign In with Email'}
          </span>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-[#2E7D32] font-semibold hover:underline"
          >
            {isSignUp ? 'Existing user? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>

        <form onSubmit={handleCustomSubmit} className="space-y-3.5 text-xs">
          {/* Role selector for registration */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Selected Role:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('farmer')}
                className={`py-2 rounded-xl font-bold transition-colors ${
                  selectedRole === 'farmer'
                    ? 'bg-[#2E7D32] text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Farmer
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('expert')}
                className={`py-2 rounded-xl font-bold transition-colors ${
                  selectedRole === 'expert'
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Expert
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`py-2 rounded-xl font-bold transition-colors ${
                  selectedRole === 'admin'
                    ? 'bg-indigo-700 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {isSignUp && (
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Full Name:</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Gowda"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Email Address:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@kisansaathi.in"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Password:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full kisan-btn-primary py-2.5 font-bold text-xs mt-2"
          >
            {isSignUp ? 'Register & Enter' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
