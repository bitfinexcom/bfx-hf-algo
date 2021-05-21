'use strict'

/**
 * Generates pseudo-random values based on a given/generated seed
 * It allows you to replay tests with random data by using the same seed
 */
class Randomizer {
  /**
   * @param {number?} seed
   */
  constructor (seed = undefined) {
    this._counter = 2
    this._seed = seed || this.generateSeed()
  }

  /**
   * @returns {number|undefined}
   */
  seed () {
    return this._seed
  }

  /**
   * @returns {number}
   */
  random () {
    if (!this._seed) return Math.random()
    const r = Math.PI * (this._counter++ ^ this._seed)
    return r - Math.floor(r)
  }

  /**
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  range (min, max) {
    return (this.random() * (max - min + 1)) + min
  }

  /**
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  rangeInt (min, max) {
    return Math.floor(this.range(min, max))
  }

  /**
   * @param {Array} arr
   */
  element (arr) {
    const len = arr.length
    if (len === 0) return

    return arr[this.range(0, len)]
  }

  /**
   * @returns {boolean}
   */
  bool () {
    const r = this.range(1, 100)
    return (r % 2) === 0
  }

  /**
   * @returns {number}
   */
  generateSeed () {
    return this.rangeInt(1, 100)
  }

  /**
   * @returns {Randomizer}
   */
  fork () {
    return new Randomizer(this.generateSeed())
  }
}

module.exports = Randomizer
