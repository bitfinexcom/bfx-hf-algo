'use strict'

const _isEmpty = require('lodash/isEmpty')
const _isBoolean = require('lodash/isBoolean')
const CsvLogWriter = require('../../util/csv_log_writer')

module.exports = async (aoHost, gid, values) => {
  const { logAlgoOpts = {}, instances } = aoHost
  const instance = instances[gid]

  if (!instance) {
    return
  }

  const { state = {}, h = {} } = instance
  const { updateState } = h
  const { id, headersForLogFile, algoLogWriter: logWriter } = state

  const { logAlgo, logAlgoDir } = logAlgoOpts

  if (!_isBoolean(logAlgo) || !logAlgo || _isEmpty(logAlgoDir)) {
    return
  }

  if (logWriter) {
    logWriter.write(values)
    return
  }

  const algoLogWriter = new CsvLogWriter({ id, gid, logAlgoDir, headersForLogFile })

  const initialized = await algoLogWriter.init()

  if (!initialized) {
    return
  }

  algoLogWriter.write(values)

  await updateState(instance, { algoLogWriter })
}
