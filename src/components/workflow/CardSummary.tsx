import React from 'react';
import { FileSpreadsheet, CheckCircle, ShieldCheck } from 'lucide-react';

interface CardSummaryProps {
  summary: string;
  disclaimer?: string;
}

export const CardSummary: React.FC<CardSummaryProps> = ({
  summary,
  disclaimer = 'Operational summary generated for care coordination. Does not replace professional medical diagnosis.'
}) => {
  return (
    <div className="bg-[#111622]/90 border border-white/10 rounded-2xl p-5 shadow-xl transition-all hover:border-white/20">
      <div className="flex items-center space-x-3 mb-3">
        <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
          <FileSpreadsheet className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            CARD 2 • AI Consultation Summary
            <span className="text-[10px] font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full">
              Staff Ready
            </span>
          </h3>
          <p className="text-xs text-zinc-400">Structured narrative formatted for clinical intake staff</p>
        </div>
      </div>

      {/* Summary Box */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-200 leading-relaxed font-mono">
        <div className="flex items-center space-x-1.5 text-teal-400 text-[11px] font-bold mb-2 uppercase tracking-wider">
          <CheckCircle className="h-3.5 w-3.5" />
          <span>Operational Clinical Intake Record</span>
        </div>
        <p className="text-zinc-300 whitespace-pre-line">{summary}</p>
      </div>

      {/* Safety Disclaimer Footer */}
      <div className="mt-3 flex items-center space-x-2 text-[11px] text-zinc-400 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
        <span>{disclaimer}</span>
      </div>
    </div>
  );
};
