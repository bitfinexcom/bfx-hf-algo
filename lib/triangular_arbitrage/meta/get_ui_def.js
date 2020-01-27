'use strict'

module.exports = () => ({
  id: 'bfx-triangular_arbitrage',
  label: 'Triangular Arbitrage',

  uiIcon: 'triangle-arbitrage-active',
  customHelp: 'Trangular Arbitrage synchronously exchanges between 3 different markets to create full round trip back to the original starting currency.\n\nOrders will be submitted synchronously until the round trip is complete.',
  connectionTimeout: 10000,
  actionTimeout: 10000,

  header: {
    component: 'ui.checkbox_group',
    fields: ['hidden']
  },

  sections: [{
    title: '',
    name: 'general',
    rows: [
      ['action', null],
      ['amount', 'orderType1'],
      ['intermediateCcy', 'orderType2'],
      [null, 'orderType3'],
      ['submitDelaySec', 'cancelDelaySec']
    ]
  }, {
    title: '',
    name: 'lev',
    fullWidth: true,
    rows: [
      ['lev']
    ],

    visible: {
      _context: { eq: 'f' }
    }
  }],

  fields: {
    hidden: {
      component: 'input.checkbox',
      label: 'HIDDEN',
      default: false,
      help: 'trading.hideorder_tooltip'
    },

    submitDelaySec: {
      component: 'input.number',
      label: 'Submit Delay (sec)',
      customHelp: 'Seconds to wait before submitting orders',
      default: 1
    },

    cancelDelaySec: {
      component: 'input.number',
      label: 'Cancel Delay (sec)',
      customHelp: 'Seconds to wait before cancelling orders',
      default: 0
    },

    amount: {
      component: 'input.amount',
      label: 'Amount $BASE',
      customHelp: 'Starting amount'
    },

    intermediateCcy: {
      component: 'input.string',
      label: 'Intermediate Currency',
      customHelp: 'The intermediate market XXX:$BASE',
      default: 'ETH'
    },

    lev: {
      component: 'input.range',
      label: 'Leverage',
      min: 1,
      max: 100,
      default: 10
    },

    orderType1: {
      component: 'input.dropdown',
      label: 'Order Type',
      default: 'LIMIT',
      options: {
        MARKET: 'Market',
        BEST_BID: 'Best Bid',
        BEST_ASK: 'Best Ask'
      }
    },

    orderType2: {
      component: 'input.dropdown',
      label: 'Order Type',
      default: 'LIMIT',
      options: {
        MARKET: 'Market',
        BEST_BID: 'Best Bid',
        BEST_ASK: 'Best Ask'
      }
    },

    orderType3: {
      component: 'input.dropdown',
      label: 'Order Type',
      default: 'LIMIT',
      options: {
        MARKET: 'Market',
        BEST_BID: 'Best Bid',
        BEST_ASK: 'Best Ask'
      }
    }
  },

  action: {
    component: 'input.radio',
    label: 'Action',
    options: ['Buy', 'Sell'],
    inline: true,
    default: 'Buy'
  },

  actions: ['preview', 'submit']
})
