const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = (process.env.GEMINI_API_KEY || '').trim();

let genAI = null;

if (!apiKey || apiKey === 'mock_gemini_key_placeholder') {
  console.warn('⚠️ GEMINI_API_KEY is missing. CareFlow will use the fallback mechanism.');
} else {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ Google Gemini AI Client initialized successfully.');
  } catch (error) {
    console.error('❌ Failed to initialize Google Gemini AI Client:', error.message);
  }
}

module.exports = genAI;
