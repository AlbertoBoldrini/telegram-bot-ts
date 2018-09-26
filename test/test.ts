
import { TelegramBot } from '../src/client'

import * as fs from 'fs';



(async ()=>
{
    try
    {
        let bot = new TelegramBot ('632870589:AAG10rKY8KO0iFlSYHMjPfttFA2ZHAeJevE');

        bot.on ('error', error =>
        {
            console.log (error);
        });

        bot.on ('message', message =>
        {
            console.log (message);
        });

        fs.readFile ('./LICENSE', { }, async (err, buffer) =>
        {
            console.log (err);

            let out = await bot.sendDocument ({ chat_id: 35481478, document: { name: "LICENCE", data: buffer }});

            console.log (out);

        });

        

        
    } 

    catch (error)
    {
        console.error (error);
    }

})();


