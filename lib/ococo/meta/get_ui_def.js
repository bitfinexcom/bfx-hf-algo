'use strict'
const { t } = require('../../util/i18n')

/**
 * Returns the UI layout definition for OCOCO, with a field for each parameter.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:OCOCO
 * @returns {object} uiDef
 */
const getUIDef = ({ i18n } = {}) => ({
  label: t(i18n, 'ococo.title', 'Order Creates OcO'),
  id: 'bfx-ococo',

  uiIcon: 'ma-crossover-active',
  connectionTimeout: 10000,
  actionTimeout: 10000,

  customHelp: t(i18n, 'ococo.help', [
    'Creates a standard LIMIT or MARKET order, and schedules an OcO order to be',
    'submitted after the initial order fills. All of the normal LIMIT/MARKET',
    'parameters are available on both orders.'
  ].join('\n')),

  header: {
    component: 'ui.checkbox_group',
    fields: ['hidden', 'postonly', 'visibleOnHit']
  },

  sections: [{
    title: '',
    name: 'general',
    rows: [
      ['orderType', 'orderPrice'],
      ['amount', 'action']
    ]
  }, {
    title: t(i18n, 'ocoSettings', 'OcO Settings'),
    name: 'shortEMASettings',
    fixed: true,

    rows: [
      ['limitPrice', 'stopPrice'],
      ['ocoAmount', 'ocoAction']
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
    orderType: {
      component: 'input.dropdown',
      label: t(i18n, 'orderType', 'Order Type'),
      default: 'LIMIT',
      options: {
        LIMIT: t(i18n, 'limit', 'Limit'),
        MARKET: t(i18n, 'market', 'Market')
      }
    },

    amount: {
      component: 'input.amount',
      label: `${t(i18n, 'amount', 'Amount')} $BASE`,
      customHelp: t(i18n, 'initialOrderAmount', 'Initial Order amount'),
      priceField: 'orderPrice'
    },

    ocoAmount: {
      component: 'input.amount',
      label: `${t(i18n, 'amount', 'Amount')} $BASE`,
      customHelp: t(i18n, 'ocoOrderAmount', 'OcO Order amount')
    },

    orderPrice: {
      component: 'input.price',
      label: `${t(i18n, 'initialOrderPrice', 'Initial Order Price')} $QUOTE`,

      disabled: {
        orderType: { eq: 'MARKET' }
      }
    },

    limitPrice: {
      component: 'input.price',
      label: `${t(i18n, 'ocoLimitPrice', 'OcO Limit Price')} $QUOTE`
    },

    stopPrice: {
      component: 'input.price',
      label: `${t(i18n, 'ocoStopPrice', 'OcO Stop Price')} $QUOTE`
    },

    lev: {
      component: 'input.range',
      label: t(i18n, 'leverage', 'Leverage'),
      min: 1,
      max: 100,
      default: 10
    },

    hidden: {
      component: 'input.checkbox',
      label: t(i18n, 'hidden', 'HIDDEN'),
      default: false,
      customHelp: t(i18n, 'hiddenHelp', `This option allows you to place an order into the book but not have it displayed to
      other traders. Price/time priority is the same as a displayed order, but the hidden order will
      always pay the "taker" fee while those trading against a hidden order will pay the "maker" fee`)
    },

    visibleOnHit: {
      component: 'input.checkbox',
      label: t(i18n, 'visibleOnHit', 'Visible on Hit'),
      default: false,
      customHelp: t(i18n, 'visibleOnHitHelp', 'The rest part of the hidden order will be visible after first hit(partial execution)'),
      visible: {
        hidden: { eq: true }
      }
    },

    postonly: {
      component: 'input.checkbox',
      label: t(i18n, 'postOnly', 'POST-ONLY'),
      default: false,
      customHelp: t(i18n, 'postOnlyHelp', `"Post Only" limit orders are orders that allow you to be sure to always pay the maker fee.
      When placed, a "Post Only" limit order is either inserted into the orderbook or cancelled and not matched
      with a pre-existing order`),
      disabled: {
        orderType: { neq: 'LIMIT' }
      }
    },

    action: {
      component: 'input.radio',
      label: t(i18n, 'action', 'Action'),
      options: [t(i18n, 'buy', 'Buy'), t(i18n, 'sell', 'Sell')],
      inline: true,
      default: t(i18n, 'buy', 'Buy')
    },

    ocoAction: {
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
