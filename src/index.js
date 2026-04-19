// src/index.js
import 'dotenv/config';
import express from 'express';
import { onImBotMessage } from './handlers/onImBotMessage.js';
import { onCrmLeadAdd } from './handlers/onCrmLeadAdd.js';
import { onCrmDealAdd } from './handlers/onCrmDealAdd.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('b24-gemini-bot is running');
});

app.post('/webhook/bitrix', async (req, res) => {
  try {
    const payload = Object.keys(req.body).length ? req.body : req.query;

    // Проверка токена исходящего вебхука
    if (process.env.BITRIX_OUTGOING_TOKEN) {
      const token =
        payload?.auth?.application_token ||
        payload?.token ||
        req.headers['x-bitrix-token'];
      if (token !== process.env.BITRIX_OUTGOING_TOKEN) {
        console.warn('[webhook] Неверный токен');
        return res.status(403).send('Forbidden');
      }
    }

    // Быстро отвечаем 200, чтобы Bitrix не ждал и не повторял запрос
    res.status(200).send('OK');

    // Дальше — асинхронная обработка
    handleEvent(payload).catch((e) =>
      console.error('[webhook] Ошибка обработки:', e.message)
    );
  } catch (e) {
    console.error('[webhook] Ошибка:', e);
    res.status(500).send('ERROR');
  }
});

async function handleEvent(payload) {
  const event = payload?.event;
  console.log(`[handleEvent] Событие: ${event}`);

  switch (event) {
    case 'ONIMBOTMESSAGEADD':
      await onImBotMessage(payload);
      break;
    case 'ONCRMLEADADD':
      await onCrmLeadAdd(payload);
      break;
    case 'ONCRMDEALADD':
      await onCrmDealAdd(payload);
      break;
    default:
      console.log(`[handleEvent] Неизвестное событие: ${event}`);
  }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`[server] Сервер запущен на порту ${port}`);
});
