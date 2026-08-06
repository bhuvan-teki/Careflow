import React from 'react';
import { GitCommit, CheckCircle2, Clock, Loader2 } from 'lucide-react';

export interface TimelineStep {
  step: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
  timestamp?: string;
}

interface CardTimelineProps {
  timeline: TimelineStep[];
}

export const CardTimeline: React.FC<CardTimelineProps> = ({ timeline = [] }) => {
  return (
    <div className="bg-[#111622]/90 border border-white/10 rounded-2xl p-5 shadow-xl transition-all hover:border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <GitCommit className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              CARD 8 • Enterprise Workflow Timeline
              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Live State
              </span>
            </h3>
            <p className="text-xs text-zinc-400">Real-time multi-department operational execution progress</p>
          </div>
        </div>
      </div>

      {/* Horizontal / Vertical Stepper */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
        {timeline.map((item, index) => {
          const isCompleted = item.status === 'completed';
          const isCurrent = item.status === 'current';

          return (
            <div key={index} className="relative flex items-center justify-between group">
              {/* Dot Icon */}
              <div className="absolute -left-6 top-1/2 -translate-y-1/2">
                {isCompleted ? (
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                ) : isCurrent ? (
                  <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-zinc-950 shadow-lg shadow-emerald-500/40 animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin stroke-[3]" />
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full bg-[#111622] border border-white/20 flex items-center justify-center text-zinc-500">
                    <Clock className="h-3 w-3" />
                  </div>
                )}
              </div>

              {/* Title & Info */}
              <div className="flex-1 ml-2">
                <p className={`text-xs font-semibold ${
                  isCompleted ? 'text-white' : isCurrent ? 'text-emerald-400 font-bold' : 'text-zinc-400'
                }`}>
                  {item.title}
                </p>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isCompleted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  isCurrent ? 'bg-emerald-500 text-zinc-950 font-bold animate-pulse' :
                  'bg-white/5 text-zinc-400 border border-white/5'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
