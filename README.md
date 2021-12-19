# Telegram Bot API for Node.js

This is a Node.js module to communicate with official Telegram Bot API. To use this module the bot token is **required** and can be obtained by talking to [@botfather](https://telegram.me/BotFather).

Why use this module instead of others?
 - It has no dependencies. It reduce the size of your project.

 - It is completely written in Typescript and contains the definitions of all [official methods and structures](https://core.telegram.org/bots/api) useful for type checking. This means that the editor can suggest you errors, name and the official documentation for each member.
 
 - It can be used without or with a little abstraction. This allows you to finely control your bot without being limited by this module.

 - For all the requests it return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), this simplify the asynchronous procedures.

# How to install
Copy the src/api.ts file in your project. 
Import the class *TelegramBotRaw* and all the interfaces you need.
If you want you can copy also the file emitter.ts which contains the class TelegramBotEmitter that can help you to setup a message loop.

# How to use
This module exports two different objects to do the same things:
- [Raw](#Raw) (only official methods)
- [Emitter](#Emitter) (official methods + emitting an event for each new update)



## Raw
It provides all the official methods without any abstraction. All methods accept the same parameters specified in the [Telegram Bot API documentation](https://core.telegram.org/bots/api) and return a Promise with the result specified in the official documentation.
 ```ts
import * as TelegramBot from 'telegram-bot-js'

// Replace the value below with the Telegram token you receive from @BotFather
const token = '<BOT-TOKEN>';

// Create an object that manages the Telegram bot and receives the updates.
const bot = new TelegramBot.Raw (token);

// Send the message to a specific chat
let promise = bot.sendMessage ({ chat_id: '<A chat id>', text: 'Hello world!' });
 ```

## Emitter
It simplifies the management of updates. The object is an EventEmitter so it is possible to add listners. The events emitted have the nams taken from the update types specified in the [Update](https://core.telegram.org/bots/api#update) object in the documentation: *message*, *edited_message*, *channel_post*, ...
 
 
It contains a member *api* that is the raw client discussed above.

 
 ```ts
import * as TelegramBot from 'telegram-bot-js'

// Replace the value below with the Telegram token you receive from @BotFather
const token = '<BOT-TOKEN>';

// Create an object that manages the Telegram bot and receives the updates.
const bot = new TelegramBot.Emitter (token);

// Listen for message events. The list of possible events is specified 
// here (https://core.telegram.org/bots/api#update)
bot.on ('message', async msg => 
{
    // Send a message to the chat acknowledging receipt of their message
    let result = await bot.api.sendMessage ({ chat_id: msg.chat.id, text: 'Hi!' });

    // Write the server response to the terminal
    console.log (result);
});