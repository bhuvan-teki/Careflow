import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { 
  Activity, 
  CheckCircle2, 
  Sparkles, 
  FileText,
  Stethoscope,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface AssessmentForm {
  patientType: 'Self' | 'Child' | 'Adult' | 'Elderly';
  ageGender: string;
  symptomStart: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  additionalSymptoms: string;
  medicalConditions: string;
}

export function PatientDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Unified State Management
  const [phase, setPhase] = useState<'intake' | 'assessment' | 'summary'>('intake');
  const [initialComplaint, setInitialComplaint] = useState('');
  const [currentQuestionStep, setCurrentQuestionStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [triageAnalysis, setTriageAnalysis] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 6 Structured Questions Form State
  const [assessmentData, setAssessmentData] = useState<AssessmentForm>({
    patientType: 'Self',
    ageGender: 'Adult',
    symptomStart: '1-2 Days',
    severity: 'Moderate',
    additionalSymptoms: '',
    medicalConditions: ''
  });

  const [activeConsultationId, setActiveConsultationId] = useState<string | null>(null);
  const [historyConsultations, setHistoryConsultations] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  // CRITICAL FIX: Synchronize & reset state when activeConsultationId changes
  useEffect(() => {
    if (!activeConsultationId) return;

    const consult = historyConsultations[activeConsultationId];
    if (!consult) return;

    // 1. MUST explicitly clear stale triage state immediately
    setTriageAnalysis(null);

    // 2. Restore clean initial complaint title
    let title = consult.rawPatientInput || (consult.aiAnalysis?.symptoms ? consult.aiAnalysis.symptoms.join(', ') : 'Consultation Record');
    if (title.includes('. Patient:')) {
      title = title.split('. Patient:')[0].replace(/^Main Complaint:\s*/i, '').trim();
    }
    setInitialComplaint(title);
    setPhase('summary');

    // 3. Restore unique assessmentData
    if (consult.assessmentData && consult.assessmentData.ageGender) {
      setAssessmentData(consult.assessmentData);
    } else {
      // Intelligently parse raw input if legacy record does not have assessmentData
      const symptomsList = consult.aiAnalysis?.symptoms?.join(', ') || title;
      setAssessmentData({
        patientType: 'Self',
        ageGender: consult.aiAnalysis?.urgency ? `${consult.aiAnalysis.urgency} Urgency Patient` : 'Adult',
        symptomStart: consult.aiAnalysis?.duration || 'Not specified',
        severity: consult.aiAnalysis?.severity || 'Moderate',
        additionalSymptoms: symptomsList,
        medicalConditions: consult.aiAnalysis?.riskFactors?.length ? consult.aiAnalysis.riskFactors.join(', ') : 'None'
      });
    }

    // 4. Restore unique triageAnalysis (including ICD-10 medical billing code)
    if (consult.triageAnalysis && consult.triageAnalysis.billing_data) {
      setTriageAnalysis(consult.triageAnalysis);
    } else {
      // Re-fetch triage analysis for legacy records missing stored triageAnalysis
      const contextDetails = `Main Complaint: ${title}. Patient Profile: ${consult.aiAnalysis?.urgency || 'Adult'}. Onset: ${consult.aiAnalysis?.duration || 'Intake Record'}.`;
      api.post('/triage/analyze', {
        symptoms: title,
        patientDetails: contextDetails
      }).then(res => {
        if (res.data?.success && res.data?.analysis) {
          setTriageAnalysis(res.data.analysis);
        }
      }).catch(err => {
        console.error('Failed to restore triage analysis:', err);
      });
    }
  }, [activeConsultationId, historyConsultations]);

  const fetchInitialData = async () => {
    try {
      const patientIdParam = user?.id || 'all';
      const historyRes = await api.get(`/workflow/consultations/patient/${patientIdParam}`);
      if (historyRes.data?.success && Array.isArray(historyRes.data?.consultations)) {
        const consultMap: Record<string, any> = {};
        const formatted = historyRes.data.consultations.map((c: any) => {
          consultMap[c._id] = c;
          const symptomsList = c.aiAnalysis?.symptoms;
          let displayTitle = (Array.isArray(symptomsList) && symptomsList.length > 0)
            ? symptomsList.join(', ')
            : (c.rawPatientInput || 'Medical Consultation');

          if (displayTitle.includes('. Patient:')) {
            displayTitle = displayTitle.split('. Patient:')[0].replace(/^Main Complaint:\s*/i, '').trim();
          }

          return {
            id: c._id,
            title: displayTitle,
            date: new Date(c.createdAt || Date.now()).toLocaleDateString(),
            urgency: c.aiAnalysis?.urgency || 'Medium',
            rawConsultation: c
          };
        });
        setHistory(formatted);
        setHistoryConsultations(consultMap);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleSelectHistoryItem = (id: string) => {
    // 1. Explicitly clear current triage data first to prevent stale state retention
    setTriageAnalysis(null);
    setActiveConsultationId(id);
    setPhase('summary');

    const consult = historyConsultations[id];
    if (consult) {
      let displayTitle = consult.rawPatientInput || 'Consultation Record';
      if (displayTitle.includes('. Patient:')) {
        displayTitle = displayTitle.split('. Patient:')[0].replace(/^Main Complaint:\s*/i, '').trim();
      }
      toast({
        title: "Conversation Loaded",
        description: `Viewing: ${displayTitle.slice(0, 35)}...`,
        type: "success"
      });
    }
  };

  const handleDeleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/workflow/consultations/${id}`);
      setHistory(prev => prev.filter(item => item.id !== id));
      if (activeConsultationId === id) {
        setActiveConsultationId(null);
        setPhase('intake');
        setInitialComplaint('');
        setTriageAnalysis(null);
      }
      toast({ title: "Conversation Removed", description: "Deleted history record.", type: "success" });
    } catch (err) {
      setHistory(prev => prev.filter(item => item.id !== id));
      toast({ title: "Conversation Removed", description: "Removed from history.", type: "success" });
    }
  };

  // Step 1: User enters initial condition
  const handleStartIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialComplaint.trim()) return;
    setPhase('assessment');
    setCurrentQuestionStep(1);
  };

  const handleCompleteIntake = async () => {
    setPhase('summary');
    setIsAnalyzing(true);
    try {
      const fullContext = `Main Complaint: ${initialComplaint}. Patient Profile: ${assessmentData.patientType} (${assessmentData.ageGender}). Onset & Duration: ${assessmentData.symptomStart}. Severity & Pain Character: ${assessmentData.severity}. Associated Symptoms: ${assessmentData.additionalSymptoms || 'None'}. Medical History & Medications: ${assessmentData.medicalConditions || 'None'}.`;

      // 1. Send complete 6-question clinical profile to Gemini AI Triage Engine
      const triageRes = await api.post('/triage/analyze', {
        symptoms: initialComplaint,
        patientDetails: fullContext
      });

      let currentTriageAnalysis = null;
      if (triageRes.data?.success && triageRes.data?.analysis) {
        currentTriageAnalysis = triageRes.data.analysis;
        setTriageAnalysis(currentTriageAnalysis);
      }

      // 2. Save consultation with complete assessmentData and triageAnalysis to database
      const wfRes = await api.post('/workflow/analyze', {
        patientMessage: fullContext,
        patientId: user?.id || '65f1a2b3c4d5e6f7a8b9c0d1',
        consultationId: activeConsultationId || undefined,
        assessmentData,
        triageAnalysis: currentTriageAnalysis
      });

      if (wfRes.data?.success && wfRes.data?.consultation?._id) {
        setActiveConsultationId(wfRes.data.consultation._id);
        fetchInitialData();
      }
    } catch (err) {
      console.error('Failed to save consultation to database:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewConsultation = () => {
    setActiveConsultationId(null);
    setPhase('intake');
    setInitialComplaint('');
    setCurrentQuestionStep(1);
    setTriageAnalysis(null);
    setAssessmentData({
      patientType: 'Self',
      ageGender: 'Adult',
      symptomStart: '1-2 Days',
      severity: 'Moderate',
      additionalSymptoms: '',
      medicalConditions: ''
    });
  };

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-zinc-100 overflow-hidden font-sans select-none">
      {/* Left Sidebar */}
      <Sidebar
        onNewConsultation={handleNewConsultation}
        history={history}
        activeConsultationId={activeConsultationId || undefined}
        onSelectHistoryItem={handleSelectHistoryItem}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#0A0A0A]">
        <Header 
          title={initialComplaint ? initialComplaint.slice(0, 30) : 'CareFlow Enterprise AI'} 
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="w-full max-w-6xl mx-auto space-y-6">

            {/* STEP 1: INITIAL CONDITION INTAKE (AI Patient Symptom Triage) */}
            {phase === 'intake' && (
              <div className="bg-[#0A0A0A] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-w-4xl mx-auto my-6">
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

                <form onSubmit={handleStartIntake} className="space-y-5">
                  <div>
                    <label htmlFor="symptoms" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                      Reported Symptoms <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="symptoms"
                      rows={4}
                      value={initialComplaint}
                      onChange={(e) => setInitialComplaint(e.target.value)}
                      placeholder="e.g. Persistent headache with mild fever and sensitivity to light for 2 days..."
                      className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={!initialComplaint.trim()}
                      className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-lg shadow-white/5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Symptoms with AI</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 2: STRUCTURED 6-QUESTION ASSESSMENT */}
            {phase === 'assessment' && (
              <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-4">
                  <div className="flex items-center space-x-2.5">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">AI Clinical Patient Assessment (Step {currentQuestionStep} of 6)</h3>
                  </div>
                  <span className="text-xs text-zinc-500">CareFlow Physician Intake</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#171717] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${(currentQuestionStep / 6) * 100}%` }}
                  />
                </div>

                {/* Q1: Who is the patient? */}
                {currentQuestionStep === 1 && (
                  <div className="space-y-4">
                    <label className="text-xs font-medium text-zinc-300 block">Question 1: Who is the patient?</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['Self', 'Child', 'Adult', 'Elderly'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => {
                            setAssessmentData({ ...assessmentData, patientType: type });
                            setCurrentQuestionStep(2);
                          }}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            assessmentData.patientType === type 
                              ? 'bg-emerald-500/10 border-emerald-500 text-white' 
                              : 'bg-[#171717] border-[#2A2A2A] text-zinc-400 hover:border-zinc-600'
                          }`}
                        >
                          <span className="text-xs font-semibold block">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Q2: Age and Gender */}
                {currentQuestionStep === 2 && (
                  <div className="space-y-4">
                    <label className="text-xs font-medium text-zinc-300 block">Question 2: What is the patient's age and gender?</label>
                    <input
                      type="text"
                      value={assessmentData.ageGender}
                      onChange={(e) => setAssessmentData({ ...assessmentData, ageGender: e.target.value })}
                      placeholder="Example: 45 years, male"
                      className="w-full bg-[#171717] border border-[#2A2A2A] rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                    <button
                      onClick={() => setCurrentQuestionStep(3)}
                      className="bg-white text-black px-4 py-2 rounded-xl text-xs font-semibold"
                    >
                      Next Question ➔
                    </button>
                  </div>
                )}

                {/* Q3: Duration */}
                {currentQuestionStep === 3 && (
                  <div className="space-y-4">
                    <label className="text-xs font-medium text-zinc-300 block">Question 3: When did the symptoms start?</label>
                    <input
                      type="text"
                      value={assessmentData.symptomStart}
                      onChange={(e) => setAssessmentData({ ...assessmentData, symptomStart: e.target.value })}
                      placeholder="Example: 2 days ago / yesterday"
                      className="w-full bg-[#171717] border border-[#2A2A2A] rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                    <button
                      onClick={() => setCurrentQuestionStep(4)}
                      className="bg-white text-black px-4 py-2 rounded-xl text-xs font-semibold"
                    >
                      Next Question ➔
                    </button>
                  </div>
                )}

                {/* Q4: Severity */}
                {currentQuestionStep === 4 && (
                  <div className="space-y-4">
                    <label className="text-xs font-medium text-zinc-300 block">Question 4: How severe is the condition?</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['Mild', 'Moderate', 'Severe'] as const).map(sev => (
                        <button
                          key={sev}
                          onClick={() => {
                            setAssessmentData({ ...assessmentData, severity: sev });
                            setCurrentQuestionStep(5);
                          }}
                          className={`p-3.5 rounded-xl border text-center transition-all ${
                            assessmentData.severity === sev 
                              ? 'bg-emerald-500/10 border-emerald-500 text-white' 
                              : 'bg-[#171717] border-[#2A2A2A] text-zinc-400 hover:border-zinc-600'
                          }`}
                        >
                          <span className="text-xs font-semibold block">{sev}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Q5: Additional Symptoms */}
                {currentQuestionStep === 5 && (
                  <div className="space-y-4">
                    <label className="text-xs font-medium text-zinc-300 block">Question 5: Any additional symptoms?</label>
                    <input
                      type="text"
                      value={assessmentData.additionalSymptoms}
                      onChange={(e) => setAssessmentData({ ...assessmentData, additionalSymptoms: e.target.value })}
                      placeholder="Example: Fever, Vomiting, Breathing difficulty, Body pain"
                      className="w-full bg-[#171717] border border-[#2A2A2A] rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                    <button
                      onClick={() => setCurrentQuestionStep(6)}
                      className="bg-white text-black px-4 py-2 rounded-xl text-xs font-semibold"
                    >
                      Next Question ➔
                    </button>
                  </div>
                )}

                {/* Q6: Medical History */}
                {currentQuestionStep === 6 && (
                  <div className="space-y-4">
                    <label className="text-xs font-medium text-zinc-300 block">Question 6: Any existing medical conditions or allergies?</label>
                    <input
                      type="text"
                      value={assessmentData.medicalConditions}
                      onChange={(e) => setAssessmentData({ ...assessmentData, medicalConditions: e.target.value })}
                      placeholder="Example: Diabetes, BP, Allergies, None"
                      className="w-full bg-[#171717] border border-[#2A2A2A] rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                    <button
                      onClick={handleCompleteIntake}
                      disabled={isAnalyzing}
                      className="w-full bg-white text-black py-3 rounded-xl text-xs font-bold transition-all hover:bg-zinc-200 disabled:opacity-50"
                    >
                      {isAnalyzing ? 'Generating Executive Summary...' : 'Generate Executive Clinical Triage Summary ➔'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 & 4: CONCISE PATIENT SUMMARY & HEALTHCARE DISCOVERY */}
            {phase === 'summary' && (
              <div className="space-y-6 w-full">

                {/* EXECUTIVE CASE SUMMARY (Clean Enterprise Matrix, No Congested Nested Boxes, No Green Text) */}
                <div className="bg-[#121212] border border-[#262626] rounded-xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-white" />
                      <h2 className="text-sm font-semibold tracking-wide text-white uppercase">Executive Clinical Triage Summary</h2>
                    </div>
                    <span className="text-[11px] font-medium text-zinc-400 bg-zinc-800/60 border border-zinc-700/50 px-2.5 py-1 rounded">
                      Clinical Intake Complete
                    </span>
                  </div>

                  {/* Sleek 6-Column Operational Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-6 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Patient</span>
                      <p className="text-white font-medium">{assessmentData.ageGender}</p>
                      <span className="text-[10px] text-zinc-400">{assessmentData.patientType}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Main Complaint</span>
                      <p className="text-white font-medium capitalize">{initialComplaint}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Onset & Severity</span>
                      <p className="text-white font-medium">{assessmentData.symptomStart}</p>
                      <span className="text-[10px] text-zinc-400 font-semibold">{assessmentData.severity} Severity</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Associated Symptoms</span>
                      <p className="text-zinc-300 font-medium">{assessmentData.additionalSymptoms}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Medical History</span>
                      <p className="text-zinc-300 font-medium">{assessmentData.medicalConditions}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Pathway</span>
                      <p className="text-white font-semibold">{triageAnalysis?.recommended_pathway || 'General Physician'}</p>
                    </div>
                  </div>

                  {/* Automated ICD-10 Medical Billing Code (Phase 1) */}
                  {triageAnalysis?.billing_data?.icd_10_code && (
                    <div className="pt-4 border-t border-[#262626] flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center space-x-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Automated Billing Code:</span>
                        <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-2.5 py-1 rounded-md tracking-wider">
                          ICD-10: {triageAnalysis.billing_data.icd_10_code}
                        </span>
                        <span className="text-xs text-zinc-300 font-medium italic">
                          — {triageAnalysis.billing_data.icd_10_description || 'Unspecified Medical Condition'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded">
                        Phase 1: Automated Coding Active
                      </span>
                    </div>
                  )}
                </div>

                {/* AI EDUCATIONAL TRIAGE EVALUATION RESULTS */}
                {triageAnalysis && (
                  <div className="bg-[#121212] border border-[#262626] rounded-xl p-6 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#262626] pb-4">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Triage Severity Evaluation</span>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <Activity className="w-3.5 h-3.5" />
                            {triageAnalysis.severity || 'Moderate'} Urgency
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-zinc-500">Evaluated by CareFlow AI Assistant</span>
                    </div>

                    {triageAnalysis.summary && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-zinc-300">Clinical Evaluation Summary</h3>
                        <p className="text-xs text-zinc-300 leading-relaxed bg-[#171717] border border-[#262626] p-4 rounded-lg">
                          {triageAnalysis.summary}
                        </p>
                      </div>
                    )}

                    {Array.isArray(triageAnalysis.differentialDiagnoses) && triageAnalysis.differentialDiagnoses.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                          Potential Educational Differential Diagnoses
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {triageAnalysis.differentialDiagnoses.map((diag: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2.5 bg-[#171717] border border-[#262626] p-3 rounded-lg text-xs text-zinc-200">
                              <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                              <span>{diag}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {triageAnalysis.recommendedAction && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                          Recommended Next Action
                        </h3>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg text-xs font-medium text-emerald-300 flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>{triageAnalysis.recommendedAction}</div>
                        </div>
                      </div>
                    )}

                    {triageAnalysis.disclaimer && (
                      <div className="bg-[#161616] border border-[#262626] p-3.5 rounded-lg flex items-start gap-2.5 text-[11px] text-zinc-400">
                        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          <span className="font-semibold text-zinc-300 block mb-0.5">Educational Triage Disclaimer</span>
                          {triageAnalysis.disclaimer}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
