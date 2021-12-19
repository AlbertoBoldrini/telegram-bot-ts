/**
 * This script is used to procedurally generate the api.ts file.
 * It is not required to run the module.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');


(async () => {
    const browser = await puppeteer.launch(
    {
        executablePath: '/usr/bin/google-chrome-stable',
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
         * Find the return value in the text
         */
        function findReturnValue(desc)
        {
            if (desc.includes('Returns True on success'))
                return 'boolean'
            else if (desc.includes('Returns Int on success.'))
                return 'number'

            return '???'
        }

        /**  
         * Create an empty interface with a comment and return the code 
         */
        function makeEmptyInferface (name, comment)
        {
            return makeComment(0, comment) + 'export interface ' + name + '\n{\n\n}\n';
        }

        let returnTypes =
        {
            'getUpdates': 'Array<Update>',
            'setWebhook': 'boolean',
            'deleteWebhook': 'boolean',
            'getWebhookInfo': 'WebhookInfo',
            'getMe': 'User',
            'logOut': 'boolean',
            'close': 'boolean',
            'sendMessage': 'Message',
            'forwardMessage': 'Message',
            'copyMessage': 'MessageId',
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
            'sendPoll': 'Message',
            'sendDice': 'Message',
            'sendChatAction': 'boolean',
            'getUserProfilePhotos': 'UserProfilePhotos',
            'getFile': 'File',
            'banChatMember': 'boolean',
            'unbanChatMember': 'boolean',
            'restrictChatMember': 'boolean',
            'promoteChatMember': 'boolean',
            'setChatAdministratorCustomTitle': 'boolean',
            'banChatSenderChat': 'boolean',
            'unbanChatSenderChat': 'boolean',
            'setChatPermissions': 'boolean',
            'exportChatInviteLink': 'string',
            'createChatInviteLink': 'ChatInviteLink',
            'editChatInviteLink': 'ChatInviteLink',
            'revokeChatInviteLink': 'ChatInviteLink',
            'approveChatJoinRequest': 'boolean',
            'declineChatJoinRequest': 'boolean',
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
            'getMyCommands': 'Array<BotCommand>',
            'editMessageText': 'Message | boolean',
            'editMessageCaption': 'Message | boolean',
            'editMessageMedia': 'Message | boolean',
            'editMessageReplyMarkup': 'Message | boolean',
            'stopPoll': 'Poll',
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

                
                if (returnTypes[methodName])
                    returnType = returnTypes[methodName]
                else
                    returnType = findReturnValue(description)


                if (table && table.tagName === 'TABLE')
                {
                    methods.push (makeComment(1, description), '    public async ', methodName, '(params: ', interfaceName, '): Promise<', returnType ,'> {\n');
                    methods.push ('        return this.request(\'', methodName, '\', params);\n    }\n');
                }

                else
                {
                    methods.push (makeComment(1, description), '    public async ', methodName, '(): Promise<', returnType ,'> {\n');
                    methods.push ('        return this.request(\'', methodName, '\', {});\n    }\n');
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

                if (interfaceName.startsWith ('BotCommandScope'))
                    interfaceName += ' extends BotCommandScope';

                if (interfaceName.startsWith ('ChatMember'))
                    interfaceName += ' extends ChatMember';
                
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
        interfaces.push (makeEmptyInferface('ChatMember', 'This object contains information about one member of a chat. Currently, the following 6 types of chat members are supported.'));
        interfaces.push (makeEmptyInferface('VoiceChatStarted', 'This object represents a service message about a voice chat started in the chat. Currently holds no information.'));
        interfaces.push (makeEmptyInferface('BotCommandScope', 'This object represents the scope to which bot commands are applied.'));


        return { methods: methods.join(''), interfaces: interfaces.join('') };
    });

    fs.readFile ('gen/skel-api.ts', 'utf8', (error, code) =>
    {
        if (error)
        {
            console.error (error);
            return;
        }

        code = code.replace ('/** METHODS **/', output.methods);
        code = code.replace ('/** INTERFACES **/', output.interfaces);

        fs.writeFileSync ('src/api.ts', code);
    });

    

    await browser.close();

})();