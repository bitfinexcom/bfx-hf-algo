/* eslint-env mocha */
'use strict'

const fs = require('fs')
const sinon = require('sinon')
const assert = require('assert')
const fsOperations = require('../../../../lib/util/fs_operations')
const logAlgoData = require('../../../../lib/host/events/log_algo_data')

let pathExistsStub, createDirStub, writeToFileStub, fsStub

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
    fsStub = sinon.stub(fs, 'createWriteStream').resolves()
    pathExistsStub = sinon.stub(fsOperations, 'pathExists').resolves(true)
    createDirStub = sinon.stub(fsOperations, 'createDir').resolves(true)
    writeToFileStub = sinon.stub(fsOperations, 'writeToFile').resolves()
  })

  afterEach(async () => {
    fsStub.restore()
    pathExistsStub.restore()
    createDirStub.restore()
    writeToFileStub.restore()
  })

  it('does not write to file if log options is not provided', async () => {
    const host = {
      instances: {
        a: getInstance({})
      }
    }
    await logAlgoData(host, 'a', [])
    assert(writeToFileStub.notCalled, 'should not have written data to file')
  })

  it('writes to file if log options is provided with permission to log data', async () => {
    const host = {
      logAlgoOpts: { logAlgo: true, logAlgoDir: 'abc' },
      instances: {
        a: getInstance({})
      }
    }
    await logAlgoData(host, 'a', [])
    assert(writeToFileStub.called, 'should have written data to file')
  })

  it('does not write to file if log options is provided with option to not log data', async () => {
    const host = {
      logAlgoOpts: { logAlgo: false, logAlgoDir: 'abc' },
      instances: {
        a: getInstance({})
      }
    }
    await logAlgoData(host, 'a', [])
    assert(writeToFileStub.notCalled, 'should not have written data to file')
  })

  describe('when write stream is saved in state', () => {
    it('does not check for path and directory and create write stream', async () => {
      const host = {
        logAlgoOpts: { logAlgo: true, logAlgoDir: 'abc' },
        instances: {
          a: getInstance({
            stateParams: {
              wls: () => {}
            }
          })
        }
      }
      await logAlgoData(host, 'a', [])
      assert(writeToFileStub.calledOnce, 'should have written data to file once')
      assert(pathExistsStub.notCalled, 'should not have checked if path or directory exists')
      assert(createDirStub.notCalled, 'should not have created directory')
      assert(fsStub.notCalled, 'should not have created write stream')
    })
  })

  describe('when write stream is not saved in state', () => {
    it('checks if directory and file path exists', async () => {
      const host = {
        logAlgoOpts: { logAlgo: true, logAlgoDir: 'abc' },
        instances: {
          a: getInstance({})
        }
      }
      await logAlgoData(host, 'a', [])
      assert(pathExistsStub.called, 'should have checked if the directory exists or not')
      assert.deepStrictEqual(pathExistsStub.getCall(0).args[0], 'abc/test-id_logs')
      assert.deepStrictEqual(pathExistsStub.getCall(1).args[0], 'abc/test-id_logs/a.csv')
    })

    it('creates directory if it does not exists', async () => {
      const host = {
        logAlgoOpts: { logAlgo: true, logAlgoDir: 'abc' },
        instances: {
          a: getInstance({})
        }
      }
      pathExistsStub.onFirstCall().returns(false)
      await logAlgoData(host, 'a', [])
      assert(createDirStub.called, 'should not have created directory')
    })

    it('does not write to file if there was an error while creating directory', async () => {
      const host = {
        logAlgoOpts: { logAlgo: true, logAlgoDir: 'abc' },
        instances: {
          a: getInstance({})
        }
      }
      pathExistsStub.onFirstCall().returns(false)
      createDirStub.throws()
      await logAlgoData(host, 'a', [])
      assert(writeToFileStub.notCalled, 'should not have called write file')
    })

    it('writes headers to file if it did not exist', async () => {
      const headersForLogFile = 'headers'
      const host = {
        logAlgoOpts: { logAlgo: true, logAlgoDir: 'abc' },
        instances: {
          a: getInstance({
            stateParams: {
              headersForLogFile
            }
          })
        }
      }
      pathExistsStub.onSecondCall().returns(false)
      await logAlgoData(host, 'a', [])
      assert.deepStrictEqual(writeToFileStub.getCall(0).args[1][0], headersForLogFile, 'should have written headers on first call')
    })

    it('does not write headers to file if not defined', async () => {
      const host = {
        logAlgoOpts: { logAlgo: true, logAlgoDir: 'abc' },
        instances: {
          a: getInstance({})
        }
      }
      pathExistsStub.onSecondCall().returns(false)
      await logAlgoData(host, 'a', [])
      assert(writeToFileStub.calledOnce, 'should have only called once')
      assert.deepStrictEqual(writeToFileStub.getCall(0).args[1].length, 0, 'should not have written headers on first call')
    })

    it('updates state with write stream if created', async () => {
      let stateUpdated = false
      const host = {
        logAlgoOpts: { logAlgo: true, logAlgoDir: 'abc' },
        instances: {
          a: getInstance({
            helperParams: {
              updateState: (_, updateOpts) => {
                if (updateOpts.wls) {
                  stateUpdated = true
                }
              }
            }
          })
        }
      }
      await logAlgoData(host, 'a', [])
      assert.ok(stateUpdated, 'should have updated state with write stream')
    })
  })
})
