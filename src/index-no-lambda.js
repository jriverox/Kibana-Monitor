const util = require('util');
const yenv = require('yenv');
const Watcher = require('./domain/watcher');
const { performance } = require('perf_hooks');
const env = yenv();

(async ()=> {
    try
    {
        const start = performance.now();
        const watcher = new Watcher('somos-belcorp');
        await watcher.verify();
        const execTime = performance.now() - start;
        console.log(`Tiempo total: ${execTime}`);
    }
    catch(e){

        console.log(e);
    }
    
})();