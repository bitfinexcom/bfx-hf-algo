'use strict'
const { t } = require('../../util/i18n')

/**
 * Returns the UI layout definition for Iceberg, with a field for each parameter.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:Iceberg
 * @returns {AOUIDefinition} uiDef
 */
const getUIDef = ({ i18n } = {}) => ({
  label: t(i18n, 'iceberg.title', 'Iceberg'),
  id: 'bfx-iceberg',

  uiIcon: 'iceberg-active',
  customHelp: t(i18n, 'iceberg.help', [
    'Iceberg allows you to place a large order on the market while ensuring',
    'only a small part of it is ever filled at once.\n\nBy enabling the',
    '\'Excess As Hidden\' option, it is possible to offer up the remainder as',
    'a hidden order, allowing for minimal market disruption when executing',
    'large trades.'
  ].join(' ')),

  connectionTimeout: 10000,
  actionTimeout: 10000,

  sections: [{
    title: '',
    name: 'general',
    rows: [
      ['orderType', 'price'],
      ['amount', 'excessAsHidden'],
      ['sliceAmount', 'sliceAmountPerc']
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
      label: t(i18n, 'excessAsHidden', 'Excess as hidden'),
      default: true,
      customHelp: t(i18n, 'excessAsHidden.help', 'Create a hidden order for the non-slice amount')
    },

    orderType: {
      component: 'input.dropdown',
      label: t(i18n, 'orderType', 'Order Type'),
      default: 'LIMIT',
      options: {
        LIMIT: t(i18n, 'limit', 'Limit'),
        MARKET: t(i18n, 'market', 'Market')
      }
    },

    price: {
      component: 'input.price',
      label: `${t(i18n, 'price', 'Price')} $QUOTE`,
      disabled: {
        orderType: { eq: 'MARKET' }
      }
    },

    amount: {
      component: 'input.amount',
      label: `${t(i18n, 'amount', 'Amount')} $BASE`,
      customHelp: t(i18n, 'amount.help', 'Total order amount, to be executed slice-by-slice'),
      priceField: 'price'
    },

    sliceAmount: {
      component: 'input.number',
      label: `${t(i18n, 'sliceAmount', 'Slice Amount')} $BASE`,
      customHelp: t(i18n, 'sliceAmount.help', 'Allows individual buy & sell amounts to be adjusted'),
      disabled: {
        sliceAmountPerc: { gt: 0 }
      }
    },

    sliceAmountPerc: {
      component: 'input.percent',
      label: t(i18n, 'sliceAmountPerc', 'Slice Amount as %'),
      customHelp: t(i18n, 'sliceAmountPerc.help', 'Takes percentage of total order amount for individual buy & sell amounts'),
      disabled: {
        sliceAmount: { gt: 0 }
      }
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
      options: [t(i18n, 'buy', 'Buy'), t(i18n, 'sell', 'Sell')],
      inline: true,
      default: t(i18n, 'buy', 'Buy')
    }
  },

  actions: ['preview', 'submit']
})

module.exports = getUIDef
