import React from 'react';
import { Hospital, Star, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface ClinicItem {
  _id: string;
  clinicName: string;
  rating?: number;
  distance?: string;
  openStatus?: string;
  departments?: string[];
  estimatedWaitTime?: string;
  address?: string;
  logoUrl?: string;
}

interface CardClinicsProps {
  clinics: ClinicItem[];
  recommendedDept?: string;
  connectedClinicId?: string | null;
  onConnectClinic: (clinicId: string) => void;
  isConnecting?: boolean;
}

export const CardClinics: React.FC<CardClinicsProps> = ({
  clinics = [],
  recommendedDept = 'General Physician',
  connectedClinicId = null,
  onConnectClinic,
  isConnecting = false
}) => {
  return (
    <div className="bg-[#111622]/90 border border-white/10 rounded-2xl p-5 shadow-xl transition-all hover:border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Hospital className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              CARD 6 • Nearby Registered Clinics
              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Real Database
              </span>
            </h3>
            <p className="text-xs text-zinc-400">Live operational partners ready for instant patient transfer</p>
          </div>
        </div>
      </div>

      {/* Clinic Cards Grid */}
      <div className="space-y-3">
        {clinics.length === 0 ? (
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-zinc-400 text-center italic">
            Loading registered clinics from database...
          </div>
        ) : (
          clinics.map((clinic) => {
            const isConnected = connectedClinicId === clinic._id;
            const matchesDept = clinic.departments?.includes(recommendedDept);

            return (
              <div
                key={clinic._id}
                className={`p-4 rounded-xl border transition-all ${
                  isConnected
                    ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Clinic Info */}
                  <div className="flex items-start space-x-3">
                    <img
                      src={clinic.logoUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=150&q=80'}
                      alt={clinic.clinicName}
                      className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white tracking-tight">{clinic.clinicName}</h4>
                        {matchesDept && (
                          <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
                            Dept Match
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-zinc-500 shrink-0" />
                        {clinic.address}
                      </p>

                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                        <span className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {clinic.rating || 4.9}
                        </span>

                        <span className="text-zinc-300 font-medium bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                          {clinic.distance || '0.8 miles'}
                        </span>

                        <span className="text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          {clinic.openStatus || 'Open Now'}
                        </span>

                        <span className="text-zinc-400 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md">
                          <Clock className="h-3 w-3 text-zinc-400" />
                          Est. Wait: {clinic.estimatedWaitTime || '10 mins'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Connect Action Button */}
                  <div className="shrink-0 sm:self-center">
                    {isConnected ? (
                      <div className="flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>Connected</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onConnectClinic(clinic._id)}
                        disabled={isConnecting}
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                      >
                        <span>Connect Workflow</span>
                        <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Available Departments Pill Tags */}
                {clinic.departments && clinic.departments.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto text-[10px] text-zinc-400">
                    <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[9px]">Departments:</span>
                    {clinic.departments.map((dept, dIdx) => (
                      <span key={dIdx} className="bg-white/5 px-2 py-0.5 rounded text-zinc-300 border border-white/5">
                        {dept}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
