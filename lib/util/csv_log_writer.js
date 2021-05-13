'use strict'

const fs = require('fs')
const path = require('path')
const debug = require('debug')
const { promises: Fs } = require('fs')
const d = debug('bfx:hf:algo:csv-log-writer')

class CsvLogWriter {
  constructor ({ id, gid, logAlgoDir, headersForLogFile }) {
    this.id = id
    this.gid = gid
    this.logAlgoDir = logAlgoDir
    this.headersForLogFile = headersForLogFile
  }

  async _pathExists (path) {
    try {
      await Fs.access(path)
      return true
    } catch {
      return false
    }
  }

  async _createDir (path) {
    try {
      d('creating logs folder (%s) for %s algo', path, this.id)
      await Fs.mkdir(path, { recursive: true })
    } catch (err) {
      if (err.code === 'EEXIST') { return }
      throw err
    }
  }

  async init () {
    const { id, gid, logAlgoDir, headersForLogFile } = this

    const logDir = path.join(logAlgoDir, `${id}_logs`)
    const filePath = path.join(logDir, `${gid}.csv`)

    const dirExists = await this._pathExists(logDir)

    if (!dirExists) {
      try {
        await this._createDir(logDir)
      } catch (err) {
        d('error creating logs folder(%s) for %s algo %O', filePath, id, err)
        return false
      }
    }

    const logFileExists = await this._pathExists(filePath)

    this.logStream = fs.createWriteStream(filePath, { flags: 'a' })

    if (!logFileExists && Array.isArray(headersForLogFile) && headersForLogFile.length) {
      d('creating file and writing headers in file(%s)', filePath)
      this.write([headersForLogFile])
    }

    return true
  }

  write (values) {
    const { id, gid, logStream } = this

    if (!logStream) {
      d('log stream not created for %s algo [gid %s]', id, gid)
      return
    }

    values.forEach(row => {
      logStream.write(row.join(',') + '\n')
    })
  }

  close () {
    if (!this.logStream) {
      return
    }
    this.logStream.close()
  }
}

module.exports = CsvLogWriter
