import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { CustomError } from "../../../lib/custom-error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type AiGeneratedContent = {
  category: string[];
  tags: string[];
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  news: string;
  provider?: string;
};

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

const readPrompt = (): string => {
  const promptPath = join(__dirname, "../../../prompts/system-prompt.md");
  try {
    return readFileSync(promptPath, "utf-8");
  } catch {
    throw new CustomError("Gagal membaca system prompt", 500);
  }
};

const parseAiResponse = (text: string): AiGeneratedContent => {
  const jsonStr = text.replace(/```(?:json)?\s*/g, "").trim();

  let parsed: { success: boolean; content: AiGeneratedContent };
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new CustomError(
      "Gagal memproses hasil generate: format response tidak valid",
      502,
    );
  }

  if (!parsed.success || !parsed.content) {
    throw new CustomError("Gagal memproses hasil generate dari AI", 502);
  }

  const content = parsed.content;

  if (!content.title || !content.news || !content.category || !content.tags) {
    throw new CustomError("Hasil generate tidak lengkap. Coba generate ulang.", 502);
  }

  if (content.category.length === 0) {
    throw new CustomError("AI tidak menghasilkan kategori. Coba generate ulang.", 502);
  }

  if (content.tags.length === 0) {
    throw new CustomError("AI tidak menghasilkan tags. Coba generate ulang.", 502);
  }

  return content;
};

const callGemini = async (prompt: string): Promise<AiGeneratedContent> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY tidak dikonfigurasi");
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  let response: Response;
  try {
    response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
  } catch {
    throw new Error("Gagal terhubung ke Google AI Studio");
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Google AI Studio error (${response.status}): ${errorBody}`);
  }

  let geminiData: GeminiResponse;
  try {
    geminiData = (await response.json()) as GeminiResponse;
  } catch {
    throw new Error("Gagal memproses response dari Google AI Studio");
  }

  const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Google AI Studio tidak mengembalikan konten");
  }

  const content = parseAiResponse(text);
  content.provider = "gemini";
  return content;
};

const callGroq = async (prompt: string): Promise<AiGeneratedContent> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY tidak dikonfigurasi");
  }

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const apiUrl = "https://api.groq.com/openai/v1/chat/completions";

  let response: Response;
  try {
    response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });
  } catch {
    throw new Error("Gagal terhubung ke Groq API");
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Groq API error (${response.status}): ${errorBody}`);
  }

  let groqData: GroqResponse;
  try {
    groqData = (await response.json()) as GroqResponse;
  } catch {
    throw new Error("Gagal memproses response dari Groq API");
  }

  const text = groqData?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Groq API tidak mengembalikan konten");
  }

  const content = parseAiResponse(text);
  content.provider = "groq";
  return content;
};


export const serviceGenerateContent = async (
  url: string,
): Promise<AiGeneratedContent> => {
  const urls = url
    .split(/[\n,]+/)
    .map((u) => u.trim())
    .filter((u) => u.length > 0);

  if (urls.length === 0) {
    throw new CustomError("URL berita wajib diisi", 400);
  }

  if (urls.length > 1) {
    throw new CustomError(
      "Hanya bisa memproses 1 URL berita dalam sekali generate. " +
        "Hapus URL lainnya dan coba lagi.",
      400,
    );
  }

  try {
    new URL(urls[0]!);
  } catch {
    throw new CustomError("Format URL tidak valid", 400);
  }

  const systemPrompt = readPrompt();
  const fullPrompt = `${systemPrompt}\n\nURL Berita:\n${urls[0]}\n\nResponse:`;

  const errors: string[] = [];

  if (process.env.GEMINI_API_KEY) {
    try {
      return await callGemini(fullPrompt);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      errors.push(`Gemini: ${message}`);
      console.warn(`[AI] Gemini gagal, fallback ke Groq: ${message}`);
    }
  }

  if (process.env.GROQ_API_KEY) {
    try {
      return await callGroq(fullPrompt);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      errors.push(`Groq: ${message}`);
      console.warn(`[AI] Groq juga gagal: ${message}`);
    }
  }

  throw new CustomError(
    `Semua provider AI gagal. Detail:\n${errors.join("\n")}`,
    502,
  );
};
