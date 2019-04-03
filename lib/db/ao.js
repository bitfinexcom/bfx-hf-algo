// const debug = require('debug')('bfx:hf:algo:db:aos')
const DB = require('../db')

const { DB_AO_COLLECTION } = process.env

const getAOKey = ({ algoID, gid } = {}) => `${algoID}-${gid}`
const getAbsAOKey = (args = {}) => `${DB_AO_COLLECTION}.${getAOKey(args)}`

const setAO = (ao = {}) => {
  return DB
    .set(getAbsAOKey(ao), ao)
    .write()
}

const getAO = (ao = {}) => {
  return DB
    .get(getAbsAOKey(ao))
    .value()
}

const getAllAOs = () => {
  return DB
    .get(DB_AO_COLLECTION)
    .values()
}

const getActiveAOs = () => {
  return getAllAOs()
    .filter({ active: true })
    .value()
}

const deleteAO = (ao = {}) => {
  DB
    .remove(getAbsAOKey(ao))
    .write()
}

module.exports = {
  setAO,
  getAO,
  getActiveAOs,
  getAllAOs,
  deleteAO,
}
