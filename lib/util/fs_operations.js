const { promises: Fs } = require('fs')
const _isString = require('lodash/isString')

const pathExists = async (path) => {
  try {
    await Fs.access(path)
    return true
  } catch {
    return false
  }
}

const createDir = async (path) => {
  try {
    await Fs.mkdir(path)
  } catch (err) {
    if (err.code === 'EEXIST') {
      return
    }
    throw err
  }
}

const writeToFile = (stream, values) => {
  if (_isString(values)) {
    stream.write(values + '\n')
    return
  }
  values.forEach(row => {
    stream.write(row.join(',') + '\n')
  })
}

module.exports = {
  pathExists,
  createDir,
  writeToFile
}
