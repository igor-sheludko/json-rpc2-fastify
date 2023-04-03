# json-rpc2-fastify

Simple json-rpc server over fastify and client over fetch for Node.js 18+

Protocol specification - https://www.jsonrpc.org/specification

Please see package usage examples in demo subdir.

# Server

First import JsonRpcServer class and call the constructor with options JS object.

Options is: 
* port - the TCP-port number on which the HTTP-server will run, default is 4040 (if you do not set it when initializing the server).
* entryPoint - the path where the server will listen for JSON-RPC requests via HTTP.
* logger - request logging option that is passed to fastify server.
* methods - an object whose properties define functions that can be called remotely via JSON-RPC protocol.

Code sample:

    const JsonRpcServer = require('json-rpc2-fastify').JsonRpcServer;

    const server = new JsonRpcServer({
        logger: true,
        port: 4040,
        entryPoint: 'jrpc',
        methods: {
            ping: async function (params) {
                const name = params?.name;
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

The **ping** function just return an object with **message** to greet `${name}`
