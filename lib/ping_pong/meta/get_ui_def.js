'use strict'
const { t } = require('../../util/i18n')

/**
 * Returns the UI layout definition for PingPong, with a field for each
 * parameter.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:PingPong
 * @returns {AOUIDefinition} uiDef
 */
const getUIDef = ({ i18n } = {}) => ({
  label: t(i18n, 'orderForm.pingpong.title', 'Ping/Pong'),
  id: 'bfx-ping_pong',

  uiIcon: 'ping-pong-active',
  customHelp: t(i18n, 'orderForm.pingpong.help', [
    'Ping/pong submits multiple \'ping\' orders; once a ping order fills, an',
    'associated \'pong\' order is submitted.\n\nMultiple ping/pong pairs can',
    'be created by specifying an order count greater than 1, a suitable',
    'min/max ping price, and a pong distance. Multiple ping orders will be',
    'created between the specified min/max prices, with the associated pongs',
    'offset by the pong distance from the ping price'
  ].join(' ')),

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
      ['amount', 'orderCount']
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
      label: t(i18n, 'orderForm.hidden', 'HIDDEN'),
      default: false,
      customHelp: t(i18n, 'orderForm.hidden.help',
      `This option allows you to place an order into the book but not have it displayed to
      other traders. Price/time priority is the same as a displayed order, but the hidden order will
      always pay the "taker" fee while those trading against a hidden order will pay the "maker" fee`)
    },

    splitPingPongAmount: {
      component: 'input.checkbox',
      label: t(i18n, 'orderForm.splitAmount', 'SPLIT AMOUNT'),
      default: false,
      customHelp: t(i18n, 'orderForm.pingpong.splitAmount.help', 'Provide seperate ping/pong amounts')
    },

    endless: {
      component: 'input.checkbox',
      label: t(i18n, 'orderForm.endless', 'ENDLESS'),
      default: false,
      customHelp: t(i18n, 'orderForm.pingpong.endless.help', 'If true, pings will be recreated once their associated pongs fill')
    },

    pingPrice: {
      component: 'input.price',
      label: `${t(i18n, 'orderForm.pingpong.pingPrice', 'Ping Price')} $QUOTE`
    },

    pongPrice: {
      component: 'input.price',
      label: `${t(i18n, 'orderForm.pingpong.pongPrice', 'Pong Price')} $QUOTE`
    },

    pongDistance: {
      component: 'input.number',
      label: t(i18n, 'orderForm.pingpong.pongDistance', 'Pong Distance')
    },

    pingMinPrice: {
      component: 'input.price',
      label: `${t(i18n, 'orderForm.pingpong.pingMinPrice', 'Ping Min Price')} $QUOTE`
    },

    pingMaxPrice: {
      component: 'input.price',
      label: `${t(i18n, 'orderForm.pingpong.pingMaxPrice', 'Ping Max Price')} $QUOTE`
    },

    amount: {
      component: 'input.amount',
      label: `${t(i18n, 'orderForm.amount', 'Amount')} $BASE`,
      customHelp: t(i18n, 'orderForm.totalOrderAmount', 'Total order amount'),

      visible: {
        splitPingPongAmount: { eq: false }
      }
    },

    pingAmount: {
      component: 'input.amount',
      label: `${t(i18n, 'orderForm.pingpong.pingAmount', 'Ping Amount')} $BASE`,
      customHelp: t(i18n, 'orderForm.pingpong.pingOrderSize', 'Ping order size')
    },

    pongAmount: {
      component: 'input.amount',
      label: `${t(i18n, 'orderForm.pingpong.pongAmount', 'Pong Amount')} $BASE`,
      customHelp: t(i18n, 'orderForm.pingpong.pongOrderSize', 'Pong order size')
    },

    orderCount: {
      component: 'input.number',
      label: t(i18n, 'orderForm.orderCount', 'Order Count'),
      default: '1'
    },

    lev: {
      component: 'input.range',
      label: t(i18n, 'orderForm.leverage', 'Leverage'),
      min: 1,
      max: 100,
      default: 10
    },

    action: {
      component: 'input.radio',
      label: t(i18n, 'orderForm.action', 'Action'),
      options: [t(i18n, 'orderForm.buy', 'Buy'), t(i18n, 'orderForm.sell', 'Sell')],
      inline: true,
      default: t(i18n, 'orderForm.buy', 'Buy')
    }
  },

  actions: ['preview', 'submit']
})

module.exports = getUIDef
