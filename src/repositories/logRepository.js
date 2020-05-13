const elasticsearch = require('elasticsearch')
const query = require('./logQuery.json')
module.exports = class LogRepository {
  constructor(applicationConfig) {
    this.client = new elasticsearch.Client({
      host: applicationConfig.ELASTICSEARCH.ENDPOINT,
    })
    this.applicationConfig = applicationConfig
    this.indexPattern = this.applicationConfig.ELASTICSEARCH.INDEX_PATTERN
  }

  getDate() {
    var start = new Date()
    start.setHours(0, 0, 0, 0)
    var end = new Date()
    end.setHours(23, 59, 59, 999)
    return { start: start.getTime(), end: end.getTime() }
  }

  getQuery() {
    var q = JSON.stringify(query)
    var date = this.getDate()

    var q1 = q.replace(9999900000, date.start)
    var q2 = q1.replace(9999911111, date.end)
    return JSON.parse(q2)
  }

  async getData() {
    const queryResponse = await this.client.search({
      size: 0,
      index: this.indexPattern,
      filter_path: 'aggregations.application.buckets,hits.total',
      body: this.getQuery(),
    })
    return queryResponse
  }
}
