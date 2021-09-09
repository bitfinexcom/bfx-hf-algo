'use strict'
const { t } = require('../../util/i18n')

/**
 * Returns the UI layout definition for TWAP, with a field for each parameter.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:TWAP
 * @returns {AOUIDefinition} uiDef
 */
const getUIDef = ({ i18n } = {}) => ({
  label: t(i18n, 'orderForm.twap.title', 'TWAP'),
  id: 'bfx-twap',

  uiIcon: 'twap-active',
  customHelp: t(i18n, 'orderForm.twap.help', [
    'TWAP spreads an order out through time in order to fill at the',
    'time-weighted average price, calculated between the time the order is',
    'submitted to the final atomic order close.\n\nThe price target may be set',
    'either by the order book, last trade price, or a custom explicit target',
    'that must be conditionally matched against another factor.\n\nWith custom',
    'price targets, the price condition may be specified to match against',
    'either the order book or last trade. If a price delta is specified, the',
    'target must be within the delta in order to match.',
    '\n\nNote: If amount distortion is provided, the total order amounts will',
    'not exceed the total amount but may be slightly less than the total amount specified.'
  ].join(' ')),

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
      label: t(i18n, 'orderForm.tradeBeyondEnd', 'Trade Beyond End'),
      customHelp: t(i18n, 'orderForm.tradeBeyondEnd.help', 'Continue trading beyond slice interval'),
      default: false
    },

    orderType: {
      component: 'input.dropdown',
      label: t(i18n, 'orderForm.orderType', 'Order Type'),
      default: 'LIMIT',
      options: {
        LIMIT: t(i18n, 'orderForm.limit', 'Limit'),
        MARKET: t(i18n, 'orderForm.market', 'Market')
      }
    },

    amount: {
      component: 'input.amount',
      label: `${t(i18n, 'orderForm.amount', 'Amount')} $BASE`,
      customHelp: t(i18n, 'orderForm.amount.help', 'Total order amount'),
      priceField: 'price'
    },

    amountDistortion: {
      component: 'input.percent',
      default: 0,
      label: t(i18n, 'orderForm.amountDistortionPerc', 'Amount Distortion %'),
      customHelp: t(i18n, 'orderForm.amountDistortionPerc.help', 'Amount to distort individual order sizes to prevent detection, in percent')
    },

    sliceAmount: {
      component: 'input.number',
      label: `${t(i18n, 'orderForm.sliceAmount', 'Slice Amount')} $BASE`,
      customHelp: t(i18n, 'orderForm.sliceAmount.help', 'Allows individual buy & sell amounts to be adjusted')
    },

    sliceInterval: {
      component: 'input.number',
      default: 2,
      label: t(i18n, 'orderForm.sliceIntervalSec', 'Slice Interval (sec)'),
      customHelp: t(i18n, 'orderForm.sliceIntervalSec.help', 'Duration over which to trade slice')
    },

    priceDelta: {
      component: 'input.number',
      label: t(i18n, 'orderForm.targetDelta', 'Target Delta'),
      customHelp: t(i18n, 'orderForm.twap.targetDelta.help', '± Distance from price target for match'),
      disabled: {
        priceTarget: { neq: 'CUSTOM' }
      }
    },

    price: {
      component: 'input.price',
      label: `${t(i18n, 'orderForm.price', 'Price')} $QUOTE`,
      customHelp: t(i18n, 'orderForm.twap.price.help', 'Requires \'custom\' price target'),
      disabled: {
        priceTarget: { neq: 'CUSTOM' }
      }
    },

    priceTarget: {
      component: 'input.dropdown',
      label: t(i18n, 'orderForm.priceTarget', 'Price Target'),
      default: 'OB_MID',
      options: {
        OB_MID: t(i18n, 'orderForm.obMidPrice', 'OB mid price'),
        OB_SIDE: t(i18n, 'orderForm.obSidePrice', 'OB side price'),
        LAST: t(i18n, 'orderForm.lastTradePrice', 'Last trade price'),
        CUSTOM: t(i18n, 'orderForm.custom', 'Custom')
      }
    },

    priceCondition: {
      component: 'input.dropdown',
      label: t(i18n, 'orderForm.priceCondition', 'Price Condition'),
      default: 'MATCH_MIDPOINT',
      customHelp: t(i18n, 'orderForm.priceCondition.help', 'Match point for custom price targets'),
      visible: {
        priceTarget: { eq: 'CUSTOM' }
      },

      options: {
        MATCH_MIDPOINT: t(i18n, 'orderForm.matchObMidPrice', 'Match OB mid price'),
        MATCH_SIDE: t(i18n, 'orderForm.matchObSidePrice', 'Match OB side'),
        MATCH_LAST: t(i18n, 'orderForm.matchLastTrade', 'Match last trade price')
      }
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
