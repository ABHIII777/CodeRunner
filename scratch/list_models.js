import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // The SDK doesn't have a direct listModels but we can try to hit the endpoint or just test a few model names
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("test");
            console.log(`Model ${m} is WORKING`);
            break;
        } catch (err) {
            console.log(`Model ${m} FAILED: ${err.message}`);
        }
    }
  } catch (err) {
    console.error(err);
  }
}

listModels();
