const AWS = require('aws-sdk')

module.exports = class NotificationSender {
  constructor(applicationConfig) {
    this.applicationConfig = applicationConfig
    AWS.config.update({ region: this.applicationConfig.SNS.REGION })
  }

  async send(message) {
    const params = {
      Message: message /* required */,
      TopicArn: this.applicationConfig.SNS.TOPIC_ARN,
    }
    const sns = new AWS.SNS({ apiVersion: '2010-03-31' })
    return await sns.publish(params).promise()
  }
}
