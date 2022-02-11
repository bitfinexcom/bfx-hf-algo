'use strict'

class Signal {
  /**
   * @param {number} id
   * @param {string} name
   * @param {Signal?} parent
   * @param {object?} meta
   */
  constructor ({
    id,
    name,
    parent = null,
    meta
  }) {
    this.id = id
    this.name = name
    this.meta = meta || {}
    this.parent = parent
    this.started_at = Date.now()
  }

  end () {
    if (this.ended_at) {
      throw new Error('signal already closed')
    }
    this.ended_at = Date.now()
  }
}

module.exports = Signal
