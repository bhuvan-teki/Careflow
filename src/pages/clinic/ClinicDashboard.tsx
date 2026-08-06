import { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import api from '../../lib/api';
import { 
  Hospital, 
  User, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  ListChecks, 
  ClipboardList, 
  Clock, 
  CheckCircle2,
  LogOut,
  Building2,
  Inbox
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ClinicDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [liveCases, setLiveCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [aiAssistantOutput, setAiAssistantOutput] = useState<any>(null);
  const [isRunningAI, setIsRunningAI] = useState(false);

  // Poll live patient consultations from MongoDB database every 3 seconds
  useEffect(() => {
    fetchLiveCases();
    const interval = setInterval(fetchLiveCases, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveCases = async () => {
    try {
      const res = await api.get('/consultations/active');
      if (res.data.success && Array.isArray(res.data.consultations)) {
        setLiveCases(res.data.consultations);
        setSelectedCase((prev: any) => {
          if (prev) {
            const current = res.data.consultations.find((c: any) => c._id === prev._id);
            return current || res.data.consultations[0] || null;
          }
          return res.data.consultations[0] || null;
        });
      }
    } catch (err) {
      console.error('Failed to load live clinic consultations:', err);
    }
  };

  // Run Clinic AI Assistant actions for hospital staff
  const handleRunClinicAI = async (actionType: 'summarize' | 'next_actions' | 'visit_notes' | 'consultation_doc') => {
    if (!selectedCase) return;

    setIsRunningAI(true);
    try {
      const res = await api.post('/workflow/clinic-ai-assistant', {
        consultationId: selectedCase._id,
        actionType
      });

      if (res.data.success) {
        setAiAssistantOutput(res.data.insights);
        toast({
          title: "Clinic AI Assistant Executed",
          description: `Generated ${res.data.insights.title} for staff intake.`,
          type: "success"
        });
      }
    } catch (err: any) {
      toast({
        title: "AI Action Failed",
        description: "Could not generate insights",
        type: "error"
      });
    } finally {
      setIsRunningAI(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-zinc-100 overflow-hidden font-sans select-none">
      {/* Clinic Left Sidebar (Theme matched to Patient View) */}
      <aside className="w-80 bg-[#0D0D0D] border-r border-[#262626] flex flex-col h-screen select-none z-20">
        {/* Brand Header */}
        <div className="p-4 border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Hospital className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white tracking-tight">CareFlow Clinic</h1>
              <p className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">Hospital Staff View</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/patient/dashboard')}
            className="text-xs text-zinc-300 hover:text-white bg-[#1A1A1A] hover:bg-zinc-800 px-2.5 py-1 rounded-lg border border-[#262626] transition-colors font-medium"
            title="Switch to Patient View"
          >
            Patient ➔
          </button>
        </div>

        {/* Incoming Connected Cases List Header */}
        <div className="px-4 py-3 bg-[#121212] border-b border-[#262626] flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Connected Cases ({liveCases.length})
          </span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Queue</span>
          </span>
        </div>

        {/* Live Patient Cases List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {liveCases.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500 space-y-2">
              <Inbox className="h-8 w-8 text-zinc-600 mx-auto" />
              <p className="text-zinc-400 font-medium">No active patient cases in queue.</p>
              <span className="text-[10px] text-zinc-500 block">Waiting for live symptom submissions...</span>
            </div>
          ) : (
            liveCases.map((item) => {
              const isSelected = selectedCase?._id === item._id;
              const patientName = item.patientId?.firstName 
                ? `${item.patientId.firstName} ${item.patientId.lastName || ''}` 
                : 'Patient Triage Case';

              return (
                <div
                  key={item._id}
                  onClick={() => {
                    setSelectedCase(item);
                    setAiAssistantOutput(null);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/20' 
                      : 'bg-[#121212] border-[#262626] hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      {item.patientId?.avatarUrl ? (
                        <img src={item.patientId.avatarUrl} alt="Patient" className="h-8 w-8 rounded-lg object-cover ring-1 ring-white/10" />
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-xs text-purple-300 border border-zinc-700">
                          {patientName[0]}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-tight line-clamp-1">{patientName}</h4>
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3 text-zinc-500" />
                          {new Date(item.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase ${
                      item.aiAnalysis?.urgency === 'High' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                      'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {item.aiAnalysis?.urgency || 'Medium'}
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#262626] text-[11px] text-zinc-400 truncate">
                    <span className="font-semibold text-purple-300">{item.aiAnalysis?.recommendedDepartment || 'General Physician'}</span>: {item.aiAnalysis?.symptoms?.join(', ') || item.rawPatientInput}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Staff Footer */}
        <div className="p-3 border-t border-[#262626] bg-[#0D0D0D]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#121212] border border-[#262626] text-xs text-zinc-400">
            <span className="font-medium text-white truncate max-w-[170px]">{user?.clinicName || 'CareFlow Central Hospital'}</span>
            <button onClick={() => { logout(); navigate('/'); }} className="text-zinc-400 hover:text-rose-400 shrink-0">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#0A0A0A]">
        <Header />

        {selectedCase ? (
          <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
            {/* Patient Header Details */}
            <div className="bg-[#121212] border border-[#262626] rounded-xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xl">
                  {selectedCase.patientId?.firstName?.[0] || 'P'}
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-black text-white">
                      {selectedCase.patientId?.firstName ? `${selectedCase.patientId.firstName} ${selectedCase.patientId.lastName || ''}` : 'Patient Triage Case'}
                    </h2>
                    <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      Live Database Connected
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Consultation ID: <span className="font-mono text-zinc-300">{selectedCase._id}</span> • Email: {selectedCase.patientId?.email || 'patient@careflow.health'}
                  </p>
                </div>
              </div>

              {/* Triage Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-purple-400" />
                  <span>{selectedCase.aiAnalysis?.recommendedDepartment || 'General Physician'}</span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>{selectedCase.aiAnalysis?.urgency || 'Medium'} Urgency</span>
                </div>
              </div>
            </div>

            {/* Case Summary & Raw Narrative Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pre-Analyzed AI Intake Summary */}
              <div className="bg-[#121212] border border-[#262626] rounded-xl p-5 shadow-xl space-y-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  Pre-Analyzed Clinical Intake Summary
                </h3>
                <p className="text-xs text-zinc-200 leading-relaxed font-mono bg-[#181818] p-4 rounded-xl border border-[#262626]">
                  {selectedCase.aiAnalysis?.aiSummary || 'Patient submitted symptoms for clinical triage review.'}
                </p>
                <div className="flex flex-wrap gap-2 text-xs pt-1">
                  <span className="font-semibold text-zinc-400">Symptoms:</span>
                  {(selectedCase.aiAnalysis?.symptoms || ['Fever', 'Symptom Intake']).map((s: string, idx: number) => (
                    <span key={idx} className="bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Raw Patient Input */}
              <div className="bg-[#121212] border border-[#262626] rounded-xl p-5 shadow-xl space-y-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-400" />
                  Raw Patient Narrative
                </h3>
                <div className="p-4 rounded-xl bg-[#181818] border border-[#262626] text-xs text-zinc-300 italic font-sans">
                  "{selectedCase.rawPatientInput || selectedCase.rawPatientNarrative || 'Symptom description submitted.'}"
                </div>
                <div className="text-xs text-zinc-400 pt-1">
                  <span className="font-semibold text-zinc-300">Duration:</span> {selectedCase.aiAnalysis?.duration || '1-2 Days'} • <span className="font-semibold text-zinc-300">Reported Severity:</span> {selectedCase.aiAnalysis?.severity || 'Moderate'}
                </div>
              </div>
            </div>

            {/* CLINIC AI ASSISTANT ACTION BAR */}
            <div className="bg-[#121212] border border-[#262626] rounded-xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    CareFlow Staff AI Assistant
                  </h3>
                  <p className="text-xs text-zinc-400">Automate hospital staff documentation and next operational steps.</p>
                </div>

                {isRunningAI && (
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 animate-pulse">
                    <Sparkles className="h-4 w-4 animate-spin" />
                    Processing AI Insights...
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => handleRunClinicAI('summarize')}
                  disabled={isRunningAI}
                  className="flex items-center justify-center space-x-2 bg-[#1A1A1A] hover:bg-zinc-800 border border-[#262626] text-xs font-bold text-white p-3 rounded-xl transition-all"
                >
                  <FileText className="h-4 w-4 text-purple-400 shrink-0" />
                  <span>Summarize Case</span>
                </button>

                <button
                  onClick={() => handleRunClinicAI('next_actions')}
                  disabled={isRunningAI}
                  className="flex items-center justify-center space-x-2 bg-[#1A1A1A] hover:bg-zinc-800 border border-[#262626] text-xs font-bold text-white p-3 rounded-xl transition-all"
                >
                  <ListChecks className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Suggest Next Actions</span>
                </button>

                <button
                  onClick={() => handleRunClinicAI('visit_notes')}
                  disabled={isRunningAI}
                  className="flex items-center justify-center space-x-2 bg-[#1A1A1A] hover:bg-zinc-800 border border-[#262626] text-xs font-bold text-white p-3 rounded-xl transition-all"
                >
                  <ClipboardList className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Generate Visit Notes</span>
                </button>

                <button
                  onClick={() => handleRunClinicAI('consultation_doc')}
                  disabled={isRunningAI}
                  className="flex items-center justify-center space-x-2 bg-[#1A1A1A] hover:bg-zinc-800 border border-[#262626] text-xs font-bold text-white p-3 rounded-xl transition-all"
                >
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Handover Summary</span>
                </button>
              </div>

              {/* Generated AI Assistant Output Card */}
              {aiAssistantOutput && (
                <div className="mt-4 p-5 rounded-xl bg-[#181818] border border-[#262626] animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <h4 className="text-sm font-extrabold text-purple-300 mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {aiAssistantOutput.title}
                  </h4>

                  <p className="text-xs text-zinc-200 whitespace-pre-line font-mono mb-3 bg-[#121212] p-3 rounded-lg border border-[#262626]">
                    {aiAssistantOutput.content}
                  </p>

                  {aiAssistantOutput.bulletPoints && aiAssistantOutput.bulletPoints.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[#262626]">
                      <span className="text-[11px] font-bold text-purple-300 block uppercase tracking-wider">Action Items:</span>
                      {aiAssistantOutput.bulletPoints.map((pt: string, idx: number) => (
                        <div key={idx} className="text-xs text-zinc-300 flex items-center space-x-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-zinc-500 text-sm space-y-3">
            <Inbox className="h-10 w-10 text-zinc-600" />
            <p className="text-zinc-400 font-medium">Select a patient from the live queue to begin clinical intake review.</p>
          </div>
        )}
      </div>
    </div>
  );
}
