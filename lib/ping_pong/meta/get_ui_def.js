'use strict'

module.exports = () => ({
  label: 'Ping/Pong',
  customHelp: 'Ping/pong submits multiple \'ping\' orders; once a ping order fills, an associated \'pong\' order is submitted.\n\nMultiple ping/pong pairs can be created by specifying an order count greater than 1, a suitable min/max ping price, and a pong distance. Multiple ping orders will be created between the specified min/max prices, with the associated pongs offset by the pong distance from the ping price',
  connectionTimeout: 10000,
  actionTimeout: 10000,

  header: {
    component: 'ui.checkbox_group',
    fields: ['hidden', 'endless'],
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
  }],

  fields: {
    hidden: {
      component: 'input.checkbox',
      label: 'HIDDEN',
      default: false,
      help: 'trading.hideorder_tooltip',
    },

    endless: {
      component: 'input.checkbox',
      label: 'ENDLESS',
      default: false,
      customHelp: 'If true, pings will be recreated once their associated pongs fill'
    },

    pingPrice: {
      component: 'input.price',
      label: 'Ping Price $QUOTE',
    },

    pongPrice: {
      component: 'input.price',
      label: 'Pong Price $QUOTE',
    },

    pongDistance: {
      component: 'input.number',
      label: 'Pong Distance',
    },

    pingMinPrice: {
      component: 'input.price',
      label: 'Ping Min Price $QUOTE',
    },

    pingMaxPrice: {
      component: 'input.price',
      label: 'Ping Max Price $QUOTE',
    },

    amount: {
      component: 'input.amount',
      label: 'Amount $BASE',
      customHelp: 'Total order amount'
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
