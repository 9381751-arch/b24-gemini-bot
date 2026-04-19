// src/bitrix.js
import axios from 'axios';

const base = (process.env.BITRIX_WEBHOOK_BASE || '').replace(/\/$/, '');

export async function callBitrix(method, params = {}) {
  if (!base) throw new Error('BITRIX_WEBHOOK_BASE не задан в .env');
  const res = await axios.post(`${base}/${method}`, params);
  if (res.data?.error) {
    throw new Error(`Bitrix [${res.data.error}]: ${res.data.error_description}`);
  }
  return res.data?.result;
}

// Отправить сообщение в чат от бота
export async function sendBotMessage({ dialogId, botId, message }) {
  return callBitrix('imbot.message.add', {
    BOT_ID: botId || process.env.BITRIX_BOT_ID,
    DIALOG_ID: dialogId,
    MESSAGE: message,
  });
}

// Системное уведомление пользователю (без регистрации бота)
export async function sendNotification({ userId, message }) {
  return callBitrix('im.notify.system.add', {
    USER_ID: userId,
    MESSAGE: message,
  });
}

// Создать задачу
export async function createTask({ title, description, responsibleId, deadlineDate }) {
  const fields = {
    TITLE: title,
    DESCRIPTION: description || '',
    RESPONSIBLE_ID: responsibleId,
  };
  if (deadlineDate) fields.DEADLINE = deadlineDate;
  return callBitrix('tasks.task.add', { fields });
}

// Получить лид
export async function getLead(leadId) {
  return callBitrix('crm.lead.get', { ID: leadId });
}

// Получить сделку
export async function getDeal(dealId) {
  return callBitrix('crm.deal.get', { ID: dealId });
}

// Комментарий к лиду или сделке
export async function addCrmComment({ entityType, entityId, comment }) {
  return callBitrix('crm.timeline.comment.add', {
    fields: {
      ENTITY_ID: entityId,
      ENTITY_TYPE: entityType === 'lead' ? 'lead' : 'deal',
      COMMENT: comment,
    },
  });
}
