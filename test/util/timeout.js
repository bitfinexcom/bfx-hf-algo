'use strict'

module.exports = (ms) => {
  let id = null

  const p = new Promise((resolve) => {
    id = setTimeout(resolve, ms)
  })

  return [id, () => p]
}
