const Watcher = require('./domain/watcher')
const { performance } = require('perf_hooks')

;(async () => {
  try {
    const start = performance.now()
    const watcher = new Watcher('SB')
    await watcher.verify()
    const execTime = performance.now() - start
    console.log(`Tiempo total: ${execTime}`)
  } catch (e) {
    console.log(e)
  }
})()
