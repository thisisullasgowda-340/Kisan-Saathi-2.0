import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  ScanLine,
  BookOpen,
  Store,
  History,
  User,
  Shield,
  Stethoscope,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/', label: 'Home', icon: Home, exact: true },
    { to: '/scan', label: 'Scan', icon: ScanLine },
    { to: '/treatments', label: 'Treatments', icon: BookOpen },
    { to: '/shops', label: 'Shops', icon: Store },
    { to: '/history', label: 'History', icon: History },
  ];

  if (user?.role === 'expert') {
    navItems.push({ to: '/consultations', label: 'Reviews', icon: Stethoscope });
  } else {
    navItems.push({ to: '/consultations', label: 'Consult', icon: Stethoscope });
  }

  if (user?.role === 'admin') {
    navItems.push({ to: '/admin', label: 'Admin', icon: Shield });
  }

  navItems.push({ to: '/profile', label: 'Profile', icon: User });

  return (
    <>
      {/* Desktop Navigation Bar */}
      <nav className="hidden md:block bg-white border-b border-slate-200/60 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 py-1.5 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#2E7D32] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (PWA optimized) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-2 shadow-lg">
        <div className="grid grid-flow-col auto-cols-fr gap-1 items-center justify-around">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-semibold transition-colors ${
                    isActive
                      ? 'text-[#2E7D32]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`
                }
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    item.to === '/scan'
                      ? 'bg-[#2E7D32] text-white -mt-3 shadow-md p-2 border-2 border-white'
                      : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="mt-0.5">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
};
