# b24-gemini-bot

Bitrix24 чат-бот + CRM-автоматизация на Google Gemini API.

## Что делает бот

- Отвечает сотрудникам в чате Bitrix24 (событие `ONIMBOTMESSAGEADD`)
- При новом лиде автоматически создаёт задачу менеджеру (`ONCRMLEADADD`)
- При новой сделке создаёт задачу с описанием от Gemini (`ONCRMDEALADD`)
- Может создавать задачи по запросу из чата

## Стек

- Node.js 18+
- Express
- Google Gemini API (`@google/genai`)
- Bitrix24 REST API (вебхуки)

## Быстрый старт

### 1. Клонируем и устанавливаем зависимости

```bash
git clone https://github.com/9381751-arch/b24-gemini-bot.git
cd b24-gemini-bot
npm install
```

### 2. Настраиваем .env

```bash
cp .env.example .env
```

Прописываем в `.env`:
- `GEMINI_API_KEY` — ключ с [aistudio.google.com](https://aistudio.google.com/apikey)
- `BITRIX_WEBHOOK_BASE` — входящий вебхук (Настройки → Разработчикам → Входящий вебхук)
- `BITRIX_OUTGOING_TOKEN` — токен исходящего вебхука (необязательно)

### 3. Запускаем локально

```bash
npm start
# или в dev-режиме (автоперезапуск при изменениях)
npm run dev
```

### 4. Прописываем URL в Bitrix24

Для локального теста используем ngrok:

```bash
ngrok http 3000
```

Указываем полученный URL в исходящем вебхуке Bitrix24:
```
https://xxxx.ngrok.io/webhook/bitrix
```

## События Bitrix24

| Событие | Что происходит |
|---|---|
| `ONIMBOTMESSAGEADD` | Gemini отвечает в чате, может создать задачу |
| `ONCRMLEADADD` | Gemini создаёт задачу менеджеру + комментарий к лиду |
| `ONCRMDEALADD` | Gemini создаёт задачу по сделке |

## Структура проекта

```
b24-gemini-bot/
  .env.example
  .gitignore
  package.json
  src/
    index.js           — Express-сервер, роутинг событий
    gemini.js          — работа с Gemini API
    bitrix.js          — работа с Bitrix24 REST API
    handlers/
      onImBotMessage.js  — хэндлер сообщений чат-бота
      onCrmLeadAdd.js    — хэндлер нового лида
      onCrmDealAdd.js    — хэндлер новой сделки
```
