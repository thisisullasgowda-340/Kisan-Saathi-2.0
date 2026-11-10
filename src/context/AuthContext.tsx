import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginAsGuest: () => void;
  loginWithRole: (role: UserRole, name?: string) => void;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  deleteAccount: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const STORAGE_KEY = 'kisansaathi_current_user';

const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  farmer: {
    id: 'farmer-demo-001',
    email: 'farmer.mandya@kisansaathi.in',
    fullName: 'Ramesh Gowda',
    phoneNumber: '+91 98450 11223',
    district: 'Mandya',
    taluk: 'Pandavapura',
    village: 'Melukote',
    role: 'farmer',
    isGuest: false,
  },
  expert: {
    id: 'expert-demo-002',
    email: 'dr.shankar@uasbangalore.edu.in',
    fullName: 'Dr. C. Shankar (Plant Pathologist)',
    phoneNumber: '+91 94481 99887',
    district: 'Bengaluru Urban',
    taluk: 'Bengaluru North',
    village: 'Hessaraghatta',
    role: 'expert',
    isGuest: false,
  },
  admin: {
    id: 'admin-demo-003',
    email: 'admin@kisansaathi.gov.in',
    fullName: 'Agricultural Operations Admin',
    phoneNumber: '+91 99000 88877',
    district: 'Bengaluru Urban',
    taluk: 'Bengaluru Central',
    village: 'Vidhana Soudha',
    role: 'admin',
    isGuest: false,
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default to demo farmer for immediate usability
    return DEFAULT_USERS.farmer;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const loginAsGuest = () => {
    const guestUser: UserProfile = {
      id: 'guest-' + Date.now(),
      email: 'guest@kisansaathi.local',
      fullName: 'Guest Farmer',
      district: 'Mandya',
      role: 'farmer',
      isGuest: true,
    };
    setUser(guestUser);
  };

  const loginWithRole = (role: UserRole, customName?: string) => {
    const template = DEFAULT_USERS[role];
    const newUser: UserProfile = {
      ...template,
      fullName: customName || template.fullName,
    };
    setUser(newUser);
  };

  const switchRole = (role: UserRole) => {
    const template = DEFAULT_USERS[role];
    setUser(template);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signout:', err);
      }
    }
    setUser(null);
  };

  const deleteAccount = async () => {
    // Clear user data from local storage
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginAsGuest,
        loginWithRole,
        logout,
        updateProfile,
        deleteAccount,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
