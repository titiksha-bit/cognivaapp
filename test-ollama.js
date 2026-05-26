const { analyzeReport } = require('./services/ollamaService');

async function test() {
  const text = "Patient has fever 101°F, cough, and fatigue. No other symptoms.";
  const result = await analyzeReport(text, 'en');
  console.log('Analysis result:', result);
}
test();