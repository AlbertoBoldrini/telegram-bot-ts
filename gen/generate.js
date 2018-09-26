
const puppeteer = require('puppeteer-core');
const fs = require('fs');


(async () => {
    const browser = await puppeteer.launch(
    {
        executablePath: 'chromium',
        headless: true,
    });

    const page = await browser.newPage();

    await page.goto('https://core.telegram.org/bots/api');

    let output = await page.evaluate (() =>
    {
        // The tab character used in the indentation
        const tab = '    ';

        /**
         * Return true if the string start with a lowercase char
         */
        function startsWithLowercase (str)
        {
            return str.charAt(0).toUpperCase() !== str.charAt(0);
        }

        /** 
         * Wrap the text in lines of max length maxLineLength .
         */
        function wrapText (text, maxLineLength)  
        {
            const words = text.replace(/[\r\n]+/g, ' ').split(' ');
            let lineLength = 0;
            
            // use functional reduce, instead of for loop 
            return words.reduce((result, word) => {
              if (lineLength + word.length >= maxLineLength) {
                lineLength = word.length;
                return result + `\n${word}`; // don't add spaces upfront
              } else {
                lineLength += word.length + (result ? 1 : 0);
                return result ? result + ` ${word}` : `${word}`; // add space only when needed
              }
            }, '');
          }
        
        
        function makeComment (nIndentations, text)
        {
            // Create the identation string repeating the tab chat nIndentations times. 
            let indentation = Array(nIndentations+1).join(tab);

            // Open the comment
            let output = '\n' + indentation + '/**\n';

            // Wrap the text into 80 characters lines
            output += wrapText(text, 80).split('\n').map (line => indentation + ' * ' + line).join('\n');
            
            // Close the comment and return
            return output + indentation + '\n' + indentation + ' */\n';;
        }

        /**
         * Convert the type in the Telegram documentation in a Typescript type
         */
        function typenize (type)
        {
            let typewords = type.split(' ');

            if (typewords.length === 1)
            {
                if (typewords[0] === 'Integer' || typewords[0] === 'Float')
                    return 'number';

                else if (typewords[0] === 'String')
                    return 'string';

                else if (typewords[0] === 'Boolean' || typewords[0] === 'True' || typewords[0] === 'False')
                    return 'boolean';
                
                else if (typewords[0] === 'InputFile')
                    return '{ name: string, data: Buffer }';

                else if (typewords[0] === 'CallbackGame')
                    return 'any';

                else
                    return typewords[0];
            }

            else if (typewords.length === 3)
            {
                if (typewords[0] === 'Array' && typewords[1] === 'of')
                    return 'Array<' + typenize(typewords[2]) + '>';

                else if (typewords[1] === 'or')
                    return typenize(typewords[0]) + ' | ' + typenize(typewords[2]);
            }

            return 'any';
        }

        /**  
         * Create an empty interface with a comment and return the code 
         */
        function makeEmptyInferface (name, comment)
        {
            return makeComment(0, comment) + 'export interface ' + name + '\n{\n\n}\n';
        }

        function makeMethodWithoutParams (methodName, comment)
        {
            let out = [];
            out.push (makeComment(1, comment), '    public async ', methodName, ' (): Promise<', returnTypes[methodName] ,'>\n');
            out.push (tab + '{\n' + tab + tab + 'return this.postRequest (\'', methodName, '\', {});\n' + tab + '}\n');
        }

        let returnTypes =
        {
            'getUpdates': 'Array<Update>',
            'setWebhook': 'boolean',
            'deleteWebhook': 'boolean',
            'getWebhookInfo': 'WebhookInfo',
            'getMe': 'User',
            'sendMessage': 'Message',
            'forwardMessage': 'Message',
            'sendPhoto': 'Message',
            'sendAudio': 'Message',
            'sendDocument': 'Message',
            'sendVideo': 'Message',
            'sendAnimation': 'Message',
            'sendVoice': 'Message',
            'sendVideoNote': 'Message',
            'sendMediaGroup': 'Array<Message>',
            'sendLocation': 'Message',
            'editMessageLiveLocation': 'Message | boolean',
            'stopMessageLiveLocation': 'Message | boolean',
            'sendVenue': 'Message',
            'sendContact': 'Message',
            'sendChatAction': 'boolean',
            'getUserProfilePhotos': 'UserProfilePhotos',
            'getFile': 'File',
            'kickChatMember': 'boolean',
            'unbanChatMember': 'boolean',
            'restrictChatMember': 'boolean',
            'promoteChatMember': 'boolean',
            'exportChatInviteLink': 'string',
            'setChatPhoto': 'boolean',
            'deleteChatPhoto': 'boolean',
            'setChatTitle': 'boolean',
            'setChatDescription': 'boolean',
            'pinChatMessage': 'boolean',
            'unpinChatMessage': 'boolean',
            'leaveChat': 'boolean',
            'getChat': 'Chat',
            'getChatAdministrators': 'Array<ChatMember>',
            'getChatMembersCount': 'number',
            'getChatMember': 'ChatMember',
            'setChatStickerSet': 'boolean',
            'deleteChatStickerSet': 'boolean',
            'answerCallbackQuery': 'boolean',
            'editMessageText': 'Message | boolean',
            'editMessageCaption': 'Message | boolean',
            'editMessageMedia': 'Message | boolean',
            'editMessageReplyMarkup': 'Message | boolean',
            'deleteMessage': 'boolean',
            'sendSticker': 'Message',
            'getStickerSet': 'StickerSet',
            'uploadStickerFile': 'File',
            'createNewStickerSet': 'boolean',
            'addStickerToSet': 'boolean',
            'setStickerPositionInSet': 'boolean',
            'deleteStickerFromSet': 'boolean',
            'answerInlineQuery': 'boolean',
            'sendInvoice': 'Message',
            'answerShippingQuery': 'boolean',
            'answerPreCheckoutQuery': 'boolean',
            'setPassportDataErrors': 'boolean',
            'sendGame': 'Message',
            'setGameScore': 'Message | boolean',
            'getGameHighScores': 'Array<GameHighScore>',
        };


        let conteiner = document.getElementById ('dev_page_content');

        let h4 = conteiner.getElementsByTagName ('h4');

        let interfaces = [];
        let methods = [];

        methods.push ('import { EventEmitter }  from \'events\';\n\n')
        methods.push ('export abstract class TelegramAPI extends EventEmitter\n{\n');
        methods.push (makeComment(1, 'Make an HTTPS POST request to the Telegram server'));
        methods.push (tab + 'public abstract async postRequest (method: string, params?: any): Promise<any>;\n');

        for (let h4c of h4)
        {
            let interfaceName = h4c.innerText;

            let description = '';

            let table = h4c.nextElementSibling;

            while (table && table.tagName !== 'TABLE' && table.tagName !== 'H4')
            {
                description += table.innerText;
                table = table.nextElementSibling;
            }

            

            if (startsWithLowercase(interfaceName))
            {
                methodName = interfaceName;

                interfaceName += 'Params';
                interfaceName = interfaceName.charAt(0).toUpperCase() + interfaceName.substr(1);


                if (table && table.tagName === 'TABLE')
                {
                    methods.push (makeComment(1, description), '    public async ', methodName, ' (params: ', interfaceName, '): Promise<', returnTypes[methodName] ,'>\n');
                    methods.push ('    {\n        return this.postRequest (\'', methodName, '\', params);\n    }\n');
                }

                else
                {
                    methods.push (makeComment(1, description), '    public async ', methodName, ' (): Promise<', returnTypes[methodName] ,'>\n');
                    methods.push ('    {\n        return this.postRequest (\'', methodName, '\', {});\n    }\n');
                }
            }

            else
            {
                if (interfaceName.endsWith ('MessageContent'))
                    interfaceName += ' extends InputMessageContent';

                if (interfaceName.startsWith ('InlineQueryResult'))
                    interfaceName += ' extends InlineQueryResult';
                
                if (interfaceName.startsWith ('PassportElementError'))
                    interfaceName += ' extends PassportElementError';
                
                if (interfaceName.startsWith ('InputMedia'))
                    interfaceName += ' extends InputMedia';
            }

            if (!table || table.tagName !== 'TABLE')
                continue;
    
            interfaces.push (makeComment(0, description));
            interfaces.push ('export interface ', interfaceName, '\n{\n');

            let rows = [...table.getElementsByTagName ('tr')].slice (1);

            for (let row of rows)
            {
                let tds = row.getElementsByTagName('td');

                let name = tds[0].innerText;
                let type = tds[1].innerText;

                if (tds.length === 3)
                {
                    var desc = tds[2].innerText;
                    var opt  = desc.startsWith('Optional.');
                }

                else if (tds.length === 4)
                {
                    var desc = tds[3].innerText;
                    var opt  = tds[2].innerText === 'Optional';
                }

                
                interfaces.push (makeComment(1, desc));
                interfaces.push ('    ', name);
                
                if (opt)
                    interfaces.push ('?');

                interfaces.push (': ', typenize(type), ',\n');
            }

            
            interfaces.push ('}\n');
        }

        interfaces.push (makeEmptyInferface('InputMedia', 'This object represents the content of a media message to be sent.'));
        interfaces.push (makeEmptyInferface('InputMessageContent', 'This object represents the content of a message to be sent as a result of an inline query.'));
        interfaces.push (makeEmptyInferface('InlineQueryResult', 'This object represents one result of an inline query.'));
        interfaces.push (makeEmptyInferface('PassportElementError', 'This object represents an error in the Telegram Passport element which was submitted that should be resolved by the user.'));

        methods.push ('}');

        return methods.concat(interfaces).join('');
    });

    fs.writeFileSync ('src/api.ts', output);

    await browser.close();

})();