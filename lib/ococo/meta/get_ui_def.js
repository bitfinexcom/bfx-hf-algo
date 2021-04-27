/**
 * Returns the UI layout definition for OCOCO, with a field for each parameter.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:OCOCO
 * @returns {object} uiDef
 */
const getUIDef = () => ({
  label: 'Order Creates OcO',
  id: 'bfx-ococo',

  uiIcon: 'ma-crossover-active',
  connectionTimeout: 10000,
  actionTimeout: 10000,

  customHelp: [
    'Creates a standard LIMIT or MARKET order, and schedules an OcO order to be',
    'submitted after the initial order fills. All of the normal LIMIT/MARKET',
    'parameters are available on both orders.'
  ].join('\n'),

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

module.exports = getUIDef
