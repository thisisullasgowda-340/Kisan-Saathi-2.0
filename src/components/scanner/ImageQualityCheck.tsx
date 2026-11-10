import React from 'react';
import { ImageQualityReport } from '../../services/cropDiseaseAI';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface Props {
  report: ImageQualityReport | null;
  fileSizeMb?: number;
}

export const ImageQualityCheck: React.FC<Props> = ({ report, fileSizeMb }) => {
  if (!report) return null;

  const scorePercentage = Math.round(report.score * 100);
  const isHighQuality = report.isValid && scorePercentage >= 75;

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isHighQuality ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          )}
          <span className="text-xs font-bold text-slate-800">
            Image Quality Assessment
          </span>
        </div>
        <span
          className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
            isHighQuality
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {scorePercentage}% Clarity
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isHighQuality ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
          style={{ width: `${scorePercentage}%` }}
        />
      </div>

      {/* Details & Warnings */}
      <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
        <span>Resolution: {report.dimensions.width} × {report.dimensions.height}px</span>
        {fileSizeMb && <span>Size: {fileSizeMb.toFixed(2)} MB (Max 10MB)</span>}
        <span>Lighting: {Math.round(report.brightnessScore * 100)}%</span>
      </div>

      {report.warnings.length > 0 && (
        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-800 space-y-1">
          {report.warnings.map((warn, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
