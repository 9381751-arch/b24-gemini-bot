// src/handlers/onCrmLeadAdd.js
import { askGemini } from '../gemini.js';
import { getLead, createTask, addCrmComment } from '../bitrix.js';

export async function onCrmLeadAdd(payload) {
  const leadId = payload?.data?.FIELDS?.ID;
  const responsibleId = payload?.data?.FIELDS?.ASSIGNED_BY_ID;

  if (!leadId) {
    console.warn('[onCrmLeadAdd] Нет ID лида');
    return;
  }

  console.log(`[onCrmLeadAdd] Новый лид ID=${leadId} ответственный=${responsibleId}`);

  const lead = await getLead(leadId).catch(() => null);
  const context = lead
    ? `Лид: ${lead.TITLE || 'Без названия'}. Имя: ${lead.NAME || ''} ${lead.LAST_NAME || ''}. Телефон: ${lead.PHONE?.[0]?.VALUE || 'нет'}. Источник: ${lead.SOURCE_DESCRIPTION || lead.SOURCE_ID || 'нет'}.`
    : `Лид ID: ${leadId}`;

  const prompt = `По новому лиду в CRM напиши задачу для менеджера.
Отвечай в формате JSON: {"action":"create_task","title":"...","description":"..."}`;

  const raw = await askGemini(prompt, context);

  let title = `Обработать лид №3${leadId}`;
  let description = '';

  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      title = parsed.title || title;
      description = parsed.description || description;
    }
  } catch (_) {}

  const task = await createTask({ title, description, responsibleId });
  const taskId = task?.task?.id;

  await addCrmComment({
    entityType: 'lead',
    entityId: leadId,
    comment: `Создана задача #${taskId}: ${title}`,
  }).catch((e) => console.warn('[onCrmLeadAdd] Комментарий не добавлен:', e.message));

  console.log(`[onCrmLeadAdd] Задача ID=${taskId} для лида ${leadId}`);
}
