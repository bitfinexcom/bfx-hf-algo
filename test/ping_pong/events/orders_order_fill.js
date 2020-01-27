/* eslint-env mocha */
'use strict'

const assert = require('assert')
const { Order } = require('bfx-api-node-models')
const Promise = require('bluebird')
const onOrdersFill = require('ping_pong/events/orders_order_fill')

describe('ping_pong:events:orders_order_cancel', () => {
  it('re-submits ping order when pong fills - if endless=true', (done) => {
    let orderUpdate = new Order({ amount: 0, price: 100 })
    let instance = {
      h: {
        debug: () => {},
        emit: (eName, _, pingOrders) => {
          assert.strictEqual(eName, 'exec:order:submit:all')
          assert.strictEqual(pingOrders.length, 1)
          assert.strictEqual(pingOrders[0].price, 90)
          return new Promise((resolve) => {
            resolve()
          }).then(done).catch(done)
        },
        updateState: () => {}
      },
      state: {
        args: {
          endless: true
        },
        pingPongTable: {
        },
        activePongs: {
          100: 90
        }
      }
    }
    onOrdersFill(instance, orderUpdate)
  })
  it('does not re-submit ping order when pong fills - if endless=false', (done) => {
    let orderUpdate = new Order({ amount: 0, price: 100 })
    let instance = {
      h: {
        debug: () => {},
        emit: (eName, _, pingOrders) => {
          assert.strictEqual(eName, 'exec:stop')
          return new Promise((resolve) => {
            resolve()
          }).then(done).catch(done)
        },
        updateState: () => {}
      },
      state: {
        args: {
          endless: false
        },
        pingPongTable: {
        },
        activePongs: {
          100: 90
        }
      }
    }
    onOrdersFill(instance, orderUpdate)
  })
  it('submit pong order when ping fills', (done) => {
    let orderUpdate = new Order({ amount: 0, price: 100 })
    let instance = {
      h: {
        debug: console.log,
        emit: (eName, _, pingOrders) => {
          assert.strictEqual(eName, 'exec:order:submit:all')
          assert.strictEqual(pingOrders.length, 1)
          assert.strictEqual(pingOrders[0].price, 120)
          return new Promise((resolve) => {
            resolve()
          }).then(done).catch(done)
        },
        updateState: () => {}
      },
      state: {
        pingPongTable: {
          100: 120
        },
        activePongs: []
      }
    }
    onOrdersFill(instance, orderUpdate)
  })
})
