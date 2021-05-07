'use strict'

const fs = require('fs')
const path = require('path')
const _isEmpty = require('lodash/isEmpty')
const _isBoolean = require('lodash/isBoolean')
const fileOps = require('../../util/fs_operations')

module.exports = async (aoHost, gid, values) => {
  const { logAlgoOpts = {}, instances } = aoHost
  const instance = instances[gid]

  if (!instance) {
    return
  }

  const { state = {}, h = {} } = instance
  const { debug, updateState } = h
  const { id, headersForLogFile, wls } = state

  const { logAlgo, logAlgoDir } = logAlgoOpts

  if (!_isBoolean(logAlgo) || !logAlgo || _isEmpty(logAlgoDir)) {
    return
  }

  const logDir = path.join(logAlgoDir, `${id}_logs`)
  const filePath = path.join(logDir, `${gid}.csv`)

  if (wls) {
    fileOps.writeToFile(wls, values)
    return
  }

  const dirExists = await fileOps.pathExists(logDir)

  if (!dirExists) {
    debug('creating logs folder(%s) for %s algo', filePath, id)
    try {
      await fileOps.createDir(logDir)
    } catch (err) {
      return debug('error creating logs folder(%s) for %s algo %O', filePath, id, err)
    }
  }

  const exists = await fileOps.pathExists(filePath)

  const writeAlgoLogStream = fs.createWriteStream(filePath, { flags: 'a' })

  if (!exists && !_isEmpty(headersForLogFile)) {
    debug('creating file and writing headers in file(%s)', filePath)
    values = [headersForLogFile, ...values]
  }

  fileOps.writeToFile(writeAlgoLogStream, values)

  await updateState(instance, { wls: writeAlgoLogStream })
}
