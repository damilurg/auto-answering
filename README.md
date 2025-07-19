# Telegram Dynamic Responder

A robust Telegram bot that dynamically responds to messages using predefined triggers and replies. It logs messages and errors for auditing and debugging purposes and simulates real-user typing behavior before replying.

## Features

- Handles incoming Telegram webhooks for message events.
- Simulates typing behavior before sending responses.
- Logs all received messages into `messages.log`.
- Logs all errors into `errors.log`.
- Dynamic responses based on triggers defined in `config.json`.
- Easily configurable via `.env` and `config.json`.

## Prerequisites

- Node.js
- Telegram Bot Token

## Installation
```shell
npm install
```

## Configuration
1. Create a `.env` file in the root directory with the following variables:

```shell
BOT_TOKEN=<your_telegram_bot_token>
OWNER_ID=<your_telegram_user_id>
WEBHOOK_URL=https://your.domain.com
PORT=3000
SAVE_LOCAL=true
```

2. Customize `config.json` to set your triggers and replies.

Example config.json with localization support:

```json
{
  "typingDelay": 1500,
  "languages": ["en", "ru"],
  "defaultLang": "en",
  "responses": {
    "en": [
      {
        "triggers": ["hi", "hello", "hey"],
        "replies": ["Hello! 👋", "Hi there! How can I help you?"]
      }
    ],
    "ru": [
      {
        "triggers": ["привет", "здравствуй"],
        "replies": ["Привет! 👋", "Здравствуйте! Чем могу помочь?"]
      }
    ]
  }
}
```

## Usage
Start the bot with:

```javascript
npm start
```
The bot will automatically set the Telegram webhook on startup.

## Logs
* Incoming messages are saved to `messages.log` (if enabled in `.env`)
* Errors are logged into `errors.log`

## Deployment
Ensure your server is accessible via the public URL defined in `WEBHOOK_URL`.
Use services like Render, Railway, or Cloudflare Pages with Workers for hosting.



