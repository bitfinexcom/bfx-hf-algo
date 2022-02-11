'use strict'

const Signal = require('./signal')

/**
 * @class SignalStorage
 * @property {boolean} isOpen
 * @property {function(): Promise} start
 * @property {function(data: {}): Promise} store
 * @property {function(): Promise} close
 */

class SignalTracer {
  /**
   * @param {boolean} isEnabled
   * @param {SignalStorage?} storage
   */
  constructor (isEnabled, storage) {
    this.isEnabled = isEnabled
    this.storage = storage
    this.sequencer = 0
    this.signals = []
  }

  /**
   * @param {string} name
   * @param {Signal?} parent
   * @param {object?} meta
   * @returns {Signal}
   */
  createSignal (name, parent = null, meta = {}) {
    const id = ++this.sequencer
    const signal = new Signal({ id, name, parent, meta })

    if (this.isEnabled) {
      this.signals.push(signal)
    }

    return signal
  }

  async close () {
    if (this.closed) return
    this.closed = true

    if (this.isEnabled) {
      await this._flush()
      await this.storage.close()
    }
  }

  /**
   * @returns {Promise}
   * @private
   */
  async _flush () {
    if (!this.storage.isOpen) {
      await this.storage.start()
    }

    while (this.signals.length > 0) {
      const signal = this.signals.shift()
      const parent = signal.parent ? signal.parent.id : null

      await this.storage.store({
        ...signal,
        parent
      })
    }
  }
}

module.exports = SignalTracer
