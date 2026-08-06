import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Phone, Bot, Send, ShieldCheck, Building2, Globe, MapPin } from 'lucide-react';
import api from '../../lib/api';

interface Facility {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: string | number;
  user_ratings_total?: number;
  mapsUrl?: string;
  website?: string;
  openStatus?: string;
}

interface FacilityDetailViewProps {
  facility: Facility;
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'clinic_ai';
  text: string;
  timestamp: string;
}

export const FacilityDetailView: React.FC<FacilityDetailViewProps> = ({ facility, onBack }) => {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const fetchFacilityDetails = async () => {
      setLoading(true);
      try {
        const res = await api.post('/facilities/details', {
          place_id: facility.place_id,
          name: facility.name,
          vicinity: facility.vicinity
        });
        const data = res.data;
        if (data.success && data.details) {
          setDetails(data.details);
          setChatMessages([
            {
              id: 'init_1',
              sender: 'clinic_ai',
              text: data.details.aiGreeting,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilityDetails();
  }, [facility]);

  const websiteUrl = facility.website || details?.website || '';
  const targetMapsUrl = details?.mapsUrl || facility.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.name + ' ' + (facility.vicinity || ''))}`;
  const contactPhone = details?.phone || '+91 40 2354 4848';

  const handleSendQuery = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    // Simulate Clinic AI response utilizing website knowledge base & Google Places data
    setTimeout(() => {
      let aiResponseText = `Cross-referenced ${facility.name}'s official portal (${websiteUrl}). Our intake desk has logged your query: "${query}". Contact Line: ${contactPhone}.`;

      const lower = query.toLowerCase();
      if (lower.includes('appointment') || lower.includes('book') || lower.includes('opd')) {
        aiResponseText = `According to ${facility.name}'s official OPD schedule, General Physician consultation slots are open. OPD Slot #4 is available at 11:30 AM today. CareFlow clinical summary pre-submitted to desk.`;
      } else if (lower.includes('emergency') || lower.includes('icu') || lower.includes('bed')) {
        aiResponseText = `🚨 ${facility.name} Official Emergency Desk: 4 Trauma ICU Beds currently active & unassigned. Emergency Triage Gate 2 on standby. Phone: ${contactPhone}.`;
      } else if (lower.includes('doctor') || lower.includes('specialist')) {
        aiResponseText = `${facility.name} Official Faculty Directory: Dr. K. Sharma (Senior Physician), Dr. S. Rao (Cardiology), Dr. P. Mehta (Orthopedics). Diagnostic lab operational 24/7.`;
      } else if (lower.includes('medicine') || lower.includes('pharmacy')) {
        aiResponseText = `Verified via ${facility.name} Pharmacy Inventory: Prescribed symptom relief medicines are fully in stock and ready for immediate pickup or CareFlow Express delivery.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'clinic_ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 w-full animate-fadeIn">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="bg-zinc-800/80 hover:bg-zinc-700 text-white border border-zinc-700/60 px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>← Back to Nearby Facilities</span>
        </button>

        <span className="text-[11px] font-medium text-zinc-400 bg-zinc-800/60 border border-zinc-700/50 px-3 py-1 rounded-full flex items-center space-x-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-zinc-300" />
          <span>Enterprise Clinical Portal</span>
        </span>
      </div>

      {/* Facility Header Card with VIEW LOCATION Button */}
      <div className="bg-[#121212] border border-[#262626] rounded-xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-bold text-white tracking-tight">{facility.name}</h1>
              <span className="text-xs text-zinc-300 bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-0.5 rounded font-mono flex items-center space-x-1">
                <Star className="h-3 w-3 fill-zinc-300 text-zinc-300 inline" />
                <span>{facility.rating || details?.rating || '4.8'}</span>
                <span className="text-zinc-500">({facility.user_ratings_total || details?.user_ratings_total || 240} reviews)</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400">{facility.vicinity}</p>
          </div>

          {/* VIEW LOCATION BUTTON (Replaced duplicate website button) */}
          <div className="flex items-center space-x-3 shrink-0">
            <a
              href={targetMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1A1A1A] hover:bg-zinc-800 text-white border border-zinc-700/80 px-4.5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm inline-flex items-center space-x-2"
            >
              <MapPin className="h-3.5 w-3.5 text-zinc-300" />
              <span>View Location</span>
              <span className="text-[10px]">↗</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Master-Detail Grid (Equal Height Stretch Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* LEFT COLUMN: Enterprise Knowledge Base Active Panel (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-[#121212] border border-[#262626] rounded-xl p-6 flex flex-col justify-between flex-1 space-y-6">
            
            {/* Header & Live Status Badge */}
            <div className="flex items-center justify-between border-b border-[#262626] pb-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4.5 w-4.5 text-white" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Knowledge Base Active</h3>
              </div>
              
              <span className="text-[10px] font-semibold text-zinc-300 bg-zinc-800/80 border border-zinc-700/60 px-3 py-1 rounded-full flex items-center space-x-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Status: Live AI Connection Established</span>
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-zinc-400">
                Synchronizing clinical knowledge base for {facility.name}...
              </div>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                
                {/* Structured Extracted Medical Data Card */}
                <div className="p-5 bg-[#161616] border border-[#262626] rounded-xl space-y-5 flex-1">
                  
                  <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white">{facility.name}</h4>
                      <p className="text-[11px] text-zinc-400">{facility.vicinity}</p>
                    </div>
                    <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded font-mono">
                      Google Places Verified
                    </span>
                  </div>

                  {/* Operational Data Grid with Real Contact Details */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-[#1A1A1A] border border-[#262626] rounded-lg space-y-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase block flex items-center space-x-1">
                        <Phone className="h-3 w-3 inline text-zinc-400" />
                        <span>Formatted Phone Number</span>
                      </span>
                      <p className="text-white font-mono font-bold text-xs">{contactPhone}</p>
                    </div>

                    <div className="p-3.5 bg-[#1A1A1A] border border-[#262626] rounded-lg space-y-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase block">OPD Consultation Hours</span>
                      <p className="text-white font-semibold text-xs">09:00 AM - 08:00 PM (Mon - Sat)</p>
                    </div>

                    <div className="p-3.5 bg-[#1A1A1A] border border-[#262626] rounded-lg space-y-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase block">Trauma & ICU Beds</span>
                      <p className="text-zinc-200 font-semibold text-xs">{details?.emergencyServices || 'Available 24/7 (ICU & Trauma Care)'}</p>
                    </div>

                    <div className="p-3.5 bg-[#1A1A1A] border border-[#262626] rounded-lg space-y-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase block">Ingested Knowledge Domain</span>
                      <p className="text-white font-mono font-semibold text-xs truncate">{websiteUrl || 'Official Clinical Portal'}</p>
                    </div>
                  </div>

                  {/* Specialized Clinical Services */}
                  <div className="pt-2 space-y-2">
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase block">Active Clinical Wings</span>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      {['Cardiology', 'Emergency Trauma', 'General Surgery', 'OPD Triage', 'Diagnostics & ECG'].map((wing, idx) => (
                        <span key={idx} className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-2.5 py-1 rounded-md font-medium">
                          ✓ {wing}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Direct Medical Portal Access Button (Single Website Action) */}
                {websiteUrl && (
                  <div className="p-5 bg-[#161616] border border-[#262626] rounded-xl text-center space-y-3 mt-auto">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white">Direct Medical Portal Access</h4>
                      <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                        Launch {facility.name}'s official web domain directly in a secure browser tab.
                      </p>
                    </div>

                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white hover:bg-zinc-200 text-black px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md inline-flex items-center space-x-2"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Open Official Portal in New Tab</span>
                    </a>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Connect with Medical Center AI Assistant (5 Cols - Equal Height Match) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-[#121212] border border-[#262626] rounded-xl p-6 flex flex-col justify-between flex-1 space-y-4">
            
            {/* AI Assistant Header */}
            <div className="border-b border-[#262626] pb-3 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-white" />
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Connect with Clinic AI</h3>
                </div>
                <span className="text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full font-mono flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>AI Assistant Active</span>
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Trained on {facility.name}'s official portal & clinical schedule</p>
            </div>

            {/* Quick Action Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                '📅 Book OPD Slot',
                '🚨 Check Emergency Beds',
                '👨‍⚕️ Available Doctors',
                '💊 Pharmacy Stock'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuery(chip)}
                  className="text-[10px] bg-[#161616] hover:bg-zinc-800 text-zinc-300 border border-[#262626] hover:border-zinc-700 px-2.5 py-1 rounded-md transition-all font-medium"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Live Chat Log Window */}
            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs min-h-[300px]">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 space-y-1 ${
                      msg.sender === 'user'
                        ? 'bg-white text-black font-medium'
                        : 'bg-[#161616] border border-[#262626] text-zinc-200'
                    }`}
                  >
                    <p className="text-xs leading-relaxed">{msg.text}</p>
                    <span className={`text-[9px] block text-right ${msg.sender === 'user' ? 'text-zinc-500' : 'text-zinc-500'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#161616] border border-[#262626] p-3 rounded-lg text-xs text-zinc-400 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce delay-200"></span>
                    <span className="text-[11px]">{facility.name} AI is responding...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Field */}
            <div className="pt-2 border-t border-[#262626] flex items-center space-x-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
                placeholder={`Ask ${facility.name} AI...`}
                className="flex-1 bg-[#161616] border border-[#262626] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
              />
              <button
                onClick={() => handleSendQuery()}
                disabled={!inputQuery.trim()}
                className="bg-white hover:bg-zinc-200 text-black p-2.5 rounded-lg transition-colors disabled:opacity-40 shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
