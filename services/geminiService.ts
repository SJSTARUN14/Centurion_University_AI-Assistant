import { GoogleGenAI, Chat, Modality, Part } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;

const getAiInstance = (): GoogleGenAI => {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, imagePart] },
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw new Error("Failed to analyze image. Please try again later.");
  }
}


const initializeChat = (): Chat => {
  if (chat) {
    return chat;
  }
  const aiInstance = getAiInstance();
  
  const newChat = aiInstance.chats.create({
    model: 'gemini-2.5-flash',
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
      // Updated prompt for concise answer, bolding, and CUTM encouragement
      const textPrompt = `Directly and concisely answer the user's question about the following file: "${userQuestion}". Use markdown bolding (\`**text**\`) to highlight the most important parts of your analysis. After providing the answer, conclude your response with the exact sentence on a new line: "For any questions about courses, admissions, or campus life, feel free to ask me about Centurion University!"`;
      const textPart: Part = { text: textPrompt };

      const response = await aiInstance.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [textPart, filePart] }],
      });

      for await (const chunk of response) {
        yield chunk.text;
      }
      return; // End the generator
    } catch (error) {
      console.error("Error streaming file analysis from Gemini:", error);
      yield "I'm sorry, I encountered an error while analyzing the file. Please try again later.";
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
    yield "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
}