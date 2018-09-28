# Telegram Bot API for Node.js

This is a Node.js module to comunicate with official Telegram Bot API. To use this module the bot token is **required** and can be obtained by talking to [@botfather](https://telegram.me/BotFather).

This module is written in Typescript and contains the definitions of all official methods and structures useful for type checking.

For all the requests it return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), this simplify the asynchronous procedures.


This module exports two objects:
 - **Raw** that provide all the official methods without any abstraction. All methods accept the same parameters specified in the [Telegram Bot API documentation](https://core.telegram.org/bots/api) and return a Promise with the result specified in the official documentation.
 ```ts
import * as TelegramBot from 'telegram-bot-js'

// Replace the value below with the Telegram token you receive from @BotFather
const token = '<BOT-TOKEN>';

// Create an object that manages the Telegram bot and receives the updates.
const bot = new TelegramBot.Raw (token);

// Send the message to a specific chat
let promise = bot.sendMessage ({ chat_id: '<A chat id>', text: 'Hello world!' });
 ```

 - **Manager** (recommanded) that simplifies the management of updates. It is a EventEmitter and is possible to add listner.

 
 ```ts
import * as TelegramBot from 'telegram-bot-js'

// Replace the value below with the Telegram token you receive from @BotFather
const token = '<BOT-TOKEN>';

// Create an object that manages the Telegram bot and receives the updates.
const bot = new TelegramBot.Manager (token);

// Listen for any kind of message. There are different kinds of
// messages.
bot.on ('message', async msg => 
{
    // Send a message to the chat acknowledging receipt of their message
    let result = await bot.api.sendMessage ({ chat_id: msg.chat.id, text: 'Hi!' });

    // Write the server response to the terminal
    console.log (result);
});