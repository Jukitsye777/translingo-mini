import axios from "axios";

// Load API key from .env file
const API_TOKEN = import.meta.env.VITE_HUGGINGFACE_API_KEY;

// Hugging Face Translation Model API (Default: English to French)
const TRANSLATION_API_URL = "https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-en-fr";

// Function to translate text using Hugging Face API
export async function translateText(text: string, _targetLang: string = "fr", targetLang: string): Promise<string> {
  try {
    const response = await axios.post(
      TRANSLATION_API_URL,  // API Endpoint
      { inputs: text },     // Text input for translation
      { headers: { Authorization: `Bearer ${API_TOKEN}` } }  // Auth token
    );

    // Extract translated text
    if (response.data && response.data[0]?.translation_text) {
      return response.data[0].translation_text;
    } else {
      throw new Error("Translation failed");
    }
  } catch (error) {
    console.error("Translation error:", error);
    return "Translation failed.";
  }
}
