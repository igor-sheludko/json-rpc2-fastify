//
// Demo: JSON-RPC client class over fetch
//
const JsonRpcClient = require('../json-rpc').JsonRpcClient;

async function main() {
    const client = new JsonRpcClient('http://localhost:4040/jrpc');

    let result; 
    
    result = await client.call('ping', { name: 'Master' }, 1);
    console.log(result);

    result = await client.call('concat', { terms: ['King', 'Kong', 'loves', 'New York'] });
    console.log(result);

    result = await client.callBatch(
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

    result = await client.call('welcome', { name: 'King Kong' });
    console.log(result);
}

main();
