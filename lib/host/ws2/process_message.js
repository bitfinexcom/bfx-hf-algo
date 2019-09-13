'use strict'

const debug = require('debug')('bfx:hf:algo:ao-host:ws2:process-message')

module.exports = async (aoHost, msg = {}) => {
  const { triggerGlobalEvent, triggerOrderEvent } = aoHost
  const { type, args } = msg

  switch (type) {
    case 'open': {
      debug('process %s', type)

      await aoHost.emit('open')
      break
    }

    case 'auth:success': {
      debug('process %s', type)

      const [packet, meta] = args
      await aoHost.emit('auth:success', packet, meta)
      break
    }

    case 'auth:error': {
      debug('process %s', type)

      const [packet, meta] = args
      await aoHost.emit('auth:error', packet, meta)
      break
    }

    case 'auth:n': {
      debug('process %s', type)

      const [packet, meta] = args
      await aoHost.emit('auth:n', packet, meta)
      break
    }

    case 'order:snapshot': {
      debug('process %s', type)

      const [orders] = args
      await triggerGlobalEvent('orders', 'order_snapshot', orders)
      break
    }

    case 'order:new': {
      const [order] = args
      const { amount, amountOrig, price, status } = order

      debug(
        'process %s [%f/%f @ %f %s]',
        type, amount, amountOrig, price, status
      )

      await triggerOrderEvent('orders', 'order_new', order)

      if (status.match(/PARTIALLY/)) {
        await triggerOrderEvent('orders', 'order_fill', order)
      }

      break
    }

    case 'order:update': {
      const [order] = args
      const { amount, amountOrig, price, status } = order

      debug(
        'process %s [%f/%f @ %f %s]',
        type, amount, amountOrig, price, status
      )

      await triggerOrderEvent('orders', 'order_update', order)

      if (status.match(/PARTIALLY/)) {
        await triggerOrderEvent('orders', 'order_fill', order)
      }

      break
    }

    case 'order:close': {
      const [order] = args
      const { amount, amountOrig, price, status } = order

      debug(
        'process %s [%f/%f @ %f %s]',
        type, amount, amountOrig, price, status
      )

      await triggerOrderEvent('orders', 'order_close', order)

      if (status.match(/CANCELED/)) {
        await triggerOrderEvent('orders', 'order_cancel', order)
      } else {
        await triggerOrderEvent('orders', 'order_fill', order)
      }

      break
    }

    case 'order:error': {
      const [order] = args

      await triggerOrderEvent('orders', 'order_error', order)
      break
    }

    case 'trades': {
      debug('process %s', type)

      const [trades] = args
      await triggerGlobalEvent('data', 'trades', trades)
      break
    }

    case 'book': {
      debug('process %s', type)

      const [update] = args
      await triggerGlobalEvent('data', 'book', update)
      break
    }

    default: {
      debug('unknown ws event: %s [%j]', type, args)
    }
  }
}
