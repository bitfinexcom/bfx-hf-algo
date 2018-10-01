'use strict'

const debug = require('debug')('bfx:hf:host:ws2:process-message')

module.exports = async (aoHost, msg = {}) => {
  const { triggerGlobalEvent, triggerOrderEvent } = aoHost
  const { type, args } = msg

  switch (type) {
    case 'ws2:open': {
      debug('process %s', type)

      await aoHost.emit('open')
      break
    }

    case 'ws2:event:auth:success': {
      debug('process %s', type)

      const [ packet, meta ] = args
      await aoHost.emit('ws2:auth:success', packet, meta)
      break
    }

    case 'ws2:event:auth:error': {
      debug('process %s', type)

      const [ packet, meta ] = args
      await aoHost.emit('ws2:auth:error', packet, meta)
      break
    }

    case 'ws2:auth:n': {
      debug('process %s', type)

      const [ packet, meta ] = args
      await aoHost.emit('ws2:auth:n', packet, meta)
      break
    }

    case 'ws2:auth:os': {
      debug('process %s', type)

      const [ orders ] = args
      await triggerGlobalEvent('orders', 'order_snapshot', orders)
      break
    }

    case 'ws2:auth:on': {
      const [ order ] = args
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

    case 'ws2:auth:ou': {
      const [ order ] = args
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

    case 'ws2:auth:oc': {
      const [ order ] = args
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

    case 'ws2:data:trades': {
      debug('process %s', type)

      const [ trades ] = args
      await triggerGlobalEvent('data', 'trades', trades)
      break
    }

    case 'ws2:data:book': {
      debug('process %s', type)

      const [ update ] = args
      await triggerGlobalEvent('data', 'book', update)
      break
    }

    default: {
      debug('unknown ws event: %s [%j]', type, args)
    }
  }
}
