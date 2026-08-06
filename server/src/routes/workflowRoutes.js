const express = require('express');
const {
  analyzeWorkflow,
  answerMissingInfo,
  getClinics,
  getPharmacies,
  connectClinic,
  getPatientConsultations,
  getClinicConsultations,
  getActiveConsultations,
  runClinicAIAssistant,
  analyzeTriage,
  deleteConsultation
} = require('../controllers/workflowController');

const router = express.Router();

router.post('/analyze', analyzeWorkflow);
router.post('/answer-missing', answerMissingInfo);
router.get('/clinics', getClinics);
router.get('/pharmacies', getPharmacies);
router.post('/connect-clinic', connectClinic);
router.get('/consultations/patient/:patientId', getPatientConsultations);
router.get('/consultations/clinic/:clinicId', getClinicConsultations);
router.get('/consultations/active', getActiveConsultations);
router.post('/clinic-ai-assistant', runClinicAIAssistant);
router.post('/triage/analyze', analyzeTriage);
router.delete('/consultations/:id', deleteConsultation);

module.exports = router;
