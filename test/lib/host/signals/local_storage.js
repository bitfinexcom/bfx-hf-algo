/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
'use strict'

const { expect } = require('chai')
const { stub, assert } = require('sinon')

const LocalStorage = require('../../../../lib/host/signals/local_storage')

describe('LocalStorage', () => {
  const dir = 'dir'
  const fileName = 'file_name'
  const fileStreamMock = {}

  const storage = new LocalStorage(dir, fileName)
  storage._createWriteStream = stub().returns(fileStreamMock)
  storage._ensureDirExists = stub().resolves()

  it('start', async () => {
    expect(storage.isOpen).to.be.false

    await storage.start()

    assert.calledWithExactly(storage._ensureDirExists)
    assert.calledWithExactly(storage._createWriteStream, 'dir/file_name')
    expect(storage.file).to.eq(fileStreamMock)
    expect(storage.isOpen).to.be.true
  })

  it('store', (done) => {
    fileStreamMock.write = (chunk, cb) => {
      expect(chunk).to.eq(JSON.stringify(data) + '\n')
      cb(null)
      done()
    }

    const data = { id: 10 }
    storage.store(data)
  })

  it('close', async () => {
    fileStreamMock.end = (cb) => cb()
    await storage.close()
    expect(storage.isOpen).to.be.false
  })
})
