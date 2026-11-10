import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useConnectivity } from '../../context/ConnectivityContext';
import { UserRole } from '../../types';
import {
  Sprout,
  Wifi,
  WifiOff,
  UserCheck,
  Shield,
  Stethoscope,
  ChevronDown,
  Bell,
  LogOut,
  Sparkles
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, switchRole, logout } = useAuth();
  const { isOnline } = useConnectivity();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setShowRoleMenu(false);
    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'expert') {
      navigate('/consultations');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D32] flex items-center justify-center text-white shadow-sm group-hover:bg-[#1B5E20] transition-colors">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-[#2E7D32]">
                  KISANSAATHI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-[#A5D6A7]/30 text-[#1B5E20] border border-[#A5D6A7]/50">
                  Karnataka
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                Smarter Farming. Healthier Crops. Better Harvests.
              </p>
            </div>
          </Link>

          {/* Right Controls: Connectivity Badge, Role Switcher, Notifications, User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Connectivity Badge */}
            <div
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
              title={isOnline ? 'Connected to internet' : 'Offline Mode: Local database active'}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span className="hidden md:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>Offline Ready</span>
                </>
              )}
            </div>

            {/* Quick Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/80 hover:bg-slate-100 text-slate-700 transition-colors"
                title="Switch role to test Farmer, Expert, or Admin features"
              >
                {user?.role === 'admin' ? (
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                ) : user?.role === 'expert' ? (
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
                )}
                <span className="capitalize">{user?.role || 'Guest'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Role Testing Mode
                  </div>
                  <button
                    onClick={() => handleRoleSelect('farmer')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left hover:bg-slate-50 transition-colors ${
                      user?.role === 'farmer' ? 'text-[#2E7D32] bg-[#F1F8E9] font-bold' : 'text-slate-700'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-[#2E7D32]" />
                    <div>
                      <div>Farmer Account</div>
                      <div className="text-[10px] text-slate-400 font-normal">Scan crops, find shops, request advice</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('expert')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left hover:bg-slate-50 transition-colors ${
                      user?.role === 'expert' ? 'text-teal-700 bg-teal-50 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <div>
                      <div>Agricultural Expert</div>
                      <div className="text-[10px] text-slate-400 font-normal">Review farmer scans & give treatments</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('admin')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left hover:bg-slate-50 transition-colors ${
                      user?.role === 'admin' ? 'text-indigo-700 bg-indigo-50 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div>Administrator</div>
                      <div className="text-[10px] text-slate-400 font-normal">Manage diseases, shops, CSV import & stats</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* In-app Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2E7D32]" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-xl border border-slate-200 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">In-App Notifications</span>
                    <span className="text-[10px] text-[#2E7D32] bg-[#F1F8E9] px-2 py-0.5 rounded-full font-semibold">
                      Live
                    </span>
                  </div>
                  <div className="py-2 space-y-2.5">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />
                        Offline AI Ready
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Tomato, Potato, Paddy, Cotton & Chilli disease libraries cached for field access.
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                        Agricultural Expert Available
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Submit uncertain scan diagnoses for verified review by registered plant pathologists.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar / Logout */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="w-8 h-8 rounded-full bg-[#2E7D32]/10 border border-[#2E7D32]/30 flex items-center justify-center text-xs font-bold text-[#2E7D32]"
                  title="View Profile"
                >
                  {user.fullName.substring(0, 1)}
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors hidden sm:block"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs font-bold text-white bg-[#2E7D32] hover:bg-[#1B5E20] px-3 py-1.5 rounded-xl transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
