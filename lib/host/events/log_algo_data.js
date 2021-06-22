'use strict'

const _isEmpty = require('lodash/isEmpty')
const _isBoolean = require('lodash/isBoolean')
const CsvLogWriter = require('../../util/csv_log_writer')

module.exports = async (aoHost, gid, values, filename = null) => {
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
    await logWriter.write(filename || gid, values)
    return
  }

  const algoLogWriter = new CsvLogWriter({ id, logAlgoDir, headersForLogFile })

  const initialized = await algoLogWriter.init()

  if (!initialized) {
    return
  }

  await algoLogWriter.write(filename || gid, values)

  await updateState(instance, { algoLogWriter })
}
