import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { FacilityDetailView } from '../../components/patient/FacilityDetailView';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { 
  Activity, 
  ShoppingBag, 
  MapPin, 
  CheckCircle2, 
  Plus, 
  Minus, 
  CreditCard, 
  Truck, 
  KeyRound, 
  Sparkles, 
  Send,
  FileText
} from 'lucide-react';

interface AssessmentForm {
  patientType: 'Self' | 'Child' | 'Adult' | 'Elderly';
  ageGender: string;
  symptomStart: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  additionalSymptoms: string;
  medicalConditions: string;
}

interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  requiresPrescription: boolean;
}

export function PatientDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  // State Management for 10-Step Journey
  const [phase, setPhase] = useState<'intake' | 'assessment' | 'summary' | 'checkout' | 'tracking'>('intake');
  const [initialComplaint, setInitialComplaint] = useState('');
  const [currentQuestionStep, setCurrentQuestionStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 6 Structured Questions Form State
  const [assessmentData, setAssessmentData] = useState<AssessmentForm>({
    patientType: 'Self',
    ageGender: '45 years, male',
    symptomStart: '2 days ago',
    severity: 'Moderate',
    additionalSymptoms: 'Body pain, Mild fever',
    medicalConditions: 'No known allergies'
  });

  // Discovery & Marketplace State
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [hasSharedLocation, setHasSharedLocation] = useState(false);
  const [realPharmacies, setRealPharmacies] = useState<any[]>([]);
  const [realHospitals, setRealHospitals] = useState<any[]>([]);

  const [otcProducts] = useState<CartItem[]>([
    { id: 'item_1', name: 'Paracetamol 500mg (20 Tab)', category: 'Fever & Pain Relief', price: 40, quantity: 1, requiresPrescription: false },
    { id: 'item_2', name: 'ORS Electrolyte Packets (5 Sachets)', category: 'Hydration & Recovery', price: 60, quantity: 1, requiresPrescription: false },
    { id: 'item_3', name: 'Digital Clinical Thermometer', category: 'Health Monitoring', price: 150, quantity: 1, requiresPrescription: false },
    { id: 'item_4', name: 'Cough & Throat Relief Syrup 100ml', category: 'Respiratory Relief', price: 85, quantity: 1, requiresPrescription: false },
    { id: 'item_5', name: 'Vitamin C 500mg & Zinc Chewables', category: 'Immune Support', price: 120, quantity: 1, requiresPrescription: false }
  ]);

  // Two-Step Geolocation & Places API discovery
  const handleFetchNearbyFacilities = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation Unsupported", description: "Browser does not support geolocation.", type: "error" });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const [hospRes, pharmRes] = await Promise.all([
            api.post('/facilities/nearby', { lat: latitude, lng: longitude, type: 'hospital' }),
            api.post('/facilities/nearby', { lat: latitude, lng: longitude, type: 'pharmacy' })
          ]);

          if (hospRes.data.success && Array.isArray(hospRes.data.results)) {
            setRealHospitals(hospRes.data.results);
          }
          if (pharmRes.data.success && Array.isArray(pharmRes.data.results)) {
            setRealPharmacies(pharmRes.data.results);
            if (pharmRes.data.results.length > 0) {
              setSelectedPharmacy(pharmRes.data.results[0]);
            }
          }

          setHasSharedLocation(true);
          toast({ title: "Location Discovered!", description: "Fetched real nearby facilities around your live location.", type: "success" });
        } catch (err: any) {
          console.error("Failed to fetch nearby facilities:", err);
          toast({ title: "Discovery Error", description: "Could not fetch nearby facilities.", type: "error" });
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        console.error("Geolocation error:", error);
        toast({ title: "Location Permission Denied", description: "Please allow location access to discover nearby healthcare.", type: "error" });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Order & Checkout Form State
  const [patientDetails, setPatientDetails] = useState({
    name: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Bhuvan Teki',
    phone: '+91 98765 43210',
    deliveryAddress: 'Flat 402, Green Valley Apartments, Sector 4',
    age: '45'
  });
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Wallet' | 'COD'>('COD');
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [otpInput, setOtpInput] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      if (user?.id) {
        const historyRes = await api.get(`/workflow/consultations/patient/${user.id}`);
        if (historyRes.data.success) {
          const formatted = historyRes.data.consultations.map((c: any) => ({
            id: c._id,
            title: c.aiAnalysis?.symptoms?.join(', ') || c.rawPatientInput,
            date: new Date(c.createdAt).toLocaleDateString(),
            urgency: c.aiAnalysis?.urgency || 'Medium'
          }));
          setHistory(formatted);
        }
      }
    } catch (err) {
      console.error('Failed to load history:', err);
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
    try {
      const fullNarrative = `${initialComplaint}. Patient: ${assessmentData.patientType} (${assessmentData.ageGender || 'Adult'}). Onset: ${assessmentData.symptomStart || '1-2 Days'}, Severity: ${assessmentData.severity || 'Moderate'}. Symptoms: ${assessmentData.additionalSymptoms || initialComplaint}. History: ${assessmentData.medicalConditions || 'None'}`;
      const res = await api.post('/workflow/analyze', {
        patientMessage: fullNarrative,
        patientId: user?.id || '65f1a2b3c4d5e6f7a8b9c0d1'
      });
      if (res.data.success) {
        fetchInitialData();
      }
    } catch (err) {
      console.error('Failed to save consultation to database:', err);
    }
  };

  // Cart Management
  const handleAddToCart = (product: CartItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast({ title: "Added to Cart", description: `${product.name} added to cart.`, type: "success" });
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Step 7 & 8: Place Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast({ title: "Cart Empty", description: "Please add products to your cart before placing an order.", type: "error" });
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await api.post('/orders/create', {
        patientId: user?.id || 'demo_patient_1',
        pharmacyId: selectedPharmacy?.id || 'pharm_1',
        pharmacyName: selectedPharmacy?.name || 'Apollo Pharmacy Partner',
        items: cart,
        totalAmount: cartTotal,
        patientDetails,
        paymentMethod
      });

      if (res.data.success) {
        setActiveOrder(res.data.order);
        setPhase('tracking');
        toast({ title: "Order Placed!", description: `Order ${res.data.order.orderId} created successfully.`, type: "success" });
      }
    } catch (err: any) {
      toast({ title: "Order Failed", description: err.response?.data?.message || "Failed to create order.", type: "error" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step 10: Verify OTP Code
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim() || !activeOrder?.orderId) return;

    setIsVerifyingOtp(true);
    try {
      const res = await api.post('/orders/verify-otp', {
        orderId: activeOrder.orderId,
        otpCode: otpInput.trim()
      });

      if (res.data.success) {
        setActiveOrder(res.data.order);
        toast({ title: "Delivery Verified!", description: "Order successfully delivered & verified via OTP.", type: "success" });
      }
    } catch (err: any) {
      toast({ title: "Verification Failed", description: err.response?.data?.message || "Invalid OTP code.", type: "error" });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleNewConsultation = () => {
    setPhase('intake');
    setInitialComplaint('');
    setCurrentQuestionStep(1);
    setCart([]);
    setActiveOrder(null);
  };

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-zinc-100 overflow-hidden font-sans select-none">
      {/* Left Sidebar */}
      <Sidebar
        onNewConsultation={handleNewConsultation}
        history={history}
        activeConsultationId={undefined}
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

            {/* STEP 1: INITIAL CONDITION INTAKE */}
            {phase === 'intake' && (
              <div className="pt-20 text-center space-y-6">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <Activity className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    CareFlow AI Medical Intake & Care Automation
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                    Describe your condition to initiate a structured 6-question clinical assessment.
                  </p>
                </div>

                <form onSubmit={handleStartIntake} className="max-w-xl mx-auto space-y-3">
                  <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-2 focus-within:border-zinc-700 transition-colors shadow-2xl">
                    <textarea
                      value={initialComplaint}
                      onChange={(e) => setInitialComplaint(e.target.value)}
                      placeholder="Example: My father has fever and headache from yesterday..."
                      rows={3}
                      className="w-full bg-transparent border-0 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none resize-none"
                    />
                    <div className="flex justify-end pr-2 pb-2">
                      <button
                        type="submit"
                        disabled={!initialComplaint.trim()}
                        className="bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-30"
                      >
                        <span>Start Clinical Assessment</span>
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
                      className="w-full bg-white text-black py-3 rounded-xl text-xs font-bold transition-all hover:bg-zinc-200"
                    >
                      Generate Concise Patient Summary & Discover Healthcare ➔
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
                      <p className="text-white font-semibold">General Physician</p>
                    </div>
                  </div>
                </div>

                {/* NEARBY HEALTHCARE OPERATIONS (Master-Detail Pattern with FacilityDetailView) */}
                {selectedFacility ? (
                  <FacilityDetailView 
                    facility={selectedFacility} 
                    onBack={() => setSelectedFacility(null)} 
                  />
                ) : (
                  <div className="bg-[#121212] border border-[#262626] rounded-xl p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-white" />
                        <h2 className="text-sm font-semibold tracking-wide text-white uppercase">Nearby Healthcare Discovery</h2>
                      </div>
                      {hasSharedLocation && (
                        <span className="text-[11px] font-medium text-zinc-300 bg-zinc-800/60 border border-zinc-700/50 px-2.5 py-1 rounded">
                          GPS Active (Google Places API)
                        </span>
                      )}
                    </div>

                    {!hasSharedLocation ? (
                      <div className="py-8 text-center space-y-4">
                        <p className="text-xs text-zinc-400 max-w-md mx-auto">
                          Share your GPS location to discover verified nearby hospitals, emergency centers, and partner pharmacies via Google Maps Places API.
                        </p>
                        <button
                          onClick={handleFetchNearbyFacilities}
                          disabled={isLocating}
                          className="bg-white hover:bg-zinc-200 text-black px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md inline-flex items-center space-x-2 disabled:opacity-50"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{isLocating ? 'Acquiring GPS Location...' : '📍 Share Location to Find Nearby Clinics & Pharmacies'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        
                        {/* Nearby Hospitals Operations Table */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Verified Nearby Hospitals & Medical Clinics</h3>
                          
                          <div className="border border-[#262626] rounded-lg divide-y divide-[#262626] bg-[#161616]">
                            {realHospitals.map((hosp: any) => {
                              return (
                                <div key={hosp.place_id || hosp.name} className="p-4 flex items-center justify-between hover:bg-[#1A1A1A] transition-colors">
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-3">
                                      <h4 className="text-xs font-bold text-white">{hosp.name}</h4>
                                      <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded font-mono">
                                        ★ {hosp.rating} ({hosp.user_ratings_total || 140} reviews)
                                      </span>
                                    </div>
                                    <p className="text-xs text-zinc-400">{hosp.vicinity}</p>
                                  </div>

                                  <button
                                    onClick={() => setSelectedFacility(hosp)}
                                    className="bg-white hover:bg-zinc-200 text-black border border-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ml-4 inline-flex items-center space-x-1"
                                  >
                                    <span>View</span>
                                    <span className="text-[10px]">➔</span>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Nearby Partner Pharmacies Table */}
                        <div className="space-y-3 pt-2">
                          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Verified Nearby Partner Pharmacies</h3>
                          
                          <div className="border border-[#262626] rounded-lg divide-y divide-[#262626] bg-[#161616]">
                            {realPharmacies.map((pharm: any) => {
                              const isSelected = selectedPharmacy?.place_id === pharm.place_id || selectedPharmacy?.name === pharm.name;
                              return (
                                <div 
                                  key={pharm.place_id || pharm.name} 
                                  onClick={() => setSelectedPharmacy(pharm)}
                                  className={`p-4 flex items-center justify-between transition-colors cursor-pointer ${
                                    isSelected ? 'bg-zinc-800/50' : 'hover:bg-[#1A1A1A]'
                                  }`}
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-3">
                                      <h4 className="text-xs font-bold text-white">{pharm.name}</h4>
                                      <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded font-mono">
                                        ★ {pharm.rating} ({pharm.user_ratings_total || 120} reviews)
                                      </span>
                                      <span className="text-[10px] text-zinc-500 font-medium">• {pharm.openStatus || 'Open Now'}</span>
                                    </div>
                                    <p className="text-xs text-zinc-400">{pharm.vicinity}</p>
                                  </div>

                                  <div className="flex items-center space-x-2 shrink-0 ml-4">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFacility(pharm);
                                      }}
                                      className="bg-white hover:bg-zinc-200 text-black border border-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center space-x-1"
                                    >
                                      <span>View</span>
                                      <span className="text-[10px]">➔</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                )}

                {/* OTC MEDICINE MARKETPLACE (Clean Monochrome Operational Card) */}
                <div className="bg-[#121212] border border-[#262626] rounded-xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                    <div className="flex items-center space-x-2">
                      <ShoppingBag className="h-4 w-4 text-white" />
                      <h2 className="text-sm font-semibold tracking-wide text-white uppercase">OTC Product Recommendation Marketplace</h2>
                    </div>
                    <span className="text-xs text-zinc-400">
                      Selected Partner: <strong className="text-white font-medium">{selectedPharmacy?.name || 'Apollo Pharmacy'}</strong>
                    </span>
                  </div>

                  {/* Product Inventory Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {otcProducts.map(prod => (
                      <div key={prod.id} className="p-4 bg-[#161616] border border-[#262626] rounded-lg flex items-center justify-between hover:border-zinc-700 transition-colors">
                        <div>
                          <h4 className="font-bold text-white text-xs">{prod.name}</h4>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{prod.category}</p>
                          <span className="text-xs font-bold text-white mt-1.5 block">₹{prod.price}</span>
                        </div>

                        <button
                          onClick={() => handleAddToCart(prod)}
                          className="bg-white hover:bg-zinc-200 text-black px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        >
                          + Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Cart Action Footer */}
                  {cart.length > 0 && (
                    <div className="pt-4 border-t border-[#262626] flex items-center justify-between">
                      <div>
                        <span className="text-xs text-zinc-400">Cart Total ({cart.length} items):</span>
                        <h4 className="text-base font-bold text-white">₹{cartTotal}</h4>
                      </div>
                      <button
                        onClick={() => setPhase('checkout')}
                        className="bg-white hover:bg-zinc-200 text-black px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md"
                      >
                        Proceed to Checkout ➔
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* STEP 7 & 8: CART, USER DETAILS & PAYMENT */}
            {phase === 'checkout' && (
              <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">CareFlow Cart Checkout & Delivery Details</h3>
                  </div>
                  <button
                    onClick={() => setPhase('summary')}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    ← Back to Marketplace
                  </button>
                </div>

                {/* Cart Item Summary */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Itemized Cart Order:</h4>
                  <div className="space-y-2">
                    {cart.map(item => (
                      <div key={item.id} className="p-3 bg-[#171717] border border-[#2A2A2A] rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <h5 className="font-semibold text-white">{item.name}</h5>
                          <span className="text-zinc-400">₹{item.price} x {item.quantity}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleUpdateCartQuantity(item.id, -1)}
                            className="p-1 text-zinc-400 hover:text-white bg-[#111111] rounded border border-[#2A2A2A]"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-bold text-white px-1">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateCartQuantity(item.id, 1)}
                            className="p-1 text-zinc-400 hover:text-white bg-[#111111] rounded border border-[#2A2A2A]"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-2 text-sm font-bold text-white">
                    <span>Total Amount:</span>
                    <span className="text-emerald-400">₹{cartTotal}</span>
                  </div>
                </div>

                {/* Patient Delivery Form */}
                <form onSubmit={handlePlaceOrder} className="space-y-4 pt-2">
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Delivery Details:</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-zinc-400 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={patientDetails.name}
                        onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })}
                        className="w-full bg-[#171717] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={patientDetails.phone}
                        onChange={(e) => setPatientDetails({ ...patientDetails, phone: e.target.value })}
                        className="w-full bg-[#171717] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Delivery Address</label>
                    <input
                      type="text"
                      value={patientDetails.deliveryAddress}
                      onChange={(e) => setPatientDetails({ ...patientDetails, deliveryAddress: e.target.value })}
                      className="w-full bg-[#171717] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>

                  {/* Payment Options (Step 8) */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-zinc-300 block">Select Payment Method:</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {(['UPI', 'Card', 'Wallet', 'COD'] as const).map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            paymentMethod === method 
                              ? 'bg-emerald-500/10 border-emerald-500 text-white font-bold' 
                              : 'bg-[#171717] border-[#2A2A2A] text-zinc-400 hover:border-zinc-600'
                          }`}
                        >
                          <span className="text-xs">{method === 'COD' ? 'Cash on Delivery' : method}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-black py-3 rounded-xl text-xs font-bold transition-all shadow-xl"
                  >
                    {isAnalyzing ? 'Creating Order...' : `Confirm & Place Order (₹${cartTotal}) ➔`}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 9 & 10: DELIVERY INTEGRATION & OTP VERIFICATION */}
            {phase === 'tracking' && activeOrder && (
              <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">Live Order Tracking & Delivery Status</h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                    Order ID: {activeOrder.orderId}
                  </span>
                </div>

                {/* Delivery Progress Timeline (Step 9) */}
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-semibold">
                      1. Order Created
                    </div>
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-semibold">
                      2. Pharmacy Packed
                    </div>
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-semibold">
                      3. Out for Delivery
                    </div>
                    <div className={`p-2 rounded-lg border font-semibold ${
                      activeOrder.isVerified 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-[#171717] border-[#2A2A2A] text-zinc-500'
                    }`}>
                      4. Delivered
                    </div>
                  </div>

                  <div className="p-4 bg-[#171717] border border-[#2A2A2A] rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-zinc-500 block">Assigned Partner</span>
                      <strong className="text-white text-xs">{activeOrder.deliveryPartner} (Blinkit / Zepto Network)</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Payment Option</span>
                      <strong className="text-white text-xs">{activeOrder.paymentMethod} (₹{activeOrder.totalAmount})</strong>
                    </div>
                  </div>
                </div>

                {/* STEP 10: OTP VERIFICATION PANEL */}
                <div className="p-5 bg-[#171717] border border-emerald-500/30 rounded-xl space-y-4">
                  <div className="flex items-center space-x-2">
                    <KeyRound className="h-5 w-5 text-emerald-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">4-Digit Delivery Verification OTP</h4>
                      <p className="text-[11px] text-zinc-400">Share this OTP code with the delivery partner upon arrival.</p>
                    </div>
                  </div>

                  {/* Generated OTP Display */}
                  <div className="p-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-center">
                    <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">Generated OTP Code:</span>
                    <strong className="text-xl font-mono tracking-widest text-emerald-400">{activeOrder.otpCode}</strong>
                  </div>

                  {/* Verification Form */}
                  {!activeOrder.isVerified ? (
                    <form onSubmit={handleVerifyOTP} className="space-y-3">
                      <label className="text-xs font-medium text-zinc-300 block">Enter 4-Digit Delivery OTP Code to Complete Delivery:</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          maxLength={4}
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          placeholder="Enter 4-digit OTP (e.g. 4829)"
                          className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={isVerifyingOtp || !otpInput.trim()}
                          className="bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30"
                        >
                          {isVerifyingOtp ? 'Verifying...' : 'Verify OTP & Complete Delivery'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center space-x-2 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Order Delivery Verified & Completed via OTP Code!</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleNewConsultation}
                    className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Start New Consultation ➔
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
