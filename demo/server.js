//
// Demo: JSON-RPC server over Fastify
//
const JsonRpcServer = require('../json-rpc').JsonRpcServer;

const server = new JsonRpcServer({
    logger: true,
    port: 4040,
    entryPoint: 'jrpc',
    methods: {
        ping: async function (params) {
            const name = params?.name || 'Stranger';
            return {
                message: `Pong dear ${name}`,
            }
        },
        concat: async function (params) {
            const terms = params?.terms || [];
            const result = terms.join(' ');

            return result;
        }
    }
});

server.start();
