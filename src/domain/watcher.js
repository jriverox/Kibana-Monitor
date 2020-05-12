const util = require('util');
const yenv = require('yenv');
const LogRepository = require('../repositories/logRepository');
const NotificationManager = require('../notifications/notificationManager');

const env = yenv();

module.exports = class Watcher {
    constructor (applicationName = '') {
        this.applicationConfig = env.APPLICATIONS.find(x => {return x.NAME === applicationName});
        if(!this.applicationConfig) 
            throw new Error(`No se ha encontrado la aplicacion: ${applicationName} en la configuracion`);
        this.notificationManager = new NotificationManager(this.applicationConfig);
    }

    async verify () {
        const repository = new LogRepository(this.applicationConfig);
        const data = await repository.getData();
        //console.log(util.inspect(data, { compact: true, depth: 5, breakLength: 80 }));
        
        console.log(data.aggregations.application.buckets);
        const evaluatedBuckets = this.getBucketsGreaterThanThreshold(data.aggregations.application.buckets, this.applicationConfig.THRESHOLD)
       if(evaluatedBuckets.length > 0) {
            //notificar por supera el umbral
            for (const bucket of evaluatedBuckets) {
                let message = `Bucket: ${bucket.key} supera el umbral, valor: ${bucket.doc_count}`;
                console.log(message);
                await this.notify(message);
            }
        }
    }

    /* Devolver los que superan el umbral */
    getBucketsGreaterThanThreshold(buckets, threshold) {
        let result = [];
        if(buckets && Array.isArray(buckets)) {
            result = buckets.filter(x => {return x.doc_count >= threshold});
        }
        return result;
    }

    async notify(message) {
        await this.notificationManager.send(message);
    }
};