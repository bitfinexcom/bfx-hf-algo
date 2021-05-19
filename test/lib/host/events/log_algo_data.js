/* eslint-env mocha */
'use strict'

const sinon = require('sinon')
const assert = require('assert')
const CsvLogWriter = require('../../../../lib/util/csv_log_writer')
const logAlgoData = require('../../../../lib/host/events/log_algo_data')

let csvLogWriterStub, csvLogInitStub

describe('host:events:log_algo_data', () => {
  const getInstance = ({ stateParams = {}, helperParams = {} }) => ({
    state: {
      id: 'test-id',
      ...stateParams
    },
    h: {
      debug: () => {},
      updateState: () => {},
      ...helperParams
    }
  })

  beforeEach(() => {
    csvLogInitStub = sinon.stub(CsvLogWriter.prototype, 'init').returns(true)
    csvLogWriterStub = sinon.stub(CsvLogWriter.prototype, 'write').resolves()
  })

  afterEach(async () => {
    csvLogInitStub.restore()
    csvLogWriterStub.restore()
  })

  it('does not write to file if log options is not provided', async () => {
    const host = {
      instances: {
        a: getInstance({})
      }
    }
    await logAlgoData(host, 'a', [])
    assert(csvLogInitStub.notCalled, 'should not have initialized log stream')
    assert(csvLogWriterStub.notCalled, 'should not have written data to file')
  })

  it('writes to file if log options is provided with permission to log data', async () => {
    const host = {
      logAlgoOpts: { logAlgo: true, logAlgoDir: 'abc' },
      instances: {
        a: getInstance({})
      }
    }
    await logAlgoData(host, 'a', [])
    assert(csvLogInitStub.called, 'should have initialized log stream')
    assert(csvLogWriterStub.called, 'should have written data to file')
  })

  it('does not write to file if log options is provided with option to not log data', async () => {
    const host = {
      logAlgoOpts: { logAlgo: false, logAlgoDir: 'abc' },
      instances: {
        a: getInstance({})
      }
    }
    await logAlgoData(host, 'a', [])
    assert(csvLogInitStub.notCalled, 'should not have initialized log stream')
    assert(csvLogWriterStub.notCalled, 'should not have written data to file')
  })

  describe('when write stream is saved in state', () => {
    it('does not check for path and directory and create write stream', async () => {
      let dataLogged = false
      const host = {
        logAlgoOpts: { logAlgo: true, logAlgoDir: 'abc' },
        instances: {
          a: getInstance({
            stateParams: {
              algoLogWriter: {
                write: () => {
                  dataLogged = true
                }
              }
            }
          })
        }
      }
      await logAlgoData(host, 'a', [])
      assert.ok(dataLogged, 'should have logged data from stream saved in state')
    })
  })

  describe('when write stream is not saved in state', () => {
    it('initializes the log stream and writes data to the stream', async () => {
      const host = {
        logAlgoOpts: { logAlgo: true, logAlgoDir: 'abc' },
        instances: {
          a: getInstance({})
        }
      }
      await logAlgoData(host, 'a', 'values')
      assert(csvLogInitStub.called, 'should have initialized log stream')
      assert(csvLogWriterStub.called, 'should have written data to file')
      assert.deepStrictEqual(csvLogWriterStub.getCall(0).firstArg, 'values')
    })

    it('does not write to file if there was an error while initializing the log stream', async () => {
      const host = {
        logAlgoOpts: { logAlgo: true, logAlgoDir: 'abc' },
        instances: {
          a: getInstance({})
        }
      }
      csvLogInitStub.returns(false)
      await logAlgoData(host, 'a', [])
      assert(csvLogWriterStub.notCalled, 'should not have written data to file')
    })

    it('updates state with log writer after initialized', async () => {
      let stateUpdated = false
      const host = {
        logAlgoOpts: { logAlgo: true, logAlgoDir: 'abc' },
        instances: {
          a: getInstance({
            helperParams: {
              updateState: (_, updateOpts) => {
                if (updateOpts.algoLogWriter) {
                  stateUpdated = true
                }
              }
            }
          })
        }
      }
      await logAlgoData(host, 'a', [])
      assert.ok(stateUpdated, 'should have updated state with log writer')
    })
  })
})
