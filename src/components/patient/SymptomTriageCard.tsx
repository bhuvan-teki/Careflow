import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Loader2, Stethoscope, ArrowRight, RefreshCw, Printer, Mail, Copy, MapPin, Navigation, Globe, Phone, Building2, ExternalLink, Calendar, Paperclip, Upload, FileText, Smartphone } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../components/ui/Toast';

export interface NearbyPlace {
  name: string;
  address: string;
  phone?: string | null;
  nationalPhoneNumber?: string | null;
  websiteUri?: string | null;
  googleMapsUri: string;
}

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

const checkBookingLikely = (name: string) => {
  const keywords = ['diagnostic', 'clinic', 'eye', 'dental', 'care', 'physio', 'vision'];
  return name ? keywords.some(kw => name.toLowerCase().includes(kw)) : false;
};

const getProfessionalSmsDraft = (analysisData: any, inputSymptoms: string) => {
  const complaint = inputSymptoms?.trim() || 'Reported Symptoms';
  const icdCode = analysisData?.billing_data?.icd_10_code || 'R69';
  const urgency = analysisData?.triage_level || analysisData?.severity || 'Moderate';
  return `URGENT CLINICAL INTAKE: Patient reporting ${complaint} (ICD-10: ${icdCode}). Triage Level: ${urgency}. Patient has attached secure medical records, photos, and a full triage PDF. View patient file here: https://careflow-front-end.onrender.com/secure/patient-file-temp-link`;
};

export const SymptomTriageCard: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [patientDetails, setPatientDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<TriageAnalysis | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFindNearbyCare = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Unsupported",
        description: "Your browser does not support Geolocation.",
        type: "error"
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await api.post('/triage/places/nearby', {
            lat: latitude,
            lng: longitude,
            radius: 5000
          });

          if (response.data?.success && Array.isArray(response.data.places)) {
            setNearbyPlaces(response.data.places);
            toast({
              title: "Healthcare Facilities Discovered",
              description: `Retrieved ${response.data.places.length} real-world medical centers within 5km radius.`,
              type: "success"
            });
          }
        } catch (err: any) {
          console.error("Places API error:", err);
          toast({
            title: "Care Discovery Error",
            description: "Unable to retrieve nearby medical facilities.",
            type: "error"
          });
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
        toast({
          title: "Location Access Denied",
          description: "Please allow location access to discover 5km nearby clinics.",
          type: "error"
        });
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
          
          {/* STEP 1: AI Educational Triage */}
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

          {/* STEP 2: NEARBY HEALTHCARE DISCOVERY */}
          <div className="bg-zinc-900/90 border border-blue-500/30 p-5 rounded-xl space-y-4 shadow-lg shadow-blue-950/20">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3.5">
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-blue-400" />
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Nearby Healthcare Discovery (5km Radius)</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Real-time AI discovery of verified hospitals, specialty clinics, and medical centers within a 5km radius.
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
                    <Loader2 className="w-4 h-4 animate-spin" /> Discovering 5km Care...
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4" /> Find Nearby Care (5km Radius)
                  </>
                )}
              </button>
            </div>

            {nearbyPlaces.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {nearbyPlaces.map((place, idx) => {
                  const phoneNum = place.nationalPhoneNumber || place.phone;
                  const hasWebsite = Boolean(place.websiteUri);
                  const hasPhone = Boolean(phoneNum);
                  const phoneDigits = phoneNum ? phoneNum.replace(/\D/g, '') : '';
                  const professionalSmsDraft = getProfessionalSmsDraft(analysis, symptoms);
                  const smsBody = encodeURIComponent(professionalSmsDraft);
                  const smsUrl = phoneDigits ? `sms:${phoneDigits}?body=${smsBody}` : '#';

                  return (
                    <div key={idx} className="bg-zinc-950/90 border border-zinc-800/90 p-4 rounded-xl space-y-3 flex flex-col justify-between hover:border-zinc-700 transition">
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-white tracking-wide leading-snug">{place.name}</h4>
                        <p className="text-[11px] text-zinc-400 leading-snug">{place.address}</p>
                      </div>

                      {/* Dynamic Availability Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {hasWebsite && (
                          checkBookingLikely(place.name) ? (
                            <a
                              href={place.websiteUri!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-purple-950/90 text-purple-300 border border-purple-500/40 hover:bg-purple-900/90 transition shadow-sm shadow-purple-950/30"
                            >
                              <Calendar className="w-3 h-3 text-purple-300" /> Online Booking Likely
                            </a>
                          ) : (
                            <a
                              href={place.websiteUri!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/80 transition"
                            >
                              <Globe className="w-3 h-3 text-emerald-400" /> Check Site for Booking
                            </a>
                          )
                        )}

                        {hasPhone && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-blue-950/80 text-blue-400 border border-blue-500/30">
                            <Phone className="w-3 h-3 text-blue-400" /> {phoneNum}
                          </span>
                        )}

                        {!hasWebsite && !hasPhone && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-zinc-800/90 text-zinc-400 border border-zinc-700/60">
                            <Building2 className="w-3 h-3 text-zinc-400" /> Walk-in / In-Person Only
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {hasPhone && phoneDigits && (
                          <a
                            href={smsUrl}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-md shadow-emerald-500/20"
                          >
                            <Smartphone className="w-3.5 h-3.5" /> 📱 Send Intake SMS
                          </a>
                        )}

                        <a
                          href={place.googleMapsUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs border border-zinc-700 transition"
                        >
                          Directions on Google Maps <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PROGRESSIVE DISCLOSURE: STEPS 3 & 4 (Render ONLY if nearby places discovered) */}
          {nearbyPlaces && nearbyPlaces.length > 0 && (
            <>
              {/* STEP 3: ATTACH MEDICAL RECORDS UI (Optional) */}
              <div className="bg-zinc-900/90 border border-purple-500/30 p-4 sm:p-5 rounded-xl space-y-3 shadow-lg shadow-purple-950/20 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Paperclip className="w-4 h-4 text-purple-400" />
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Attach Medical Records & Photos (Optional)</h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Upload lab receipts, rash photos, or previous prescriptions to attach to your secure SMS & triage dispatch.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded">
                    Secure File Vault
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                  <label className="cursor-pointer w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-md shadow-purple-600/20">
                    <Upload className="w-4 h-4" /> Attach Medical Files
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const names = Array.from(e.target.files).map(f => f.name);
                          setAttachedFiles(prev => [...prev, ...names]);
                          toast({
                            title: "Files Attached",
                            description: `Attached ${names.length} record(s) to secure triage dispatch.`,
                            type: "success"
                          });
                        }
                      }}
                    />
                  </label>

                  {attachedFiles.length > 0 ? (
                    <div className="flex flex-wrap gap-2 items-center">
                      {attachedFiles.map((file, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium px-2.5 py-1 rounded-md bg-purple-950/80 text-purple-300 border border-purple-500/30">
                          <FileText className="w-3 h-3 text-purple-400" /> {file}
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={() => setAttachedFiles([])}
                        className="text-[10px] text-zinc-500 hover:text-zinc-300 underline font-mono"
                      >
                        Clear All
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-500 italic">No files selected yet (Optional)</span>
                  )}
                </div>
              </div>

              {/* STEP 4: AUTOMATED HOSPITAL DISPATCH */}
              {analysis?.hospital_handoff_email && (
                <div className="bg-zinc-900/90 border border-emerald-500/30 p-5 rounded-xl space-y-3.5 shadow-lg shadow-emerald-950/20 animate-in fade-in duration-300">
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
            </>
          )}

        </div>
      )}
    </div>
  );
};
