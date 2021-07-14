'use strict'

const epoch = 1609470000 // unix for 2021-01-01T00:00:00

// 45 bits in total
const deltaSize = 29 // ~17 years
const machineIdSize = 6 // range 0~63
const sequenceSize = 10 // up to 1024 ids per second

const offsetDelta = Math.pow(2, machineIdSize + sequenceSize)
const offsetMachineId = Math.pow(2, sequenceSize)

const maxDelta = Math.pow(2, deltaSize) - 1
const maxMachineId = Math.pow(2, machineIdSize) - 1
const maxSequence = Math.pow(2, sequenceSize) - 1

module.exports = (machineId = 0) => {
  let factorySequence = 0
  let prev = 0

  if (machineId > maxMachineId) {
    throw new Error(`machineId can not be greater than ${maxMachineId}`)
  }

  return () => {
    const now = Math.floor(Date.now() / 1000)

    if (now !== prev) {
      factorySequence = 0
      prev = now
    }

    const deltaSeconds = now - epoch
    if (deltaSeconds > maxDelta) {
      throw new Error(`delta can not be greater than ${maxDelta}`)
    }

    const sequence = factorySequence++
    if (sequence > maxSequence) {
      throw new Error(`sequence can not be greater than ${maxSequence}`)
    }

    return sequence +
      (machineId * offsetMachineId) +
      (deltaSeconds * offsetDelta)
  }
}
