const genAI = require('./geminiClient');

/**
 * Analyzes raw patient symptom message into a structured Enterprise Healthcare Operational Case
 */
async function analyzePatientCase(patientMessage, answeredQuestions = []) {
  const answeredContext = answeredQuestions.length > 0
    ? `\nAdditional Information Provided by Patient:\n${answeredQuestions.map(q => `- ${q.question}: ${q.answer}`).join('\n')}`
    : '';

  const prompt = `
You are CareFlow AI, an Enterprise Healthcare Operational Triage System acting as a senior intake physician.
Analyze the patient's reported health situation and generate a structured clinical assessment.

CRITICAL INSTRUCTIONS:
1. Provide a warm, empathetic 2-sentence clinical explanation of what their reported symptoms commonly mean.
2. Generate EXACTLY 5 to 6 highly precise, medically valid clinical questions tailored specifically to their situation to assess their condition like a doctor (e.g. onset/duration, severity 1-10 & pain character, radiation/movement triggers, red-flag accompanying symptoms like fever/breathing difficulty, medical history/medications, and impact on mobility).
3. Do NOT engage in casual small talk. Focus purely on medical triage and clinical evaluation.
4. Return ONLY a valid JSON object matching EXACTLY this structure without markdown code blocks:

{
  "understanding": "A warm, professional 2-sentence clinical explanation of what their symptoms commonly mean.",
  "questions": [
    "1. Highly precise doctor question 1 (e.g. When did this pain or discomfort first start?)",
    "2. Highly precise doctor question 2 (e.g. On a scale of 1 to 10, how severe is the pain, and is it sharp or dull?)",
    "3. Highly precise doctor question 3 (e.g. Does the pain radiate to your shoulders, back, or arms?)",
    "4. Highly precise doctor question 4 (e.g. Are you experiencing any accompanying fever, shortness of breath, or numbness?)",
    "5. Highly precise doctor question 5 (e.g. Does any specific position or movement make the pain better or worse?)",
    "6. Highly precise doctor question 6 (e.g. Are you currently taking any prescription medications or do you have existing medical conditions?)"
  ],
  "symptoms": ["Symptom 1", "Symptom 2"],
  "duration": "e.g., 2 Days",
  "severity": "Mild" | "Moderate" | "Severe",
  "recommendedDepartment": "General Physician" | "Cardiology" | "Pulmonology" | "Neurology" | "Orthopedics" | "Pediatrics" | "Dermatology" | "Emergency Medicine",
  "urgency": "Low" | "Medium" | "High" | "Emergency"
}

Patient Situation:
"${patientMessage}"
${answeredContext}
`;

  try {
    if (!genAI) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    if (text.startsWith('```')) {
      text = text.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    const parsed = JSON.parse(text);

    const defaultUnderstanding = `Experiencing symptoms like "${patientMessage}" is very common and can often be related to temporary muscle tension, strain, or systemic responses. Answering a few specific questions will help us guide you toward the appropriate care.`;

    const defaultQuestions = [
      "How long have you been experiencing these symptoms?",
      "Would you describe the discomfort as mild, moderate, or severe?",
      "Are you experiencing any other accompanying symptoms like breathing difficulty or fever?"
    ];

    return {
      understanding: parsed.understanding || defaultUnderstanding,
      questions: Array.isArray(parsed.questions) && parsed.questions.length > 0 ? parsed.questions : defaultQuestions,
      symptoms: parsed.symptoms || ["Reported Health Discomfort"],
      duration: parsed.duration || "Recently reported",
      severity: parsed.severity || "Moderate",
      riskFactors: parsed.riskFactors || [],
      aiSummary: parsed.understanding || defaultUnderstanding,
      recommendedDepartment: parsed.recommendedDepartment || "General Physician",
      departmentConfidence: 90,
      urgency: parsed.urgency || "Medium",
      urgencyReason: "Triage assessment based on intake profile.",
      missingInformation: Array.isArray(parsed.questions) && parsed.questions.length > 0 ? parsed.questions : defaultQuestions,
      disclaimer: "CareFlow provides operational care coordination. Consult a physician for diagnosis."
    };
  } catch (error) {
    console.error('Gemini AI Engine Error:', error.message);
    const lower = patientMessage.toLowerCase();
    let dept = "General Physician";
    let urgency = "Medium";
    let symptoms = [];
    let fallbackUnderstanding = "";
    let fallbackQuestions = [];

    if (lower.includes('knee') || lower.includes('leg') || lower.includes('joint') || lower.includes('back') || lower.includes('bone') || lower.includes('spine')) {
      dept = "Orthopedics";
      const part = lower.includes('knee') ? 'knee' : lower.includes('back') ? 'back' : 'joint';
      symptoms.push(part.charAt(0).toUpperCase() + part.slice(1) + " Pain");
      fallbackUnderstanding = `Experiencing ${part} pain is very common and often results from muscle strain, postural tension, or joint inflammation. Answering a few quick questions will help us guide you toward appropriate care.`;
      fallbackQuestions = [
        `How long have you been experiencing this ${part} pain?`,
        `Is the ${part} pain a sharp ache or a constant dull discomfort?`,
        `Does the pain worsen when bearing weight or moving?`
      ];
    } else if (lower.includes('chest') || lower.includes('heart') || lower.includes('palpitations')) {
      dept = "Cardiology";
      urgency = "High";
      symptoms.push("Chest Discomfort");
      fallbackUnderstanding = "Chest discomfort or palpitations should always be evaluated carefully. Providing a few details will help us gauge the urgency and guide you to the right department.";
      fallbackQuestions = [
        "When did you first notice this chest discomfort?",
        "Does the pain spread to your arm, neck, or jaw?",
        "Are you feeling short of breath or lightheaded?"
      ];
    } else if (lower.includes('cough') || lower.includes('breath') || lower.includes('fever') || lower.includes('cold')) {
      dept = "Pulmonology";
      if (lower.includes('fever')) symptoms.push("Fever");
      if (lower.includes('cough')) symptoms.push("Cough");
      if (symptoms.length === 0) symptoms.push("Respiratory Symptoms");
      fallbackUnderstanding = `Experiencing ${symptoms.join(' and ')} is typical during viral or respiratory infections. Sharing a few specific details helps determine the appropriate intake pathway.`;
      fallbackQuestions = [
        `How many days have you had these symptoms?`,
        "Do you have any difficulty breathing or shortness of breath?",
        "What is your current body temperature if measured?"
      ];
    } else if (lower.includes('headache') || lower.includes('dizzy') || lower.includes('numb')) {
      dept = "Neurology";
      symptoms.push("Headache / Dizziness");
      fallbackUnderstanding = "Headaches and dizziness are common symptoms often related to stress, dehydration, or nerve sensitivity. Answering a few questions will help clarify your intake profile.";
      fallbackQuestions = [
        "How long have you had this headache or dizziness?",
        "Is the pain localized to one side or throbbing?",
        "Have you experienced any nausea, sensitivity to light, or neck stiffness?"
      ];
    } else {
      symptoms.push("Reported Discomfort");
      fallbackUnderstanding = `Experiencing symptoms like "${patientMessage}" is quite common. Answering a few quick questions will allow us to clarify your situation.`;
      fallbackQuestions = [
        "How long have you been experiencing this discomfort?",
        "Would you rate the severity as mild, moderate, or severe?",
        "Have you noticed any other accompanying symptoms?"
      ];
    }

    return {
      understanding: fallbackUnderstanding,
      questions: fallbackQuestions,
      symptoms,
      duration: "2-3 Days",
      severity: urgency === "High" ? "Severe" : "Moderate",
      riskFactors: [],
      aiSummary: fallbackUnderstanding,
      recommendedDepartment: dept,
      departmentConfidence: 85,
      urgency,
      urgencyReason: "Standard triage level.",
      missingInformation: fallbackQuestions,
      disclaimer: "CareFlow provides operational care coordination."
    };
  }
}

/**
 * Generates Clinic AI Assistant insights for hospital staff
 */
async function generateClinicStaffInsights(consultation, actionType) {
  const prompt = `
You are the CareFlow Clinic AI Assistant aiding hospital staff in managing a patient case.

Patient Case Context:
- Symptoms: ${consultation.aiAnalysis.symptoms.join(', ')}
- Urgency: ${consultation.aiAnalysis.urgency}
- Recommended Department: ${consultation.aiAnalysis.recommendedDepartment}
- Summary: ${consultation.aiAnalysis.aiSummary}
- Raw Message: "${consultation.rawPatientInput}"

Action Requested: "${actionType}"

Generate concise, professional enterprise healthcare output for hospital staff.
Return ONLY valid JSON matching this structure:
{
  "title": "Action Title",
  "content": "Detailed markdown or structured output for hospital staff",
  "bulletPoints": ["Item 1", "Item 2", "Item 3"]
}
`;

  try {
    if (!genAI) throw new Error('No Gemini API Key');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
    }
    return JSON.parse(text);
  } catch (err) {
    console.error('Clinic AI Insights Error:', err.message);
    if (actionType === 'summarize') {
      return {
        title: "Clinical Case Summary",
        content: `Patient presented with ${consultation.aiAnalysis.symptoms.join(', ')}. Initial triage indicates ${consultation.aiAnalysis.urgency} urgency under ${consultation.aiAnalysis.recommendedDepartment}.`,
        bulletPoints: [
          `Symptoms: ${consultation.aiAnalysis.symptoms.join(', ')}`,
          `Urgency Level: ${consultation.aiAnalysis.urgency}`,
          `Triage Department: ${consultation.aiAnalysis.recommendedDepartment}`
        ]
      };
    } else if (actionType === 'next_actions') {
      return {
        title: "Suggested Operational Actions",
        content: "Recommended workflow actions for hospital staff:",
        bulletPoints: [
          "1. Confirm patient arrival & check vital signs",
          "2. Prepare preliminary intake sheet for General Physician / Triage Doctor",
          "3. Order rapid temperature and oxygen saturation readings",
          "4. Assign Consultation Room 2"
        ]
      };
    } else if (actionType === 'visit_notes') {
      return {
        title: "Draft Visit Notes",
        content: `CHIEF COMPLAINT: ${consultation.rawPatientInput}\n\nTRIAGE ASSESSMENT: ${consultation.aiAnalysis.aiSummary}\n\nRECOMMENDED PLAN: Outpatient consultation with ${consultation.aiAnalysis.recommendedDepartment}.`,
        bulletPoints: [
          "Chief Complaint documented",
          "Preliminary triage assigned",
          "Awaiting attending physician sign-off"
        ]
      };
    } else {
      return {
        title: "Consultation Handover Document",
        content: `CareFlow Enterprise Handover Record\nPatient ID: ${consultation.patientId}\nStatus: ${consultation.status.toUpperCase()}\nDepartment: ${consultation.aiAnalysis.recommendedDepartment}`,
        bulletPoints: [
          "Case successfully received at clinic dashboard",
          "Patient profile linked without manual data entry",
          "Ready for doctor review"
        ]
      };
    }
  }
}

module.exports = {
  analyzePatientCase,
  generateClinicStaffInsights
};
