const Consultation = require('../models/Consultation');
const Clinic = require('../models/Clinic');
const Pharmacy = require('../models/Pharmacy');
const Notification = require('../models/Notification');
const Summary = require('../models/Summary');
const { analyzePatientCase, generateClinicStaffInsights } = require('../utils/aiEngine');

const DEFAULT_TIMELINE = [
  { step: '1', title: 'Patient Logged In', status: 'completed' },
  { step: '2', title: 'Symptoms Submitted', status: 'completed' },
  { step: '3', title: 'AI Case Analysis Generated', status: 'completed' },
  { step: '4', title: 'Department Selected', status: 'current' },
  { step: '5', title: 'Clinic Connected', status: 'upcoming' },
  { step: '6', title: 'Clinic Accepted Request', status: 'upcoming' },
  { step: '7', title: 'Consultation Pending', status: 'upcoming' }
];

/**
 * Patient submits symptoms -> Gemini analyzes -> Generates 8-card workflow data
 */
exports.analyzeWorkflow = async (req, res) => {
  try {
    const { patientMessage, consultationId, patientId } = req.body;

    if (!patientMessage) {
      return res.status(400).json({ success: false, message: 'Patient message is required' });
    }

    // Run Gemini AI Analysis Engine
    const aiAnalysis = await analyzePatientCase(patientMessage);

    let consultation;
    if (consultationId) {
      consultation = await Consultation.findById(consultationId);
    }

    if (consultation) {
      consultation.rawPatientInput = patientMessage;
      consultation.aiAnalysis = aiAnalysis;
      consultation.status = 'analyzed';
      await consultation.save();
    } else {
      consultation = await Consultation.create({
        patientId: patientId || '65f1a2b3c4d5e6f7a8b9c0d1', // Fallback ID if not passed
        rawPatientInput: patientMessage,
        aiAnalysis,
        status: 'analyzed',
        timeline: DEFAULT_TIMELINE
      });
    }

    res.status(200).json({
      success: true,
      consultation,
      aiAnalysis
    });
  } catch (error) {
    console.error('Analyze Workflow Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process AI workflow analysis' });
  }
};

/**
 * Answer missing information question -> Gemini re-analyzes case
 */
exports.answerMissingInfo = async (req, res) => {
  try {
    const { consultationId, question, answer } = req.body;
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    const answeredInfo = consultation.aiAnalysis.answeredInfo || [];
    answeredInfo.push({ question, answer });

    // Filter out answered question from questions & missingInformation
    const currentQuestions = consultation.aiAnalysis.questions || consultation.aiAnalysis.missingInformation || [];
    const updatedQuestions = currentQuestions.filter(q => q !== question);

    // Re-run Gemini with updated answered context
    const refinedAnalysis = await analyzePatientCase(consultation.rawPatientInput, answeredInfo);
    refinedAnalysis.questions = updatedQuestions;
    refinedAnalysis.missingInformation = updatedQuestions;
    refinedAnalysis.answeredInfo = answeredInfo;

    consultation.aiAnalysis = refinedAnalysis;
    await consultation.save();

    res.status(200).json({
      success: true,
      consultation,
      aiAnalysis: refinedAnalysis
    });
  } catch (error) {
    console.error('Answer Missing Info Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update case analysis' });
  }
};

const seedInitialData = require('../utils/seedData');

/**
 * Fetch registered clinics from MongoDB
 */
