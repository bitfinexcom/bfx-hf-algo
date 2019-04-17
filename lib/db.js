const low = require('lowdb')
const debug = require('debug')('bfx:hf:algo:db')
const FileSync = require('lowdb/adapters/FileSync')

const {
  DB_FILENAME,
  DB_AO_COLLECTION,
} = process.env

// 1: initial
const DB_VERSION = 1 // bump w/ schema changes

const COLLECTIONS = []
const MAPS = [
  DB_AO_COLLECTION,
]

const DB_DEFAULT = { _version: DB_VERSION }

MAPS.forEach(m => DB_DEFAULT[m] = {})
COLLECTIONS.forEach(m => DB_DEFAULT[m] = [])

const adapter = new FileSync(`${__dirname}/../${DB_FILENAME}`)
const db = low(adapter)
db.defaults(DB_DEFAULT).write()

const reportedVersion = db.get('_version').value()

if (reportedVersion !== DB_VERSION) {
  debug(
    'DB version miss-match; have %d, want %d',
    reportedVersion, DB_VERSION
  )

  debug('clearing data...')

  db.setState({}).write()
  db.defaults(DB_DEFAULT).write()
}

debug('lowdb init w/ v%d', DB_VERSION)

module.exports = db
  