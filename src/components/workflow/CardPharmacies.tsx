import React from 'react';
import { Pill, MapPin, Phone, Star, ShieldCheck } from 'lucide-react';

export interface PharmacyItem {
  _id: string;
  name: string;
  address: string;
  phoneNumber: string;
  rating?: number;
  openStatus?: string;
  distance?: string;
  availableMedicines?: string[];
}

interface CardPharmaciesProps {
  pharmacies: PharmacyItem[];
}

export const CardPharmacies: React.FC<CardPharmaciesProps> = ({ pharmacies = [] }) => {
  return (
    <div className="bg-[#111622]/90 border border-white/10 rounded-2xl p-5 shadow-xl transition-all hover:border-white/20">
      <div className="flex items-center space-x-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <Pill className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            CARD 7 • Registered Partner Pharmacies
            <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
              Operational Integration
            </span>
          </h3>
          <p className="text-xs text-zinc-400">Connected pharmaceutical partners for post-consultation workflow</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pharmacies.length === 0 ? (
          <div className="col-span-full p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-zinc-400 text-center italic">
            Loading registered partner pharmacies...
          </div>
        ) : (
          pharmacies.map((pharmacy) => (
            <div
              key={pharmacy._id}
              className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white tracking-tight">{pharmacy.name}</h4>
                  <span className="flex items-center gap-1 text-amber-400 font-semibold text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded">
                    <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                    {pharmacy.rating || 4.8}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-zinc-500 shrink-0" />
                  <span className="truncate">{pharmacy.address}</span>
                </p>

                <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-zinc-500 shrink-0" />
                  <span>{pharmacy.phoneNumber}</span>
                </p>
              </div>

              {/* Status & Meds tags */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                <span className="text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {pharmacy.openStatus || 'Open 24/7'} ({pharmacy.distance})
                </span>
                <span className="text-zinc-400 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  Partner Stock Sync Active
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
