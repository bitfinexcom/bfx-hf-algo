'use strict'

module.exports = () => ({
  label: 'Ping/Pong',
  customHelp: 'Ping/pong submits multiple \'ping\' orders; once a ping order fills, an associated \'pong\' order is submitted.\n\nMultiple ping/pong pairs can be created by specifying an order count greater than 1, a suitable min/max ping price, and a pong distance. Multiple ping orders will be created between the specified min/max prices, with the associated pongs offset by the pong distance from the ping price',
  connectionTimeout: 10000,
  actionTimeout: 10000,

  header: {
    component: 'ui.checkbox_group',
    fields: ['hidden', 'endless', 'splitPingPongAmount', 'followBBands']
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
      orderCount: { gt: 1 },
      followBBands: { eq: false },
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
    name: 'bband_config',
    rows: [
      ['bbandsPeriod', 'bbandsMul'],
      ['bbandsTF', 'bbandsDistance'],
      ['bbandsCandlePrice', null]
    ],

    visible: {
      followBBands: { eq: true }
    }
  }],

  fields: {
    hidden: {
      component: 'input.checkbox',
      label: 'HIDDEN',
      default: false,
      help: 'trading.hideorder_tooltip'
    },

    followBBands: {
      component: 'input.checkbox',
      label: 'FOLLOW BOLLINGER BANDS',
      default: false,
      customHelp: 'Trade in a channel defined by a Bollinger Band indicator',
      visible: {
        orderCount: { gt: 1 },
      }
    },

    bbandsTF: {
      component: 'input.dropdown',
      label: 'Bollinger Bands Time Frame',
      default: 'ONE_MINUTE',
      options: {
        ONE_MINUTE: '1m',
        FIVE_MINUTES: '5m',
        FIFTEEN_MINUTES: '15m',
        THIRTY_MINUTES: '30m',
        ONE_HOUR: '1h',
        THREE_HOURS: '3h',
        SIX_HOURS: '6h',
        TWELVE_HOURS: '12h',
        ONE_DAY: '1D',
        SEVEN_DAYS: '7D',
        FOURTEEN_DAYS: '14D',
        ONE_MONTH: '1M'
      },
    },

    bbandsCandlePrice: {
      component: 'input.dropdown',
      label: 'Bollinger Bands Candle Price',
      default: 'close',
      options: {
        open: 'Open',
        high: 'High',
        low: 'Low',
        close: 'Close',
      },
    },

    bbandsPeriod: {
      component: 'input.number',
      label: 'Bollinger Bands Period',
      customHelp: 'Period value for the internal Bollinger Bands indicator',
      default: 20,
    },

    bbandsMul: {
      component: 'input.number',
      label: 'Bollinger Bands Multiplier',
      customHelp: 'Multiplier value for the internal Bollinger Bands indicator',
      default: 2,
    },

    bbandsDistance: {
      component: 'input.number',
      label: 'Pong Distance'
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
