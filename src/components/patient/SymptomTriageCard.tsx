import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Loader2, Stethoscope, ArrowRight, RefreshCw, Printer, Mail, Copy, MapPin, Navigation } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../components/ui/Toast';

export interface TriageAnalysis {
  severity: 'Low' | 'Moderate' | 'Urgent' | 'Emergency';
  summary: string;
  executive_summary?: string;
  triage_level?: string;
  recommended_pathway?: string;
  billing_data?: {
    icd_10_code: string;
    icd_10_description: string;
  };
  hospital_handoff_email?: string;
  differentialDiagnoses: string[];
  recommendedAction: string;
  disclaimer: string;
}

export const SymptomTriageCard: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [patientDetails, setPatientDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<TriageAnalysis | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();

  const handleFindNearbyCare = () => {
    if (!navigator.geolocation) {
      window.open('https://www.google.com/maps/search/medical+centers+near+me', '_blank');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        const googleMapsUrl = `https://www.google.com/maps/search/medical+centers/@${latitude},${longitude},15z`;
        window.open(googleMapsUrl, '_blank');
        toast({
          title: "Opening Google Maps",
          description: "Centering live 1km map on your exact GPS coordinates.",
          type: "success"
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
        window.open('https://www.google.com/maps/search/medical+centers+near+me', '_blank');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!symptoms.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter your symptoms to run the AI triage assessment.",
        type: "error"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/triage/analyze', {
        symptoms: symptoms.trim(),
        patientDetails: patientDetails.trim() || undefined
      });

      if (response.data?.success && response.data?.analysis) {
        setAnalysis(response.data.analysis);
        toast({
          title: "Assessment Complete",
          description: "AI educational symptom evaluation generated successfully.",
          type: "success"
        });
      } else {
        throw new Error(response.data?.message || "Failed to parse triage assessment");
      }
    } catch (error: any) {
      console.error("AI Triage Request Error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to connect to AI triage service. Please try again.";
      toast({
        title: "Assessment Failed",
        description: errorMsg,
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'low':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'moderate':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'urgent':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'emergency':
        return 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'low':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'moderate':
        return <Activity className="w-4 h-4 text-amber-400" />;
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'emergency':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      default:
        return <Activity className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Input Form Card */}
      <div className="bg-[#0A0A0A] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                AI Patient Symptom Triage
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-3 h-3" /> Educational AI
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Describe your symptoms for an immediate AI educational triage evaluation and care advice.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-5">
          <div>
            <label htmlFor="symptoms" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Reported Symptoms <span className="text-red-400">*</span>
            </label>
            <textarea
              id="symptoms"
              rows={4}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Persistent headache with mild fever and sensitivity to light for 2 days..."
              className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition resize-none"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="patientDetails" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Optional Patient Context (Age, Medical History, Duration)
            </label>
            <input
              id="patientDetails"
              type="text"
              value={patientDetails}
              onChange={(e) => setPatientDetails(e.target.value)}
              placeholder="e.g. 34-year-old male, no chronic illness, started yesterday"
              className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {analysis && (
              <button
                type="button"
                onClick={() => {
                  setSymptoms('');
                  setPatientDetails('');
                  setAnalysis(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !symptoms.trim()}
              className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-lg shadow-white/5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  Analyzing Symptoms...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Symptoms with AI
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Card */}
      {analysis && (
        <div className="bg-[#0A0A0A] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/60 pb-5">
            <div>
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Triage Severity Evaluation</span>
              <div className="flex items-center gap-3 mt-1.5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getSeverityBadgeClass(analysis.severity)}`}>
                  {getSeverityIcon(analysis.severity)}
                  {analysis.severity} Urgency
                </span>
              </div>
            </div>
            <div className="text-right flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-3 py-1.5 rounded-lg border border-zinc-700 transition flex items-center gap-1.5 shadow-sm print:hidden"
              >
                <Printer className="w-3.5 h-3.5" /> Download PDF
              </button>
              <span className="text-xs text-zinc-500">Evaluated by CareFlow AI Assistant</span>
            </div>
          </div>

          {/* Evaluation Summary */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-200">Clinical Evaluation Summary</h3>
            <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
              {analysis.executive_summary || analysis.summary}
            </p>
          </div>

          {/* Automated Billing Code (ICD-10) */}
          {analysis?.billing_data?.icd_10_code && (
            <div className="bg-zinc-900/90 border border-cyan-500/30 p-4 rounded-xl space-y-2.5 shadow-lg shadow-cyan-950/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Automated Billing Code (ICD-10)</span>
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                  Phase 1 Active
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-sm font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-400/50 px-3 py-1 rounded-lg tracking-wider shadow-sm shadow-cyan-500/10">
                  ICD-10: {analysis.billing_data.icd_10_code}
                </span>
                <span className="text-sm text-zinc-200 font-medium">
                  — {analysis.billing_data.icd_10_description || 'Unspecified Medical Condition'}
                </span>
              </div>
            </div>
          )}

          {/* Automated Hospital Dispatch Email */}
          {analysis?.hospital_handoff_email && (
            <div className="bg-zinc-900/90 border border-emerald-500/30 p-5 rounded-xl space-y-3.5 shadow-lg shadow-emerald-950/20">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center space-x-2.5">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Automated Hospital Dispatch</h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Ready to Send
                </span>
              </div>

              <textarea
                readOnly
                rows={7}
                value={analysis.hospital_handoff_email}
                className="w-full bg-zinc-950/90 border border-zinc-800 rounded-xl p-3.5 text-xs font-mono text-zinc-200 focus:outline-none resize-none leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(analysis.hospital_handoff_email || '');
                    toast({
                      title: "Copied to Clipboard",
                      description: "Hospital handoff email report copied successfully.",
                      type: "success"
                    });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-zinc-700 transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Email
                </button>
                <a
                  href={`mailto:triage@hospital.com?subject=${encodeURIComponent('CareFlow Patient Triage Handoff Report')}&body=${encodeURIComponent(analysis.hospital_handoff_email)}`}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <Mail className="w-3.5 h-3.5" /> Send Handoff Email
                </a>
              </div>
            </div>
          )}

          {/* Real-Time 1km Google Maps Location Service */}
          <div className="bg-zinc-900/90 border border-blue-500/30 p-5 rounded-xl space-y-3 shadow-lg shadow-blue-950/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-blue-400" />
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Nearby Healthcare Discovery (1km Radius)</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Instantly center Google Maps on your exact GPS coordinates to locate verified hospitals and medical clinics.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFindNearbyCare}
                disabled={isLocating}
                className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-black font-bold text-xs transition flex items-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Locating GPS...
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4" /> Find Nearby Care (1km Radius)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Differential Diagnoses */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Potential Educational Differential Diagnoses
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {analysis.differentialDiagnoses.map((diag, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-zinc-900/70 border border-zinc-800/80 p-3.5 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-zinc-200 font-medium">{diag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Action */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-emerald-400" />
              Recommended Next Action
            </h3>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-sm font-medium text-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>{analysis.recommendedAction}</div>
            </div>
          </div>

          {/* Disclaimer Box */}
          <div className="bg-zinc-900/90 border border-zinc-800/90 p-4 rounded-xl flex items-start gap-3 text-xs text-zinc-400">
            <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-zinc-300 block mb-0.5">Educational Triage Disclaimer</span>
              {analysis.disclaimer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
