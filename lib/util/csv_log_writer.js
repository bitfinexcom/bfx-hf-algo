'use strict'

const fs = require('fs')
const path = require('path')
const debug = require('debug')
const { promises: Fs } = require('fs')
const d = debug('bfx:hf:algo:csv-log-writer')

class CsvLogWriter {
  get _logDir () {
    return path.join(this.logAlgoDir, `${this.id}_logs`, this.gid)
  }

  constructor ({ id, gid, logAlgoDir }) {
    this.id = id
    this.gid = gid
    this.logAlgoDir = logAlgoDir
    this.logStreams = {}
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
    const { id } = this
    const logDir = this._logDir
    const dirExists = await this._pathExists(logDir)

    if (!dirExists) {
      try {
        await this._createDir(logDir)
      } catch (err) {
        d('error creating logs folder(%s) for %s algo %O', logDir, id, err)
        return false
      }
    }

    return true
  }

  async initFile (name, header) {
    const { logStreams } = this

    const filePath = path.join(this._logDir, `${name}.csv`)
    const logFileExists = await this._pathExists(filePath)

    logStreams[name] = fs.createWriteStream(filePath, { flags: 'a' })

    if (!logFileExists && Array.isArray(header) && header.length) {
      d('creating file and writing headers in file(%s)', filePath)
      logStreams[name].write(header.join(',') + '\n')
    }
  }

  async write (filename, values, fileHeader = []) {
    const { id, logStreams } = this

    if (!logStreams[filename]) {
      try {
        await this.initFile(filename, fileHeader)
      } catch (e) {
        d('cannot create stream for %s algo [filename %s]', id, filename)
      }
    }

    values.forEach(row => {
      logStreams[filename].write(row.join(',') + '\n')
    })
  }

  close () {
    Object.values(this.logStreams).forEach(stream => {
      stream.close()
    })
  }
}

module.exports = CsvLogWriter
