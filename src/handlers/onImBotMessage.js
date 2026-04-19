// src/handlers/onImBotMessage.js
import { askGemini, parseGeminiResponse } from '../gemini.js';
import { sendBotMessage, createTask } from '../bitrix.js';

export async function onImBotMessage(payload) {
  const params = payload?.data?.PARAMS || {};
  const messageText = params.MESSAGE || params.TEXT || '';
  const dialogId = params.DIALOG_ID;
  const userId = params.FROM_USER_ID;
  const botId = params.BOT_ID || process.env.BITRIX_BOT_ID;

  if (!messageText || !dialogId) {
    console.warn('[onImBotMessage] Нет текста или dialogId');
    return;
  }

  console.log(`[onImBotMessage] userId=${userId} dialogId=${dialogId} text="${messageText}"`);

  const context = `Сотрудник ID: ${userId}. Диалог: ${dialogId}`;
  const raw = await askGemini(messageText, context);
  const parsed = parseGeminiResponse(raw);

  if (parsed.isAction && parsed.data?.action === 'create_task') {
    const task = await createTask({
      title: parsed.data.title,
      description: parsed.data.description,
      responsibleId: userId,
    });
    await sendBotMessage({
      dialogId,
      botId,
      message: `[B]Задача создана:[/B] ${parsed.data.title}\nID: ${task?.task?.id || '?'}`,
    });
  } else {
    await sendBotMessage({
      dialogId,
      botId,
      message: parsed.text || raw,
    });
  }
}
