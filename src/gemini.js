// src/gemini.js
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `Ты AI-ассистент строительной компании в Bitrix24.
Отвечай коротко, по делу, на русском языке.
Помогаешь менеджерам: обрабатываешь лиды, создаёшь задачи, отвечаешь на вопросы по проектам.
Если нужно создать задачу — отвечай в формате JSON:
{"action":"create_task","title":"...","description":"..."}
Если простой вопрос — отвечай обычным текстом.`.trim();

/**
 * @param {string} userMessage
 * @param {string} [context]
 * @returns {Promise<string>}
 */
export async function askGemini(userMessage, context = '') {
  const parts = [];
  if (context) {
    parts.push({ text: `Контекст:\n${context}\n\n` });
  }
  parts.push({ text: `${SYSTEM_PROMPT}\n\nПользователь: ${userMessage}` });

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{ parts }],
  });

  const text =
    response?.candidates?.[0]?.content?.parts?.[0]?.text ??
    '';

  return text.trim();
}

/**
 * Парсит ответ Gemini — это JSON с action или просто текст
 */
export function parseGeminiResponse(raw) {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      return { isAction: true, data: JSON.parse(match[0]) };
    }
  } catch (_) {}
  return { isAction: false, text: raw };
}
