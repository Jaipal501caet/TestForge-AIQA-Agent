import * as dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function checkModels() {
    console.log("🔍 Checking available Gemini models...");
    
    try {
        const response = await fetch(URL);
        const data = await response.json();
        
        if (data.error) {
            console.error("❌ API Error:", data.error.message);
            return;
        }

        console.log("\n✅ AVAILABLE MODELS:");
        // Filter for models that support generating content
        const models = data.models.filter((m: any) => m.supportedGenerationMethods.includes("generateContent"));
        
        models.forEach((m: any) => {
            console.log(`   - ${m.name.replace('models/', '')}`);
        });

    } catch (e) {
        console.error("❌ Network Error:", e);
    }
}

checkModels();
