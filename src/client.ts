
import * as Https  from 'https';
import * as Query  from 'querystring'; 
import * as TelegramAPI from './api';

export declare interface TelegramBot 
{
    on (event: 'error',                 listener: (p: Error | string) => void): this;
    on (event: 'message',               listener: (p: TelegramAPI.Message) => void): this;
    on (event: 'edited_message',        listener: (p: TelegramAPI.Message) => void): this;
    on (event: 'channel_post',          listener: (p: TelegramAPI.Message) => void): this;
    on (event: 'edited_channel_post',   listener: (p: TelegramAPI.Message) => void): this;
    on (event: 'inline_query',          listener: (p: TelegramAPI.InlineQuery) => void): this;
    on (event: 'chosen_inline_result',  listener: (p: TelegramAPI.ChosenInlineResult) => void): this;
    on (event: 'callback_query',        listener: (p: TelegramAPI.CallbackQuery) => void): this;
    on (event: 'shipping_query',        listener: (p: TelegramAPI.ShippingQuery) => void): this;
    on (event: 'pre_checkout_query',    listener: (p: TelegramAPI.PreCheckoutQuery) => void): this;
}

export class TelegramBot extends TelegramAPI.TelegramAPI
{
    /**
     * Each bot is given a unique authentication token when it is created. 
     * The token looks something like 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
     */
    private token: string;

    /**
     * When this flag is true, when this object recives an update, 
     * immediately re-send another getUpdates request for next updates.
     */
    private continueUpdates: boolean = false;


    /**
     * Last update_id received. Update identifiers 
     * start from a certain positive number and increase sequentially. 
     * This ID becomes especially handy if you’re using Webhooks, 
     * since it allows you to ignore repeated updates or to restore 
     * the correct update sequence, should they get out of order. 
     * If there are no new updates for at least a week, then identifier 
     * of the next update will be chosen randomly instead of sequentially.
     */
    private lastUpdateId: number = 0;


    constructor (token: string)
    {
        super ();

        // Token for the authentication
        this.token = token;

        // Start the polling of the updates
        // this.start ();
    }

    /**
     * Put this object into listening state.
     * The object will emit events for each new update.
     */
    public start ()
    {
        if (this.continueUpdates === false)
            this.dispatchUpdates ();
    }

    /**
     * Stop this object form the listening state.
     * After the response of the getUpdates request it 
     * will not make any other requests.     * 
     */
    public stop ()
    {
        if (this.continueUpdates === true)
            this.continueUpdates = false;
    }

    /**
     * Continue to make getUpdates requests and 
     * emit the appropriate event until the flag continueUpdates is true.
     */
    private async dispatchUpdates ()
    {
        // Set the flag to true
        this.continueUpdates = true;

        while (this.continueUpdates)
        {
            try
            {
                // Obtains update after the last that I have received
                let updates = await this.getUpdates ({ timeout: 60, offset: this.lastUpdateId + 1 });

                // Iterate over all updates
                for (let update of updates) for (let key in update)
                {
                    // It emits events for every properties expect for update_id
                    if (key != 'update_id')
                        this.emit (key, (update as any)[key]);
                }

                // Cambia l'ID dell'ultimo aggiornamento
                if (updates.length)
                    this.lastUpdateId = updates[updates.length-1].update_id;
            }

            catch (error)
            {
                // It emits the error raised in the getUpdates request.
                this.emit ('error', error);
            }
        }
    }

