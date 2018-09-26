# Telegram Bot API for Node.js

This is a Node.js module to comunicate with official Telegram Bot API. To use this module the bot token is **required** and can be obtained by talking to [@botfather](https://telegram.me/BotFather).

This module is written in Typescript and contains the definitions of all official methods and structures useful for type checking.

For all the requests it return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), this simplify the asynchronous procedures for example:
 
 ```ts
import { TelegramBot } from 'telegram-bot-js'

// replace the value below with the Telegram token you receive from @BotFather
const token = 'YOUR_TELEGRAM_BOT_TOKEN';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot (token);

// Listen for any kind of message. There are different kinds of
// messages.
bot.on ('message', async msg => 
{
    // Send a message to the chat acknowledging receipt of their message
    let result = await bot.api.sendMessage ({ chat_id: msg.chat.id, text: 'Received your message' });

    // Write the server response to the terminal
    console.log (result);
});