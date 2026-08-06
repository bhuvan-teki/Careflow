import React from 'react';
import { Building2, Compass, CheckCircle2 } from 'lucide-react';

interface CardDepartmentProps {
  department: string;
  confidence: number;
  reason: string;
}

export const CardDepartment: React.FC<CardDepartmentProps> = ({
  department = 'General Physician',
  confidence = 92,
  reason = 'Symptom profile matches primary outpatient care criteria.'
}) => {
  return (
    <div className="bg-[#111622]/90 border border-white/10 rounded-2xl p-5 shadow-xl transition-all hover:border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              CARD 3 • Recommended Department
            </h3>
            <p className="text-xs text-zinc-400">Automated intake department routing</p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center space-x-1.5 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-xl">
          <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
          <span className="text-xs font-bold text-purple-300">{confidence}% Confidence</span>
        </div>
      </div>

      {/* Main Department Display */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/30 via-purple-900/10 to-transparent border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-400 block mb-0.5">
            Matched Specialty
          </span>
          <h4 className="text-lg font-extrabold text-white tracking-tight">{department}</h4>
        </div>

        <div className="flex items-center space-x-2 text-xs text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 w-fit">
          <Compass className="h-4 w-4" />
          <span>Priority Triage Queue</span>
        </div>
      </div>

      {/* Clinical Reason */}
      <div className="mt-3 text-xs text-zinc-400 bg-white/5 p-3 rounded-xl border border-white/5">
        <span className="font-semibold text-zinc-300 block mb-0.5">Routing Rationale:</span>
        <p className="text-zinc-400">{reason}</p>
      </div>
    </div>
  );
};
