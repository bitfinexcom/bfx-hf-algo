module.exports = {
  label: 'TWAP',
  customHelp: 'TODO',
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
      ['sliceAmount', 'sliceInterval']
    ]
  }, {
    title: '',
    name: 'price',

    visible: {
      orderType: { eq: 'LIMIT' }
    },

    rows: [
      ['priceTarget', 'price'],
      ['priceCondition', null]
    ]
  }, {
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

    sliceAmount: {
      component: 'input.number',
      label: 'Slice Amount $BASE',
      customHelp: 'Total slice size'
    },

    sliceInterval: {
      component: 'input.number',
      label: 'Slice Interval (sec)',
      customHelp: 'Duration over which to trade slice'
    },

    price: {
      component: 'input.price',
      label: 'Price $QUOTE',
      customHelp: 'Requires \'custom\' price target',
      disabled: {
        priceTarget: { neq: 'custom' }
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
        custom: 'Custom'
      }
    },

    priceCondition: {
      component: 'input.dropdown',
      label: 'Price Condition',
      default: 'MATCH_MIDPOINT',
      customHelp: 'Match point for custom price targets',
      disabled: {
        priceTarget: { neq: 'custom' }
      },

      options: {
        MATCH_MIDPOINT: 'Match OB mid price',
        MATCH_SIDE: 'Match OB side',
        MATCH_LAST: 'Match last trade price'
      }
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
}
