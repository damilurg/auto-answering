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
