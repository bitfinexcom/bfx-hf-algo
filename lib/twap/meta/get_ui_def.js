/**
 * Returns the UI layout definition for TWAP, with a field for each parameter.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:TWAP
 * @returns {AOUIDefinition} uiDef
 */
const getUIDef = () => ({
  label: 'TWAP',
  id: 'bfx-twap',

  uiIcon: 'twap-active',
  customHelp: [
    'TWAP spreads an order out through time in order to fill at the',
    'time-weighted average price, calculated between the time the order is',
    'submitted to the final atomic order close.\n\nThe price target may be set',
    'either by the order book, last trade price, or a custom explicit target',
    'that must be conditionally matched against another factor.\n\nWith custom',
    'price targets, the price condition may be specified to match against',
    'either the order book or last trade. If a price delta is specified, the',
    'target must be within the delta in order to match.'
  ].join(' '),

  connectionTimeout: 10000,
  actionTimeout: 10000,

  header: {
    component: 'ui.checkbox_group',
    fields: ['tradeBeyondEnd']
  },

  sections: [{
    title: '',
    name: 'general',
    rows: [
      ['orderType', 'amount'],
      ['sliceAmount', 'amountDistortion'],
      ['sliceInterval']
    ]
  }, {
    title: '',
    name: 'price',

    visible: {
      orderType: { eq: 'LIMIT' }
    },

    rows: [
      ['priceTarget', 'price'],
      ['priceCondition', 'priceDelta']
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
    name: 'actions',
    rows: [['action', null]]
  }],

  fields: {
    tradeBeyondEnd: {
      component: 'input.checkbox',
      label: 'Trade Beyond End',
      customHelp: 'Continue trading beyond slice interval',
      default: false
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
      customHelp: 'Total order amount',
      priceField: 'price'
    },

    amountDistortion: {
      component: 'input.percent',
      default: 0,
      label: 'Amount Distortion %',
      customHelp: 'Amount to distort individual order sizes to prevent detection, in percent'
    },

    sliceAmount: {
      component: 'input.number',
      label: 'Slice Amount $BASE',
      customHelp: 'Allows individual buy & sell amounts to be adjusted'
    },

    sliceInterval: {
      component: 'input.number',
      default: 2,
      label: 'Slice Interval (sec)',
      customHelp: 'Duration over which to trade slice'
    },

    priceDelta: {
      component: 'input.number',
      label: 'Target Delta',
      customHelp: '± Distance from price target for match',
      disabled: {
        priceTarget: { neq: 'CUSTOM' }
      }
    },

    price: {
      component: 'input.price',
      label: 'Price $QUOTE',
      customHelp: 'Requires \'custom\' price target',
      disabled: {
        priceTarget: { neq: 'CUSTOM' }
      }
    },

    priceTarget: {
      component: 'input.dropdown',
      label: 'Price Target',
      default: 'OB_MID',
      options: {
        OB_MID: 'OB mid price',
        OB_SIDE: 'OB side price',
        LAST: 'Last trade price',
        CUSTOM: 'Custom'
      }
    },

    priceCondition: {
      component: 'input.dropdown',
      label: 'Price Condition',
      default: 'MATCH_MIDPOINT',
      customHelp: 'Match point for custom price targets',
      visible: {
        priceTarget: { eq: 'CUSTOM' }
      },

      options: {
        MATCH_MIDPOINT: 'Match OB mid price',
        MATCH_SIDE: 'Match OB side',
        MATCH_LAST: 'Match last trade price'
      }
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
