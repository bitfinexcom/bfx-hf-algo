module.exports = () => ({
  label: 'Order Creates OcO',
  id: 'bfx-ococo',

  uiIcon: 'ma-crossover-active',
  connectionTimeout: 10000,
  actionTimeout: 10000,

  header: {
    component: 'ui.checkbox_group',
    fields: ['hidden', 'postonly']
  },

  sections: [{
    title: '',
    name: 'general',
    rows: [
      ['orderType', 'orderPrice'],
      ['amount', 'action']
    ]
  }, {
    title: 'OcO Settings',
    name: 'shortEMASettings',
    fixed: true,

    rows: [
      ['limitPrice', 'stopPrice'],
      ['ocoAmount', 'ocoAction']
    ]
  }, {
    title: '',
    name: 'submitSettings',
    fixed: true,

    rows: [
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

    orderType: {
      component: 'input.dropdown',
      label: 'Order Type',
      default: 'LIMIT',
      options: {
        LIMIT: 'Limit',
        MARKET: 'Market'
      }
    },

    amount: {
      component: 'input.amount',
      label: 'Amount $BASE',
      customHelp: 'Initial Order amount',
      priceField: 'orderPrice'
    },

    ocoAmount: {
      component: 'input.amount',
      label: 'Amount $BASE',
      customHelp: 'OcO Order amount'
    },

    orderPrice: {
      component: 'input.price',
      label: 'Initial Order Price $QUOTE',

      disabled: {
        orderType: { eq: 'MARKET' }
      }
    },

    limitPrice: {
      component: 'input.price',
      label: 'OcO Limit Price $QUOTE'
    },

    stopPrice: {
      component: 'input.price',
      label: 'OcO Stop Price $QUOTE'
    },

    lev: {
      component: 'input.range',
      label: 'Leverage',
      min: 1,
      max: 100,
      default: 10
    },

    hidden: {
      component: 'input.checkbox',
      label: 'HIDDEN',
      default: false
    },

    postonly: {
      component: 'input.checkbox',
      label: 'POST-ONLY',
      default: false
    },

    action: {
      component: 'input.radio',
      label: 'Action',
      options: ['Buy', 'Sell'],
      inline: true,
      default: 'Buy'
    },

    ocoAction: {
      component: 'input.radio',
      label: 'Action',
      options: ['Buy', 'Sell'],
      inline: true,
      default: 'Buy'
    }
  },

  actions: ['preview', 'submit']
})
