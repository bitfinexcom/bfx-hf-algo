'use strict'

const _isEmpty = require('lodash/isEmpty')
const _isBoolean = require('lodash/isBoolean')
const CsvLogWriter = require('../../util/csv_log_writer')

module.exports = async (aoHost, gid, values, filename = null, headerKey = null) => {
  const { logAlgoOpts = {}, instances } = aoHost
  const instance = instances[gid]

  if (!instance) {
    return
  }

  const { state = {}, h = {} } = instance
  const { updateState } = h
  const { id, headersForLogFile, algoLogWriter: logWriter } = state
  const fileHeader = headersForLogFile[headerKey] || headersForLogFile

  const { logAlgo, logAlgoDir } = logAlgoOpts

  if (!_isBoolean(logAlgo) || !logAlgo || _isEmpty(logAlgoDir)) {
    return
  }

  if (logWriter) {
    await logWriter.write(filename || gid, values, fileHeader)
    return
  }

  const algoLogWriter = new CsvLogWriter({ id, gid, logAlgoDir })

  const initialized = await algoLogWriter.init()

  if (!initialized) {
    return
  }

  await algoLogWriter.write(filename || gid, values, fileHeader)

  await updateState(instance, { algoLogWriter })
}