exports.getClinics = async (req, res) => {
  try {
    const { department } = req.query;
    let clinics = await Clinic.find().select('-password');

    if (clinics.length === 0) {
      await seedInitialData();
      clinics = await Clinic.find().select('-password');
    }

    if (department) {
      // Sort clinics matching recommended department first
      clinics = clinics.sort((a, b) => {
        const aMatch = a.departments.includes(department) ? -1 : 1;
        const bMatch = b.departments.includes(department) ? -1 : 1;
        return aMatch - bMatch;
      });
    }

    res.status(200).json({ success: true, clinics });
  } catch (error) {
    console.error('Get Clinics Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Fetch registered partner pharmacies from MongoDB
 */
exports.getPharmacies = async (req, res) => {
  try {
    let pharmacies = await Pharmacy.find();
    if (pharmacies.length === 0) {
      await seedInitialData();
      pharmacies = await Pharmacy.find();
    }
    res.status(200).json({ success: true, pharmacies });
  } catch (error) {
    console.error('Get Pharmacies Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Connect Patient to Selected Clinic -> Update Timeline & Notify Clinic Dashboard
 */
exports.connectClinic = async (req, res) => {
  try {
    const { consultationId, clinicId } = req.body;

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }

    consultation.clinicId = clinic._id;
    consultation.status = 'connected';

    // Update timeline steps
    consultation.timeline = [
      { step: '1', title: 'Patient Logged In', status: 'completed' },
      { step: '2', title: 'Symptoms Submitted', status: 'completed' },
      { step: '3', title: 'AI Case Analysis Generated', status: 'completed' },
      { step: '4', title: 'Department Selected', status: 'completed' },
      { step: '5', title: 'Clinic Connected', status: 'completed' },
      { step: '6', title: 'Clinic Accepted Request', status: 'current' },
      { step: '7', title: 'Consultation Pending', status: 'upcoming' }
    ];

    await consultation.save();

    // Create real-time notification for clinic
    await Notification.create({
      recipientId: clinic._id,
      recipientRole: 'clinic',
      title: 'New Patient Case Connected',
      message: `Patient connected for ${consultation.aiAnalysis.recommendedDepartment} (${consultation.aiAnalysis.urgency} urgency)`,
      type: 'new_case',
      consultationId: consultation._id
    });

    res.status(200).json({
      success: true,
      consultation,
      clinic
    });
  } catch (error) {
    console.error('Connect Clinic Error:', error);
    res.status(500).json({ success: false, message: 'Failed to connect clinic workflow' });
  }
};

/**
 * Retrieve patient's active consultations & history
 */
exports.getPatientConsultations = async (req, res) => {
  try {
    const { patientId } = req.params;
    const consultations = await Consultation.find({ patientId })
      .populate('clinicId', 'clinicName rating address phoneNumber logoUrl')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, consultations });
  } catch (error) {
    console.error('Get Patient Consultations Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Retrieve active connected cases for Clinic Workspace Dashboard
 */
exports.getClinicConsultations = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const consultations = await Consultation.find({ clinicId })
      .populate('patientId', 'firstName lastName email avatarUrl googleId')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, consultations });
  } catch (error) {
    console.error('Get Clinic Consultations Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Retrieve all active live patient triage consultations from MongoDB for Hospital Staff View
 */
exports.getActiveConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .populate('patientId', 'firstName lastName email avatarUrl googleId')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, consultations });
  } catch (error) {
    console.error('Get Active Consultations Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active consultations' });
  }
};

/**
 * Clinic AI Assistant Actions for Hospital Staff
 */
exports.runClinicAIAssistant = async (req, res) => {
  try {
    const { consultationId, actionType } = req.body;
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    const insights = await generateClinicStaffInsights(consultation, actionType);

    // Save summary record
    let summaryDoc = await Summary.findOne({ consultationId });
    if (!summaryDoc) {
      summaryDoc = new Summary({
        consultationId,
        clinicId: consultation.clinicId || '65f1a2b3c4d5e6f7a8b9c0d2'
      });
    }

    if (actionType === 'visit_notes') summaryDoc.staffVisitNotes = insights.content;
    if (actionType === 'next_actions') summaryDoc.nextOperationalActions = insights.bulletPoints;
    if (actionType === 'summarize') summaryDoc.clinicalSummary = insights.content;

    await summaryDoc.save();

    res.status(200).json({
      success: true,
      insights,
      summaryDoc
    });
  } catch (error) {
    console.error('Clinic AI Assistant Error:', error);
    res.status(500).json({ success: false, message: 'Failed to run Clinic AI Assistant' });
  }
};
