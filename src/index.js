const util = require('util');
const yenv = require('yenv');
const Watcher = require('./domain/watcher');
const { performance } = require('perf_hooks');
const env = yenv();



exports.handler = async (event, context) => {
    try
    {
        const start = performance.now();
        const watcher = new Watcher('somos-belcorp');
        await watcher.verify();
        const execTime = performance.now() - start;
        console.log(`Tiempo total: ${execTime}`);
        return {
            statusCode: 200,
            body: JSON.stringify("Ok")
          };
    }
    catch(e){

        console.log(e);
    }

    
}
