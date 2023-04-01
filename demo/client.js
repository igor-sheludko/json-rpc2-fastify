//
// Demo: JSON-RPC client over fetch
//
const jsonRpc = require('../json-rpc');
const fetchJsonRpc = jsonRpc.fetchJsonRpc;
const fetchJsonRpcBatch = jsonRpc.fetchJsonRpcBatch;

async function main() {
    let result; 
    
    result = await fetchJsonRpc(
        'http://localhost:4040/jrpc',
        'ping',
        { name: 'Master' },
        1,
    );
    console.log(result);

    result = await fetchJsonRpc(
        'http://localhost:4040/jrpc',
        'concat',
        { terms: ['King', 'Kong', 'loves', 'New York'] },
    );
    console.log(result);

    result = await fetchJsonRpcBatch(
        'http://localhost:4040/jrpc',
        [
            {
                method: 'concat',
                params: { terms: [1, 2, 3, 4, 5] },
                id: 1001,
            },
            {
                method: 'power',
                params: { terms: [2, 5] },
                id: 1002,
            },
            null
        ]
    );
    console.log(result);

    result = await fetchJsonRpc(
        'http://localhost:4040/jrpc',
        'welcome',
        { name: 'King Kong' },
    );
    console.log(result);
}

main();
