'use strict'

let last = Date.now()

module.exports = () => {
  const now = Date.now()
  last = (last < now) ? now : last + 1
  return last
}
