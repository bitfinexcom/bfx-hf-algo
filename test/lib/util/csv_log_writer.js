/* eslint-env mocha */
'use strict'

const fs = require('fs')
const sinon = require('sinon')
const assert = require('assert')
const CsvLogWriter = require('../../../lib/util/csv_log_writer')
const writer = new CsvLogWriter({
  id: 'test-id',
  gid: 123,
  logAlgoDir: 'abc',
  headersForLogFile: ['header1', 'header2']
})

let pathExistsStub, createDirStub, writeStub, fsStub
const mockedLogStream = {
  write: () => { return 'logStream' }
}

describe('Csv Log Writer', () => {
  describe('#init method', () => {
    beforeEach(() => {
      pathExistsStub = sinon.stub(writer, '_pathExists').resolves(false)
      createDirStub = sinon.stub(writer, '_createDir').resolves()
      writeStub = sinon.stub(writer, 'write').resolves()
      fsStub = sinon.stub(fs, 'createWriteStream').returns(mockedLogStream)
    })

    afterEach(() => {
      pathExistsStub.restore()
      createDirStub.restore()
      writeStub.restore()
      fsStub.restore()
    })

    it('creates directory if path does not exist', async () => {
      await writer.init()
      assert.ok(createDirStub.calledOnce, 'should have created directory')
    })

    it('does not create directory if it already exists', async () => {
      pathExistsStub.onFirstCall().resolves(true)
      await writer.init()
      assert.ok(createDirStub.notCalled, 'should not have created directory')
    })

    it('does not create log stream there is error while creating directory', async () => {
      createDirStub.throws()
      await writer.init()
      assert.ok(fsStub.notCalled, 'should not have created log stream')
    })

    it('initializes the log stream properly', async () => {
      await writer.init()
      assert.ok(fsStub.called, 'should have created log stream')
      assert.deepStrictEqual(writer.logStream, mockedLogStream, 'should have returned logStream')
    })

    it('writes headers if file did not exist and headers is an array', async () => {
      await writer.init()
      assert.ok(writeStub.calledOnce, 'should have written headers in file')
      assert.ok(writeStub.getCall(0).firstArg, writer.headersForLogFile, 'did not write headers in file properly')
    })

    it('does not write header if file already exists', async () => {
      pathExistsStub.onSecondCall().resolves(true)
      await writer.init()
      assert.ok(writeStub.notCalled, 'should not have written headers in file')
    })
  })
})