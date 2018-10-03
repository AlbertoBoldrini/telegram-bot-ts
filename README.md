# Telegram Bot API for Node.js

This is a Node.js module to communicate with official Telegram Bot API. To use this module the bot token is **required** and can be obtained by talking to [@botfather](https://telegram.me/BotFather).

Why use this module insead compared to others?
 - It has no dependencies. It reduce the size of your project.

 - It is written in Typescript and contains the definitions of all [official methods and structures](https://core.telegram.org/bots/api) useful for type checking. This means that the editor can suggest you errors, name and the official documentation for each member.
 
 - It can be used without or with a little abstraction. This allows you to finely control your bot without being limited by this module.

 - For all the requests it return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), this simplify the asynchronous procedures.

## How to install
Go in your project folder and run the following command:
```bash
$ npm install --save @xalbex/telegram-bot
```



This module exports many object to the the same thing:
- [Raw](#Raw)
- [Emitter](#Emitter)



 #Raw
that provide all the official methods without any abstraction. All methods accept the same parameters specified in the [Telegram Bot API documentation](https://core.telegram.org/bots/api) and return a Promise with the result specified in the official documentation.
 ```ts
import * as TelegramBot from 'telegram-bot-js'

// Replace the value below with the Telegram token you receive from @BotFather
const token = '<BOT-TOKEN>';

// Create an object that manages the Telegram bot and receives the updates.
const bot = new TelegramBot.Raw (token);

// Send the message to a specific chat
let promise = bot.sendMessage ({ chat_id: '<A chat id>', text: 'Hello world!' });
 ```

 - **Emitter** (recommanded) that simplifies the management of updates. It is a EventEmitter and is possible to add listner. The events emitted have the same name of the update specified in the *Update* object in the [documentation](https://core.telegram.org/bots/api#update): *message*, *edited_message*, *channel_post*, ...
 
 
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