import { GoogleGenAI, Chat, Modality, Part } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;

const getAiInstance = (): GoogleGenAI => {
  if (!ai) {
    // Vite's define plugin will replace process.env.API_KEY with the actual key
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY not found. Please check your .env file and restart the server.");
    }
    ai = new GoogleGenAI({ apiKey: apiKey });
  }
  return ai;
};

// FIX: Added missing analyzeImageWithGemini function for the ImageEditor component.
// This function performs a non-streaming, one-shot analysis of an image, which is
// appropriate for the stateless nature of the ImageEditor and follows Gemini API best practices.
export async function analyzeImageWithGemini(
  base64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  const aiInstance = getAiInstance();
  try {
    const imagePart: Part = {
      inlineData: {
        data: base64,
        mimeType: mimeType,
      },
    };
    const textPart: Part = { text: prompt };

    const response = await aiInstance.models.generateContent({
      model: 'gemini-flash-latest',
      contents: { parts: [textPart, imagePart] },
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw new Error("Failed to analyze image: " + (error instanceof Error ? error.message : String(error)));
  }
}


const initializeChat = (): Chat => {
  if (chat) {
    return chat;
  }
  const aiInstance = getAiInstance();

  const newChat = aiInstance.chats.create({
    model: 'gemini-flash-latest',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    }
  });
  chat = newChat;
  return newChat;
};

export async function* getCenturionAIResponseStream(
  message: string,
  file?: { base64: string; mimeType: string }
): AsyncGenerator<string> {
  // If a file is present, perform a stateless analysis request without the system instruction.
  if (file) {
    try {
      const aiInstance = getAiInstance();
      const filePart: Part = {
        inlineData: {
          data: file.base64,
          mimeType: file.mimeType,
        },
      };
      const userQuestion = message || "describe the contents of this file in detail.";
      // Updated prompt for simplicity and language support
      const textPrompt = `${SYSTEM_INSTRUCTION}

User has uploaded a file. Directly and concisely answer the user's question about the following file in a very simple way: "${userQuestion}". 
Remember to use simple Indian English or Tenglish if appropriate.
Use markdown bolding (**text**) to highlight the most important parts.
After providing the answer, conclude with: "Feel free to ask me anything else about CUTM!"`;
      const textPart: Part = { text: textPrompt };

      const response = await aiInstance.models.generateContentStream({
        model: 'gemini-flash-latest',
        contents: [{ parts: [textPart, filePart] }],
      });

      for await (const chunk of response) {
        yield chunk.text;
      }
      return; // End the generator
    } catch (error) {
      console.error("Error streaming file analysis from Gemini:", error);
      yield "Error analyzing file: " + (error instanceof Error ? error.message : String(error));
      return;
    }
  }

  // For text-only messages, use the contextual GenAI chat model stream
  try {
    const chatInstance = initializeChat();
    const stream = await chatInstance.sendMessageStream({ message: message });
    for await (const chunk of stream) {
      yield chunk.text;
    }
  } catch (error) {
    console.error("Error streaming message from Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    yield "I'm sorry, I encountered an error: " + errorMessage;
  }
}