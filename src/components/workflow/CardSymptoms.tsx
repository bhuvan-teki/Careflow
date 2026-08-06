import React, { useState } from 'react';
import { Stethoscope, ChevronDown, ChevronUp, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';

interface CardSymptomsProps {
  symptoms: string[];
  duration: string;
  severity: string;
  riskFactors?: string[];
}

export const CardSymptoms: React.FC<CardSymptomsProps> = ({
  symptoms = [],
  duration = 'Not specified',
  severity = 'Moderate',
  riskFactors = []
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const severityColor = 
    severity === 'Severe' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
    severity === 'Mild' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
    'text-amber-400 bg-amber-500/10 border-amber-500/20';

  return (
    <div className="bg-[#111622]/90 border border-white/10 rounded-2xl p-5 shadow-xl transition-all hover:border-white/20">
      {/* Card Header */}
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              CARD 1 • Symptoms Identified
              <span className="text-[10px] font-semibold bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-zinc-400">
                {symptoms.length} Detected
              </span>
            </h3>
            <p className="text-xs text-zinc-400">Extracted from patient narrative input</p>
          </div>
        </div>

        <button className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-in fade-in duration-200">
          {/* Symptoms Badges */}
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              Primary Symptoms
            </span>
            <div className="flex flex-wrap gap-2">
              {symptoms.map((symptom, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-300"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  <span>{symptom}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Operational Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center space-x-3">
              <Clock className="h-4 w-4 text-zinc-400 shrink-0" />
              <div>
                <span className="text-[10px] text-zinc-400 block font-medium uppercase">Duration</span>
                <span className="text-xs font-semibold text-white">{duration}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center space-x-3">
              <AlertTriangle className="h-4 w-4 text-zinc-400 shrink-0" />
              <div>
                <span className="text-[10px] text-zinc-400 block font-medium uppercase">Reported Severity</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${severityColor}`}>
                  {severity}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          {riskFactors.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start space-x-2.5">
              <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-amber-300 block">Risk Factors Identified</span>
                <p className="text-xs text-zinc-300 mt-0.5">{riskFactors.join(', ')}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
