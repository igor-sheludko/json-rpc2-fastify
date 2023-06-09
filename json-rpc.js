//
// JSON-RPC server over Fastify and client over fetch
//
// https://www.jsonrpc.org/specification
//
//

const Fastify = require('fastify');

class JsonRpcServer {
    constructor (options) {
        const serverOptions = options;
        serverOptions.logger = options.logger || false;
        serverOptions.entryPoint = `/${options.entryPoint || 'json-rpc'}`;
        serverOptions.port = options.port || 4040;
        serverOptions.repeatRequestInResponse = options.repeatRequestInResponse || false;

        this.fastify = Fastify({ logger: serverOptions.logger });

        if (!serverOptions.methods) {
            console.log(`\nWARNING! "options.methods" value not set!\n`);
        }

        this.serverOptions = serverOptions;
        this.fastify.serverOptions = serverOptions;
        this.fastify.callRpc = this.callRpc;

        const bodyValidator = {
            body: {
                type: 'object',
                required: ['jsonrpc', 'method', ],
                properties: {
                    jsonrpc: { type: 'string', enum: ['2.0'] },
                    method: { type: 'string' },
                    params: { type: 'object' },
                    id: { type: 'string' },
                },
            }
        }

        this.fastify.get(
            serverOptions.entryPoint, 
            this.httpGet
        );

        this.fastify.post(
            serverOptions.entryPoint, 
            { schema: bodyValidator }, 
            this.router
        );
    } 

    async start() {
        try {
            await this.fastify.listen({ port: this.serverOptions.port });
            if (this.serverOptions.logger) { 
                console.log(`\nJSON-RPC server starts at http://localhost:${this.serverOptions.port}${this.serverOptions.entryPoint}\n`);
            }
        } catch (err) {
            this.fastify.log.error(err);
            process.exit(1);
        }
    }

    async httpGet(request, reply) {
        return `To use JSON-RPC server please use POST http://localhost:${this.serverOptions.port}${this.serverOptions.entryPoint}`;
    }

    // TO DO: Add request validation
    // TO DO: Rework for batch
    async router(request, reply) {
        const id = request.body?.id;
        const method = request.body?.method;
        const params = request.body?.params;

        const batch = request.body?.batch;

        if (batch?.length) {
            const validBatch = batch.filter(b => 
                b?.method && b?.params && b?.id
            );

            const awaits = validBatch.map(b => 
                this.callRpc(b.method, b.params, b.id)
            );
            const responses = await Promise.all(awaits);
            return responses;
        }
        else {
            const response = await this.callRpc(method, params, id);
            return response;
        }
    }

    async callRpc(
        method,
        params,
        id
    ) {
        let error;
        let result;
        const errorMessage = `JSON-RPC server method '${method}' is not found`;

        const serverMethods = this.serverOptions?.methods || {};
        const methodToCall = serverMethods[method];

        if (methodToCall) {
            result = await methodToCall(params);
        }
        else {
            error = {
                code: JsonRpcErrorTypes.ERROR_METHOD_NOT_FOUND,
                message: errorMessage,
            }
        }

        let response = {
            jsonrpc: '2.0',
            result,
            error,
            id,
        }

        if (this.serverOptions?.repeatRequestInResponse) {
            response = {
                ...response,
                // additional, not required
                request: {
                    method,
                    params,
                }
            }
        } 

        return response;
    }
}

// Errors
/*
-32700	Parse error	        Invalid JSON was received by the server.An error occurred on the server while parsing the JSON text.
-32600	Invalid Request	    The JSON sent is not a valid Request object.
-32601	Method not found	The method does not exist / is not available.
-32602	Invalid params	    Invalid method parameter(s).
-32603	Internal error	    Internal JSON-RPC error.
-32000 to -32099	Server error	Reserved for implementation-defined server-errors.
*/

const JsonRpcErrorTypes = {
    ERROR_INVALID_JSON_RECEIVED: -32700,
    ERROR_INVALID_REQUEST: -32600,
    ERROR_METHOD_NOT_FOUND: -32601,
    ERROR_INVALID_PARAMS: -32602,
    ERROR_INTERNAL_ERROR: -32603,
    ERROR_SERVER_SPECIFIC_ERROR: -32050,
}

//
// JSON-RPC client over fetch
//
async function fetchJson(
    url,
    body
) {
    let ok = false;
    let error;
    let data;

    try {
        const headers = new Headers();
        headers.append('content-type', 'application/json;charset=utf-8');
        
        const options = {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        };

        const response = await fetch(
            url, 
            options
        );

        ok = response.ok;
        if (ok) {
            data = await response.json();
        }
        else {
            error = await response.json();
        }
    }
    catch(err) {
        error = err;
    }

    return {
        ok,
        data,
        error,
    };
}

async function fetchJsonRpc(
    url,
    method,
    params,
    id,
    defaultResult = null
) {
    let data = defaultResult;
    let error;
    const requestId = id || new Date().getTime();

    const response = await fetchJson(
        url,
        {
            jsonrpc: '2.0',
            method,
            params,
            id: requestId,
        }
    );

    const ok = response.ok;
    if (ok) {
        data = response.data.id == requestId ? response.data : defaultResult;
    }
    else {
        error = response.error;
    };

    return {
        ok,
        data,
        error,
    };
}

async function fetchJsonRpcBatch(
    url,
    batch,
) {
    const response = await fetchJson(
        url,
        {
            batch,
        }
    );

    return response;
}

//
class JsonRpcClient {
    constructor (url) {
        this.url = url;
    }

    async call(
        method,
        params,
        defaultResult = null
    ) {
        return fetchJsonRpc(
            this.url,
            method,
            params,
            new Date().getTime(),
            defaultResult
        )
    }

    async callNotify(
        method,
        params,
    ) {
        return fetchJsonRpc(
            this.url,
            method,
            params,
            undefined,
            null
        )
    }

    async callBatch(batch) {
        return fetchJsonRpcBatch(
            this.url,
            batch
        )
    }
}

module.exports.JsonRpcServer = JsonRpcServer;
module.exports.JsonRpcClient = JsonRpcClient;
module.exports.fetchJsonRpc = fetchJsonRpc;
module.exports.fetchJsonRpcBatch = fetchJsonRpcBatch;
module.exports.fetchJson = fetchJson;

