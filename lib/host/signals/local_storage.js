'use strict'

const fs = require('fs')
const { promisify } = require('util')
const path = require('path')
const flatPromise = require('flat-promise')

const stat = promisify(fs.stat)
const mkdir = promisify(fs.mkdir)

class LocalStorage {
  constructor (dir, fileName) {
    this.dir = dir
    this.fileName = fileName
    this.isOpen = false
  }

  async start () {
    this.isOpen = true

    await this._ensureDirExists()

    const filePath = path.join(this.dir, this.fileName)
    this.file = this._createWriteStream(filePath)
  }

  store (data) {
    const { promise, resolve, reject } = flatPromise()
    const chunk = JSON.stringify(data) + '\n'
    this.file.write(chunk, (err) => {
      err ? reject(err) : resolve()
    })
    return promise
  }

  close () {
    this.isOpen = false

    const { promise, resolve } = flatPromise()
    this.file.end(resolve)
    return promise
  }

  _createWriteStream (filePath) {
    return fs.createWriteStream(filePath, { flags: 'a' })
  }

  async _ensureDirExists () {
    try {
      await stat(this.dir)
    } catch {
      await mkdir(this.dir, { recursive: true })
    }
  }
}

module.exports = LocalStorage
