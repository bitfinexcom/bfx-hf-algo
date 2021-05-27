'use strict'

function waitOrderStop (host, gid) {
  return new Promise((resolve) => {
    host.once('ao:stop', (instance) => {
      const { state = {} } = instance

      if (state.gid === gid) resolve()
    })
  })
}

async function performOrder (host) {
  const gid = await host.startAO('bfx-iceberg', {
    symbol: 'tAAABBB',
    price: 21000,
    amount: -0.5,
    sliceAmount: -0.1,
    excessAsHidden: true,
    orderType: 'LIMIT',
    _margin: false
  })

  return gid
}

module.exports = {
  performOrder,
  waitOrderStop
}
