import React from 'react';
import { ShieldAlert, BookOpen, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-24 md:pb-12 mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800 text-sm">
          {/* Column 1: KisanSaathi Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <span className="w-7 h-7 rounded-lg bg-[#2E7D32] flex items-center justify-center text-white text-xs">
                KS
              </span>
              KISANSAATHI
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Offline AI Crop Disease Scanner designed for farmers across Karnataka.
              Empowering small and marginal growers with instant leaf diagnostics, organic treatments, and verified local agricultural inputs.
            </p>
            <div className="text-xs text-[#A5D6A7] font-medium">
              Tagline: Smarter Farming. Healthier Crops. Better Harvests.
            </div>
          </div>

          {/* Column 2: Approved Agricultural Sources */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#A5D6A7]" />
              Approved Scientific References
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• University of Agricultural Sciences (UAS), Bangalore</li>
              <li>• University of Agricultural Sciences (UAS), Dharwad & Raichur</li>
              <li>• ICAR - Indian Institute of Horticultural Research (IIHR)</li>
              <li>• ICAR - Central Potato Research Institute (CPRI)</li>
              <li>• Spices Board of India - Chilli Quality Advisory</li>
            </ul>
          </div>

          {/* Column 3: Agricultural Chemical Safety Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-amber-400 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Safety & Dosage Disclaimer
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              Chemical recommendations and dosages are for educational guidance under integrated pest management (IPM).
              <strong> Always consult your local taluk Raitha Samparka Kendra (RSK) or Agricultural Officer</strong> before applying scheduled pesticides.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} KisanSaathi Karnataka. Developed for farmers.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for sustainable agriculture.
          </p>
        </div>
      </div>
    </footer>
  );
};