    /**
     * Make an HTTPS POST request to the Telegram server 
     */
    public async oldRequest (method: string, params?: object): Promise<any>
    {
        return new Promise ((resolve, reject) =>
        {
            // Format the parameters into application/x-www-form-urlencoded
            // format. This will be the body of the HTTP request.
            let body = params ? Query.stringify (params) : '';

            // Initialize the HTTP request using the built-in module
            let request = Https.request (
            { 
                // All methods can be made with POST requests
                method: 'POST', 

                // The path contains the authentication token
                // and the method of the Telegram API
                path: '/bot' + this.token + '/' + method, 

                // Hostname of Telegram's servers
                hostname: 'api.telegram.org',

                // Headers that specify the type and length of the body
                headers: 
                { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength (body) 
                },

            }, (response) =>
            {
                // The chunks that compose the HTTP response body
                let chunks: Array<Buffer> = [];

                // Set the callbacks for error in the errors and chunks
                response.on ('error', (error: Error ) => reject (error));
                response.on ('data',  (chunk: Buffer) => chunks.push (chunk));
                
                // Callback called when the response is completed.
                // Now the concatenation of chunks is the whole response body.
                response.on ('end', () =>
                {
                    try
                    {
                        // Produce a string from the chunks
                        let json = Buffer.concat (chunks).toString('utf8');

                        // Parse the string as a JSON
                        let parsed = JSON.parse (json);
                        
                        // The response contains a JSON object, which always has a Boolean field ‘ok’
                        // and may have an optional String field ‘description’ 
                        // with a human-readable description of the result. 
                        // If ‘ok’ equals true, the request was successful and the result of the query
                        // can be found in the ‘result’ field. In case of an unsuccessful request, 
                        // ‘ok’ equals false and the error is explained in the ‘description’. 
                        parsed.ok ? resolve (parsed.result) : reject (new Error (parsed.description));
                    }

                    catch (error)
                    {
                        // Catch errors in the parsing phase 
                        reject (error);
                    }
                });
            });

            // Catch errors during the request to the server
            request.on ('error', error => reject (error));

            // Write the body of the request and close the request.
            request.write (body);
            request.end ();
        });
    }

    /**
     * Make an HTTPS POST multipart/form-data request to the Telegram server 
     */
    public async postRequest (method: string, params: { [s: string]: any }): Promise<any>
    {
        return new Promise ((resolve, reject) =>
        {
            // The separator used in the multipart request
            let boundary = 'FkEDmYLIktZjh6eaHViDpH0bbx';

            // Parts the compose the body of the request
            let parts: Array<Buffer> = []

            for (let name in params)
            {
                // Print the headers of this parameter
                parts.push (Buffer.from ('--' + boundary + '\r\nContent-Disposition: form-data; name="' + name + '"'));
                
                // If this parameter is a buffer send it as binary data
                if (params[name].name && params[name].data)
                    parts.push (Buffer.from('; filename="'+ params[name].name +'"\r\nContent-Type: application/octet-stream\r\n\r\n'), params[name].data);

                // Else it is converted into a string
                else
                    parts.push (Buffer.from('\r\n\r\n' + params[name]));

                // Conclude the part for this parameter
                parts.push (Buffer.from('\r\n'));
            }

            if (parts.length)
            {
                // Add the final separator to conclude the request
                parts.push (Buffer.from ('--' + boundary + '--\r\n'));
            }

            // Create the body concatenating the parts
            let body: Buffer = Buffer.concat (parts);
  
            // Initialize the HTTP request using the built-in module
            let request = Https.request (
            { 
                // All methods can be made with POST requests
                method: 'POST', 

                // The path contains the authentication token
                // and the method of the Telegram API
                path: '/bot' + this.token + '/' + method, 

                // Hostname of Telegram's servers
                hostname: 'api.telegram.org',

                // Headers that specify the type and length of the body
                headers: 
                { 
                    'Content-Type': 'multipart/form-data; boundary=' + boundary,
                    'Content-Length': body.byteLength 
                },

            }, (response) =>
            {
                // The chunks that compose the HTTP response body
                let chunks: Array<Buffer> = [];

                // Set the callbacks for error in the errors and chunks
                response.on ('error', (error: Error ) => reject (error));
                response.on ('data',  (chunk: Buffer) => chunks.push (chunk));
                
                // Callback called when the response is completed.
                // Now the concatenation of chunks is the whole response body.
                response.on ('end', () =>
                {
                    try
                    {
                        // Produce a string from the chunks
                        let json = Buffer.concat (chunks).toString('utf8');

                        // Parse the string as a JSON
                        let parsed = JSON.parse (json);
                        
                        // The response contains a JSON object, which always has a Boolean field ‘ok’
                        // and may have an optional String field ‘description’ 
                        // with a human-readable description of the result. 
                        // If ‘ok’ equals true, the request was successful and the result of the query
                        // can be found in the ‘result’ field. In case of an unsuccessful request, 
                        // ‘ok’ equals false and the error is explained in the ‘description’. 
                        parsed.ok ? resolve (parsed.result) : reject (new Error (parsed.description));
                    }

                    catch (error)
                    {
                        // Catch errors in the parsing phase 
                        reject (error);
                    }
                });
            });

            // Catch errors during the request to the server
            request.on ('error', error => reject (error));

            // Write the body of the request and close the request.
            request.write (body);
            request.end ();
        });
    }
}