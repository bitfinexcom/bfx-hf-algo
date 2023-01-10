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
  label: t(i18n, 'pingpong.title', 'Ping/Pong'),
  id: 'bfx-ping_pong',

  uiIcon: 'ping-pong-active',
  customHelp: t(
    i18n,
    'pingpong.help',
    [
      "Ping/pong submits multiple 'ping' orders; once a ping order fills, an",
      "associated 'pong' order is submitted.\n\nMultiple ping/pong pairs can",
      'be created by specifying an order count greater than 1, a suitable',
      'min/max ping price, and a pong distance. Multiple ping orders will be',
      'created between the specified min/max prices, with the associated pongs',
      'offset by the pong distance from the ping price'
    ].join(' ')
  ),

  connectionTimeout: 10000,
  actionTimeout: 10000,

  header: {
    component: 'ui.checkbox_group',
    fields: ['hidden', 'endless', 'splitPingPongAmount', 'visibleOnHit']
  },

  sections: [
    {
      title: '',
      name: 'alias',
      fullWidth: true,
      rows: [['alias']]
    },
    {
      title: '',
      name: 'general',
      rows: [['amount', 'orderCount']]
    },
    {
      title: '',
      name: 'single_ping',
      rows: [['pingPrice', 'pongPrice']],

      visible: {
        orderCount: { eq: '1' }
      }
    },
    {
      title: '',
      name: 'multi_ping',
      rows: [
        ['pingMinPrice', 'pongDistance'],
        ['pingMaxPrice', null]
      ],

      visible: {
        orderCount: { gt: 1 }
      }
    },
    {
      title: '',
      name: 'split_amounts',
      rows: [['pingAmount', 'pongAmount']],

      visible: {
        splitPingPongAmount: { eq: true }
      }
    },
    {
      title: '',
      name: 'lev',
      fullWidth: true,
      rows: [['lev']],

      visible: {
        _context: { eq: 'f' }
      }
    },
    {
      title: '',
      name: 'action',
      fullWidth: true,
      rows: [['action']]
    }
  ],

  fields: {
    hidden: {
      component: 'input.checkbox',
      label: t(i18n, 'hidden', 'HIDDEN'),
      default: false,
      customHelp: t(
        i18n,
        'hiddenHelp',
        `This option allows you to place an order into the book but not have it displayed to
      other traders. Price/time priority is the same as a displayed order, but the hidden order will
      always pay the "taker" fee while those trading against a hidden order will pay the "maker" fee`
      )
    },

    visibleOnHit: {
      component: 'input.checkbox',
      label: t(i18n, 'visibleOnHit', 'Visible on Hit'),
      default: false,
      customHelp: t(
        i18n,
        'visibleOnHitHelp',
        'The rest part of the hidden order will be visible after first hit(partial execution)'
      ),
      visible: {
        hidden: { eq: true }
      }
    },

    alias: {
      component: 'input.alias',
      label: t(i18n, 'alias', 'Alias'),
      avoidTrimming: true
    },

    splitPingPongAmount: {
      component: 'input.checkbox',
      label: t(i18n, 'splitAmount', 'SPLIT AMOUNT'),
      default: false,
      customHelp: t(
        i18n,
        'pingpong.splitAmountHelp',
        'Provide seperate ping/pong amounts'
      )
    },

    endless: {
      component: 'input.checkbox',
      label: t(i18n, 'endless', 'ENDLESS'),
      default: false,
      customHelp: t(
        i18n,
        'pingpong.endlessHelp',
        'If true, pings will be recreated once their associated pongs fill'
      )
    },

    pingPrice: {
      component: 'input.price',
      label: `${t(i18n, 'pingpong.pingPrice', 'Ping Price')} $QUOTE`
    },

    pongPrice: {
      component: 'input.price',
      label: `${t(i18n, 'pingpong.pongPrice', 'Pong Price')} $QUOTE`
    },

    pongDistance: {
      component: 'input.number',
      label: t(i18n, 'pingpong.pongDistance', 'Pong Distance')
    },

    pingMinPrice: {
      component: 'input.price',
      label: `${t(i18n, 'pingpong.pingMinPrice', 'Ping Min Price')} $QUOTE`
    },

    pingMaxPrice: {
      component: 'input.price',
      label: `${t(i18n, 'pingpong.pingMaxPrice', 'Ping Max Price')} $QUOTE`
    },

    amount: {
      component: 'input.amount',
      label: `${t(i18n, 'amount', 'Amount')} $BASE`,
      customHelp: t(i18n, 'totalOrderAmount', 'Total order amount'),

      visible: {
        splitPingPongAmount: { eq: false }
      }
    },

    pingAmount: {
      component: 'input.amount',
      label: `${t(i18n, 'pingpong.pingAmount', 'Ping Amount')} $BASE`,
      customHelp: t(i18n, 'pingpong.pingOrderSize', 'Ping order size')
    },

    pongAmount: {
      component: 'input.amount',
      label: `${t(i18n, 'pingpong.pongAmount', 'Pong Amount')} $BASE`,
      customHelp: t(i18n, 'pingpong.pongOrderSize', 'Pong order size')
    },

    orderCount: {
      component: 'input.number',
      label: t(i18n, 'orderCount', 'Order Count'),
      default: '1'
    },

    lev: {
      component: 'input.range',
      label: t(i18n, 'leverage', 'Leverage'),
      min: 1,
      max: 100,
      default: 10
    },

    action: {
      component: 'input.radio',
      label: t(i18n, 'action', 'Action'),
      options: [
        {
          label: t(i18n, 'buy', 'Buy'),
          value: 'buy'
        },
        {
          label: t(i18n, 'sell', 'Sell'),
          value: 'sell'
        }
      ],
      inline: true,
      default: 'buy'
    }
  },

  actions: ['preview', 'submit']
})

module.exports = getUIDef
