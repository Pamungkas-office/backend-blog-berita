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
};

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

export const serviceGenerateContent = async (
  url: string
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
      400
    );
  }

  try {
    new URL(urls[0]!);
  } catch {
    throw new CustomError("Format URL tidak valid", 400);
  }

  const promptPath = join(__dirname, "../../../prompts/system-prompt.md");
  let systemPrompt: string;
  try {
    systemPrompt = readFileSync(promptPath, "utf-8");
  } catch {
    throw new CustomError("Gagal membaca system prompt", 500);
  }

  const fullPrompt = `${systemPrompt}\n\nURL Berita:\n${urls[0]}\n\nResponse:`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new CustomError("API Key Gemini tidak dikonfigurasi", 500);
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
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
      }),
    });
  } catch {
    throw new CustomError("Gagal terhubung ke Google AI Studio", 502);
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new CustomError(
      `Google AI Studio error (${response.status}): ${errorBody}`,
      502
    );
  }

  let geminiData: GeminiResponse;
  try {
    geminiData = (await response.json()) as GeminiResponse;
  } catch {
    throw new CustomError("Gagal memproses response dari Google AI Studio", 502);
  }

  const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new CustomError(
      "Google AI Studio tidak mengembalikan konten",
      502
    );
  }

  const jsonStr = text.replace(/```(?:json)?\s*/g, "").trim();

  let parsed: { success: boolean; content: AiGeneratedContent };
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new CustomError(
      "Gagal memproses hasil generate: format response tidak valid",
      502
    );
  }

  if (!parsed.success || !parsed.content) {
    throw new CustomError(
      "Gagal memproses hasil generate dari AI",
      502
    );
  }

  const content = parsed.content;

  if (!content.title || !content.news || !content.category || !content.tags) {
    throw new CustomError(
      "Hasil generate tidak lengkap. Coba generate ulang.",
      502
    );
  }

  if (content.category.length === 0) {
    throw new CustomError("AI tidak menghasilkan kategori. Coba generate ulang.", 502);
  }

  if (content.tags.length === 0) {
    throw new CustomError("AI tidak menghasilkan tags. Coba generate ulang.", 502);
  }

  return content;
};
