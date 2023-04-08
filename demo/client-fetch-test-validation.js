//
// Demo: JSON-RPC client over fetch
//
const jsonRpc = require('../json-rpc');
const fetchJson = jsonRpc.fetchJson;

async function main() {
    let result; 

    // Validation error - 400 Bad Request: jsonrpc is not a '2.0'
    result = await fetchJson(
        'http://localhost:4040/jrpc',
        {
            jsonrpc: '2',
            method: 'ping',
        }
    );
    console.log(result);

    // Validation error - 400 Bad Request: missing method
    result = await fetchJson(
        'http://localhost:4040/jrpc',
        {
            jsonrpc: '2.0',
            call: 'ping',
        }
    );
    console.log(result);

    // OK, params are not required
    result = await fetchJson(
        'http://localhost:4040/jrpc',
        {
            jsonrpc: '2.0',
            method: 'ping',
        }
    );
    console.log(result);
    
    // Validation error: params is not an object
    result = await fetchJson(
        'http://localhost:4040/jrpc',
        {
            jsonrpc: '2.0',
            method: 'ping',
            params: 'Master',
        }
    );
    console.log(result);

}

main();
