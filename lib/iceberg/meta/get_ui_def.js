module.exports = () => ({
  label: 'Iceberg',
  customHelp: 'Iceberg allows you to place a large order on the market while ensuring only a small part of it is ever filled at once.\n\nBy enabling the \'Excess As Hidden\' option, it is possible to offer up the remainder as a hidden order, allowing for minimal market disruption when executing large trades.',
  connectionTimeout: 10000,
  actionTimeout: 10000,

  sections: [{
    title: '',
    name: 'general',
    rows: [
      ['orderType', 'price'],
      ['amount', 'excessAsHidden'],
      ['sliceAmount', 'sliceAmountPerc'],
      ['submitDelaySec', 'cancelDelaySec'],
      ['action', null]
    ]
  }],

  fields: {
    excessAsHidden: {
      component: 'input.checkbox',
      label: 'Excess as hidden',
      default: true,
      customHelp: 'Create a hidden order for the non-slice amount'
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

    price: {
      component: 'input.price',
      label: 'Price $QUOTE',
      disabled: {
        orderType: { eq: 'MARKET' }
      }
    },

    amount: {
      component: 'input.amount',
      label: 'Amount $BASE',
      customHelp: 'Total order amount, to be executed slice-by-slice',
      priceField: 'price'
    },

    sliceAmount: {
      component: 'input.number',
      label: 'Slice Amount $BASE',
      customHelp: 'Allows individual buy & sell amounts to be adjusted'
    },

    sliceAmountPerc: {
      component: 'input.percent',
      label: 'Slice Amount as %',
      customHelp: 'Takes priority over literal amount'
    },

    submitDelaySec: {
      component: 'input.number',
      label: 'Submit Delay (sec)',
      customHelp: 'Seconds to wait before submitting orders',
      default: 2
    },

    cancelDelaySec: {
      component: 'input.number',
      label: 'Cancel Delay (sec)',
      customHelp: 'Seconds to wait before cancelling orders',
      default: 1
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
