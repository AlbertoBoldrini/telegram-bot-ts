# Typescript Telegram Bot API
This node.js module wraps the official [Telegram Bot API](https://core.telegram.org/bots/api) up to the version 5.5 (December 7, 2021). To use Telegram Bot API, a bot token is **required** and can be obtained by talking to [@botfather](https://telegram.me/BotFather).

Why use this module instead of others?
 - It consists of only one file to be copied in your project without dependencies. This file contains only a class with a simple method to make HTTPS requests. The rest of the code in the file is simply a translation of the official Telegram Bot API using typescript types. 
 You can easily review and trust the code incresing the security of your application. 


 - It is completely written in Typescript and contains the definitions and comments of all [official methods and structures](https://core.telegram.org/bots/api) useful for type checking. Your editor can suggest you errors, name and the official documentation for each member and parameter.
 
 - It can be used without or with a little abstraction. This allows you to finely control your bot without being limited by this module.

 - All requests return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), simplifying the asynchronous procedures.

# How to install
Copy the `src/api.ts` file in your project. 
Import the `TelegramBot` class and all the interfaces you need from it.
If you want you can copy also the file `src/emitter.ts` which contains the class `TelegramBotEmitter` that can help you to setup an event loop.

# How to use
You should use one of the following objects:
- [TelegramBot](#TelegramBot) (only official methods)
- [TelegramBotEmitter](#Emitter) (official methods + emitting an event for each new update)



## TelegramBot
The class `TelegramBot` is initialized using the bot token obtained from the [@botfather](https://telegram.me/BotFather). It contains all the official methods without any abstraction. 
All methods accept the same parameters specified in the [Telegram Bot API](https://core.telegram.org/bots/api) and return a Promise with the result specified in the official documentation.
 ```ts
import { TelegramBot } from './src'

// Replace the value below with the Telegram token you receive from @BotFather
const token = '<BOT-TOKEN>';

// Create an object that manages the Telegram bot and receives the updates.
const bot = new TelegramBot(token);

// Send the message to a specific chat
let promise = bot.sendMessage({ chat_id: '<A chat id>', text: 'Hello world!' });
 ```

## Emitter
The class `TelegramBotEmitter` simplifies the management of updates. The object is an `EventEmitter` so it is possible to add all the listners you want. The events emitted have the same names  of the update types specified in the [Update](https://core.telegram.org/bots/api#update) object: *message*, *edited_message*, *channel_post*, ...
 
 
It contains a member `api` that is the raw `TelegramBot` object discussed above.

 
 ```ts
import { TelegramBotEmitter } from './emitter'

// Replace the value below with the Telegram token you receive from @BotFather
const token = '<BOT-TOKEN>';

// Create an object that manages the Telegram bot and receives the updates.
const bot = new TelegramBotEmitter(token);

// Listen for message events. The list of possible events is specified 
// here (https://core.telegram.org/bots/api#update)
bot.on('message', async msg => {

    // Send a message to the chat acknowledging receipt of their message
    let result = await bot.api.sendMessage ({ chat_id: msg.chat.id, text: 'Hi!' });

    // Write the server response to the terminal
    console.log (result);
});