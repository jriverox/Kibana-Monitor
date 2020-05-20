const yenv = require('yenv')
const LogRepository = require('../repositories/logRepository')
const NotificationManager = require('../notifications/notificationManager')

const env = yenv()

module.exports = class Watcher {
  constructor(applicationName = '') {
    console.log(applicationName)
    this.applicationConfig = env.APPLICATIONS.find((x) => {
      return x.NAME === applicationName
    })
    if (!this.applicationConfig)
      throw new Error(`No se ha encontrado la aplicacion: ${applicationName} en la configuracion`)
    this.notificationManager = new NotificationManager(this.applicationConfig)
  }

  getHourRange() {
    const defaultStartHour = '6:0'
    const defaultEndHour = '20:0'
    let configStartHour = this.applicationConfig.START_HOUR
    let configEndHour = this.applicationConfig.END_HOUR
    const regex = /\b(2[0-3]|[01]?[0-9]):([0-5]?[0-9])\b/

    if (configStartHour && !regex.test(configStartHour)) {
      configStartHour = defaultStartHour
    }

    if (configEndHour && !regex.test(configEndHour)) {
      configEndHour = defaultEndHour
    }

    const startHour = configStartHour.split(':')
    const endHour = configEndHour.split(':')
    const startDate = new Date()
    const endDate = new Date()

    startDate.setHours(startHour[0], startHour[1], 0, 0)
    endDate.setHours(endHour[0], endHour[1], 0, 0)

    return { start: startDate, end: endDate }
  }

  async verify() {
    const today = new Date()
    const hourRange = this.getHourRange()
    const repository = new LogRepository(this.applicationConfig)
    const data = await repository.getData()
    // console.log(data.aggregations.application.buckets)
    const evaluatedBuckets = this.getBucketsGreaterThanThreshold(
      data.aggregations.application.buckets,
      this.applicationConfig.THRESHOLD,
    )
    const mustNotify = today >= hourRange.start && today < hourRange.end
    const messages = []

    if (evaluatedBuckets.length > 0) {
      // notificar por supera el umbral
      for (let index = 0; index < evaluatedBuckets.length; index++) {
        const bucket = evaluatedBuckets[index]
        // eslint-disable-next-line prettier/prettier
        const message = `${index + 1}- Mensaje del error: ${bucket.key}, Cantidad de registros: ${bucket.doc_count}\r\n`
        messages.push(message)
      }
      console.log(messages)
      if (messages.length > 0 && mustNotify) {
        await this.notify(messages)
      } else {
        console.log(
          `Nada que notificar, umbral: ${this.applicationConfig.THRESHOLD}, mensajes: ${
            messages.length
          }, esta fuera del horario: ${!mustNotify}`,
        )
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

  async notify(messages) {
    const notification = {
      subject: `Notificación de Errores Recurrentes de ${this.applicationConfig.NAME}`,
      message: messages.join('\r\n'),
    }
    await this.notificationManager.send(notification)
  }
}
