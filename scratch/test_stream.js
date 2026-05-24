const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/NEXT_PUBLIC_OPENROUTER_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : '';

async function listFreeModels() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      console.log("Error status:", response.status);
      return;
    }

    const data = await response.json();
    const freeModels = data.data
      .filter(m => m.id.endsWith(':free') || (m.pricing && parseFloat(m.pricing.prompt) === 0))
      .map(m => ({ id: m.id, name: m.name, promptPrice: m.pricing?.prompt }));
    
    console.log("Active Free Models on OpenRouter:");
    console.log(JSON.stringify(freeModels, null, 2));
  } catch (error) {
    console.error("Error fetching models:", error);
  }
}

listFreeModels();
