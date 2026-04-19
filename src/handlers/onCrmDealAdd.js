// src/handlers/onCrmDealAdd.js
import { askGemini } from '../gemini.js';
import { getDeal, createTask } from '../bitrix.js';

export async function onCrmDealAdd(payload) {
  const dealId = payload?.data?.FIELDS?.ID;
  const responsibleId = payload?.data?.FIELDS?.ASSIGNED_BY_ID;

  if (!dealId) {
    console.warn('[onCrmDealAdd] Нет ID сделки');
    return;
  }

  console.log(`[onCrmDealAdd] Новая сделка ID=${dealId}`);

  const deal = await getDeal(dealId).catch(() => null);
  const context = deal
    ? `Сделка: ${deal.TITLE}. Сумма: ${deal.OPPORTUNITY} ${deal.CURRENCY_ID}. Стадия: ${deal.STAGE_ID}.`
    : `Сделка ID: ${dealId}`;

  const prompt = `По новой сделке в CRM напиши задачу для менеджера.
Отвечай в формате JSON: {"action":"create_task","title":"...","description":"..."}`;

  const raw = await askGemini(prompt, context);

  let title = `Проработать сделку №3${dealId}`;
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
  console.log(`[onCrmDealAdd] Задача ID=${task?.task?.id} для сделки ${dealId}`);
}
