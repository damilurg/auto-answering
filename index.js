require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const OWNER_ID = process.env.OWNER_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const SAVE_LOCAL = process.env.SAVE_LOCAL
const configPath = './config.json';
const messagesLogPath = './messages.log';
let config = require(configPath);

// Emulate typing behavior
const simulateTyping = async (delay) => {
    await new Promise((resolve) => setTimeout(resolve, delay));
};

// Save the message to the log
const saveMessage = (message, save = Boolean(SAVE_LOCAL) ?? true) => {
    if (save) {
        const logEntry = `${new Date().toISOString()} - ${JSON.stringify(message)}\n`;
        fs.appendFile(messagesLogPath, logEntry, (err) => {
            err ? console.error('Error writing to log:', err) : console.log('Message saved to log');
        });
    }
};


// Webhook event handler
app.post('/business-webhook', async (req, res) => {
    const {business_message: update} = req.body;

    if (!update) {
        return res.status(400).send('Invalid update');
    }

    const {text, business_connection_id, chat: {id: chatId}} = update;

    saveMessage(update);

    // Find an appropriate response
    const response = config.responses.find((item) => {
        return item.triggers.some((trigger) => text?.toLowerCase().includes(trigger));
    });
    if (response && update.from.id !== Number(OWNER_ID)) {

        const replyText = response.replies[Math.floor(Math.random() * response.replies.length)];

        await sendChatAction(business_connection_id, chatId, 'typing')

        // Simulate real user behavior
        await simulateTyping(config.typingDelay);

        await sendMessage(business_connection_id, chatId, replyText ?? '')

        return res.status(200).send({ok: true, reply: replyText});
    }
    res.status(200).send({ok: true});
});

// Send a message
async function sendMessage(id, chatId, text) {
    try {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            business_connection_id: id, chat_id: chatId, text: text,
        });
    } catch (error) {
        console.error('Error sending message:', error.response?.data || error.message);
    }
}

async function sendChatAction(id, chatId, action) {
    try {
        await axios.post(`${TELEGRAM_API}/sendChatAction`, {
            business_connection_id: id, chat_id: chatId, action,
        });
    } catch (error) {
        console.error('Error sending action:', error.response?.data || error.message);
    }
}

// Set up the webhook
async function setWebhook() {
    const webhookUrl = `${process.env.WEBHOOK_URL}/business-webhook`;
    try {
        await axios.post(`${TELEGRAM_API}/setWebhook`, {
            url: webhookUrl,
        });
    } catch (error) {
        console.error('Error setting webhook:', error.response?.data || error.message);
    }
}

// Start the server
app.listen(PORT, async () => {
    await setWebhook();
});
