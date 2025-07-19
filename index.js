require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

// Environment
const PORT = process.env.PORT ?? 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const OWNER_ID = Number(process.env.OWNER_ID);
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const SAVE_LOCAL = process.env.SAVE_LOCAL?.toLowerCase() !== 'false';
const WEBHOOK_URL = process.env.WEBHOOK_URL;

// Config
const messagesLogPath = './messages.log';
const config = require('./config.json');

// Utils

// Emulate typing behavior
const simulateTyping = (ms) => new Promise(r => setTimeout(r, ms));

// Save the message to the log
const saveMessage = (message, save = Boolean(SAVE_LOCAL)) => {
  if (!SAVE_LOCAL) return;

  const logEntry = `${new Date().toISOString()} - ${JSON.stringify(message)}\n`;
  fs.appendFile(messagesLogPath, logEntry, (err) => {
    err ? console.error('Error writing to log:', err) : console.log('Message saved to log');
  });
};

const findAutoReply = (text = '', lang = 'en') => {
  const lowered = text.toLowerCase();
  const localizedResponses = config.responses[lang] ?? config.responses[config.defaultLang];

  return localizedResponses.find((item) =>
    item.triggers.some((trigger) => lowered.includes(trigger))
  );
};

const POST_JSON = {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
};

async function checkFetchResponse(res) {
  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      errorData = {message: 'Failed to parse error response'};
    }
    throw new Error(JSON.stringify(errorData));
  }
  return res;
}


// Send a message with Telegram API
async function sendMessage(id, chatId, text) {
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      ...POST_JSON,
      body: JSON.stringify({business_connection_id: id, chat_id: chatId, text})
    });
    await checkFetchResponse(res);
  } catch (error) {
    console.error('Error sending message:', error.message);
  }
}

async function sendChatAction(id, chatId, action) {
  try {
    const res = await fetch(`${TELEGRAM_API}/sendChatAction`, {
      ...POST_JSON,
      body: JSON.stringify({business_connection_id: id, chat_id: chatId, action})
    });
    await checkFetchResponse(res);
  } catch (error) {
    console.error('Error sending action:', error.response?.data ?? error.message);
  }
}

// Set up the webhook
async function setWebhook() {
  try {
    const res = await fetch(`${TELEGRAM_API}/setWebhook`, {
      ...POST_JSON,
      body: JSON.stringify({url: `${WEBHOOK_URL}/business-webhook`}),
    });
    await checkFetchResponse(res);
    console.log('Webhook set successfully');
  } catch (error) {
    console.error('Error setting webhook:', error.response?.data || error.message);
  }
}

// Webhook Handler
app.post('/business-webhook', async (req, res) => {
  const {business_message: update} = req.body;

  if (!update) {
    return res.status(400).send('Invalid update: missing from');
  }

  const {text, business_connection_id, chat: {id: chatId}} = update;

  saveMessage(update);

  // Find an appropriate response
  const response = findAutoReply(text);

  if (response && update.from.id !== OWNER_ID) {

    const replyText = response.replies[Math.floor(Math.random() * response.replies.length)];

    await sendChatAction(business_connection_id, chatId, 'typing')

    // Simulate real user behavior
    await simulateTyping(config.typingDelay ?? 1500);

    await sendMessage(business_connection_id, chatId, replyText ?? '')

    return res.status(200).send({ok: true, reply: replyText});
  }
  res.status(200).send({ok: true});
});

// Start Server
app.listen(PORT, async () => {
  await setWebhook();
});
