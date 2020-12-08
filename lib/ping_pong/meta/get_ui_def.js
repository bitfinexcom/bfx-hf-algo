'use strict'

/**
 * Returns the UI layout definition for PingPong, with a field for each
 * parameter.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:PingPong
 * @returns {AOUIDefinition} uiDef
 */
const getUIDef = () => ({
  label: 'Ping/Pong',
  id: 'bfx-ping_pong',

  uiIcon: 'ping-pong-active',
  customHelp: [
    'Ping/pong submits multiple \'ping\' orders; once a ping order fills, an',
    'associated \'pong\' order is submitted.\n\nMultiple ping/pong pairs can',
    'be created by specifying an order count greater than 1, a suitable',
    'min/max ping price, and a pong distance. Multiple ping orders will be',
    'created between the specified min/max prices, with the associated pongs',
    'offset by the pong distance from the ping price'
  ].join(' '),

  connectionTimeout: 10000,
  actionTimeout: 10000,

  header: {
    component: 'ui.checkbox_group',
    fields: ['hidden', 'endless', 'splitPingPongAmount']
  },

  sections: [{
    title: '',
    name: 'general',
    rows: [
      ['action', null],
      ['amount', 'orderCount'],
      ['submitDelaySec', 'cancelDelaySec']
    ]
  }, {
    title: '',
    name: 'single_ping',
    rows: [
      ['pingPrice', 'pongPrice']
    ],

    visible: {
      orderCount: { eq: '1' }
    }
  }, {
    title: '',
    name: 'multi_ping',
    rows: [
      ['pingMinPrice', 'pongDistance'],
      ['pingMaxPrice', null]
    ],

    visible: {
      orderCount: { gt: 1 }
    }
  }, {
    title: '',
    name: 'split_amounts',
    rows: [
      ['pingAmount', 'pongAmount']
    ],

    visible: {
      splitPingPongAmount: { eq: true }
    }
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

    splitPingPongAmount: {
      component: 'input.checkbox',
      label: 'SPLIT AMOUNT',
      default: false,
      customHelp: 'Provide seperate ping/pong amounts'
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

    endless: {
      component: 'input.checkbox',
      label: 'ENDLESS',
      default: false,
      customHelp: 'If true, pings will be recreated once their associated pongs fill'
    },

    pingPrice: {
      component: 'input.price',
      label: 'Ping Price $QUOTE'
    },

    pongPrice: {
      component: 'input.price',
      label: 'Pong Price $QUOTE'
    },

    pongDistance: {
      component: 'input.number',
      label: 'Pong Distance'
    },

    pingMinPrice: {
      component: 'input.price',
      label: 'Ping Min Price $QUOTE'
    },

    pingMaxPrice: {
      component: 'input.price',
      label: 'Ping Max Price $QUOTE'
    },

    amount: {
      component: 'input.amount',
      label: 'Amount $BASE',
      customHelp: 'Total order amount',

      visible: {
        splitPingPongAmount: { eq: false }
      }
    },

    pingAmount: {
      component: 'input.amount',
      label: 'Ping Amount $BASE',
      customHelp: 'Ping order size'
    },

    pongAmount: {
      component: 'input.amount',
      label: 'Pong Amount $BASE',
      customHelp: 'Pong order size'
    },

    orderCount: {
      component: 'input.number',
      label: 'Order Count',
      default: '1'
    },

    lev: {
      component: 'input.range',
      label: 'Leverage',
      min: 1,
      max: 100,
      default: 10
    },

    action: {
      component: 'input.radio',
      label: 'Action',
      options: ['Buy', 'Sell'],
      inline: true,
      default: 'Buy'
    }
  },

  actions: ['preview', 'submit']
})

module.exports = getUIDef
