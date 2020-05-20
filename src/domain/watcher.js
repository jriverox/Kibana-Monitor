const yenv = require('yenv')
const LogRepository = require('../repositories/logRepository')
const NotificationManager = require('../notifications/notificationManager')

const env = yenv()

module.exports = class Watcher {
  constructor(applicationName = '') {
    this.applicationConfig = env.APPLICATIONS.find((x) => {
      return x.NAME === applicationName
    })
    if (!this.applicationConfig)
      throw new Error(`No se ha encontrado la aplicacion: ${applicationName} en la configuracion`)
    this.notificationManager = new NotificationManager(this.applicationConfig)
  }
  getRangeHour(){
    var defaultHourStart ,defaultHourEnd,regex ,configHourStart , configHourEnd , hourStar , HourEnd;
    defaultHourStart ="6:0";
    defaultHourEnd ="20:0";
    configHourStart =this.applicationConfig.HOURSTART;
    configHourEnd=this.applicationConfig.HOUREND;
    regex =/\b(2[0-3]|[01]?[0-9]):([0-5]?[0-9])\b/;
     if(configHourStart && !regex.test(configHourStart))
       configHourStart=defaultHourStart;
     if(configHourEnd && !regex.test(configHourEnd))
       configHourEnd=defaultHourEnd;

       hourStar =  configHourStart.split(":");
       HourEnd =  configHourEnd.split(":");
       var fechaIni = new Date();
       var fechaFin = new Date();
       
       fechaIni.setHours(hourStar[0] ,hourStar[1] ,0 ,0);
       fechaFin.setHours(HourEnd[0] ,HourEnd[1],0 ,0);

      return { hourStar : fechaIni , HourEnd  : fechaFin }
  }
  async verify() {
    var today  , rangeHour ;
    today= new Date();
    rangeHour =this.getRangeHour();
    const repository = new LogRepository(this.applicationConfig)
    const data = await repository.getData()
    console.log(data.aggregations.application.buckets)
    const evaluatedBuckets = this.getBucketsGreaterThanThreshold(
      data.aggregations.application.buckets,
      this.applicationConfig.THRESHOLD,
    )
    if (evaluatedBuckets.length > 0) {
      // notificar por supera el umbral
      for (const bucket of evaluatedBuckets) {
        const message = `Bucket: ${bucket.key} supera el umbral, valor: ${bucket.doc_count}`
        console.log(message);
        if(today >=rangeHour.hourStar  && today < rangeHour.HourEnd )
           await this.notify(message)
        else
        console.log('Not Notification ');
 
      }
    }
  }

  /* Devolver los que superan el umbral */
  getBucketsGreaterThanThreshold(buckets, threshold) {
    let result = []
    if (buckets && Array.isArray(buckets)) {
      result = buckets.filter((x) => {
        return x.doc_count >= threshold
      })
    }
    return result
  }

  async notify(message) {
    await this.notificationManager.send(message)
  }
}
