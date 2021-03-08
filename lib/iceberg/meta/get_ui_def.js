/**
 * Returns the UI layout definition for Iceberg, with a field for each parameter.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:Iceberg
 * @returns {AOUIDefinition} uiDef
 */
const getUIDef = () => ({
  label: 'Iceberg',
  id: 'bfx-iceberg',

  uiIcon: 'iceberg-active',
  customHelp: [
    'Iceberg allows you to place a large order on the market while ensuring',
    'only a small part of it is ever filled at once.\n\nBy enabling the',
    '\'Excess As Hidden\' option, it is possible to offer up the remainder as',
    'a hidden order, allowing for minimal market disruption when executing',
    'large trades.'
  ].join(' '),

  connectionTimeout: 10000,
  actionTimeout: 10000,

  sections: [{
    title: '',
    name: 'general',
    rows: [
      ['orderType', 'price'],
      ['amount', 'excessAsHidden'],
      ['sliceAmount', 'sliceAmountPerc'],
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
  }, {
    title: '',
    name: 'action',
    fullWidth: true,
    rows: [
      ['action']
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
      customHelp: 'Allows individual buy & sell amounts to be adjusted',
      disabled: {
        sliceAmountPerc: { gt: 0 }
      }
    },

    sliceAmountPerc: {
      component: 'input.percent',
      label: 'Slice Amount as %',
      customHelp: 'Takes percentage of total order amount for individual buy & sell amounts',
      disabled: {
        sliceAmount: { gt: 0 }
      }
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
