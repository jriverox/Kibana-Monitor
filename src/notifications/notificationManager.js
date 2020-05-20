const AWS = require('aws-sdk')

module.exports = class NotificationSender {
  constructor(applicationConfig) {
    this.applicationConfig = applicationConfig
    AWS.config.update({ region: this.applicationConfig.SNS.REGION })
  }

  /**
   *
   * @param {object} notification is an object that contains two properties subject and message
   */
  async send(notification) {
    const params = {
      Subject: notification.subject,
      Message: notification.message,
      TopicArn: this.applicationConfig.SNS.TOPIC_ARN,
    }
    const sns = new AWS.SNS({ apiVersion: '2010-03-31' })
    return await sns.publish(params).promise()
  }
}
