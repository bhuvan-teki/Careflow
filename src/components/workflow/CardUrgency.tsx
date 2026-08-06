import React from 'react';
import { AlertCircle, Flame, ShieldAlert, Siren } from 'lucide-react';

interface CardUrgencyProps {
  urgency: 'Low' | 'Medium' | 'High' | 'Emergency' | string;
  reason: string;
}

export const CardUrgency: React.FC<CardUrgencyProps> = ({
  urgency = 'Medium',
  reason = 'Symptoms warrant timely medical assessment.'
}) => {
  const getBadgeStyle = () => {
    switch (urgency) {
      case 'Emergency':
        return {
          bg: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
          icon: Siren,
          text: 'Emergency Triage',
          color: 'text-rose-400'
        };
      case 'High':
        return {
          bg: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
          icon: ShieldAlert,
          text: 'High Priority',
          color: 'text-orange-400'
        };
      case 'Low':
        return {
          bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
          icon: AlertCircle,
          text: 'Low Urgency',
          color: 'text-emerald-400'
        };
      default:
        return {
          bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
          icon: Flame,
          text: 'Medium Urgency',
          color: 'text-amber-400'
        };
    }
  };

  const badge = getBadgeStyle();
  const IconComponent = badge.icon;

  return (
    <div className="bg-[#111622]/90 border border-white/10 rounded-2xl p-5 shadow-xl transition-all hover:border-white/20">
      <div className="flex items-center space-x-3 mb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${badge.bg}`}>
          <IconComponent className={`h-5 w-5 ${badge.color}`} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            CARD 4 • Urgency Assessment
          </h3>
          <p className="text-xs text-zinc-400">Clinical operational priority rating</p>
        </div>
      </div>

      {/* Urgency Level Display */}
      <div className={`p-4 rounded-xl border flex items-center justify-between ${badge.bg}`}>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
            Triage Severity Classification
          </span>
          <span className="text-xl font-black tracking-tight">{urgency.toUpperCase()}</span>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-black/40 border border-white/10">
          {badge.text}
        </span>
      </div>

      {/* Explanation */}
      <div className="mt-3 text-xs text-zinc-400 bg-white/5 p-3 rounded-xl border border-white/5">
        <span className="font-semibold text-zinc-300 block mb-0.5">Clinical Justification:</span>
        <p>{reason}</p>
      </div>
    </div>
  );
};
