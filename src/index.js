const Watcher = require('./domain/watcher')
const { performance } = require('perf_hooks')

exports.handler = async (event, context) => {
  const start = performance.now()
  const watcher = new Watcher('SB')
  await watcher.verify()
  const execTime = performance.now() - start
  console.log(`Tiempo total: ${execTime}`)
  return {
    statusCode: 200,
    body: JSON.stringify('Ok'),
  }
}
