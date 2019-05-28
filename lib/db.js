const _keys = require('lodash/keys')
const { initDB, ...models } = require('bfx-hf-models')
const { DB_FILENAME } = process.env

const db = initDB(`${__dirname}/../${DB_FILENAME}`)

_keys(models).forEach(modelName => (
  db[modelName] = models[modelName](db)
))

module.exports = db
