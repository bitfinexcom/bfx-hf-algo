module.exports = {
  label: 'Market Maker',
  customHelp: 'TODO',
  connectionTimeout: 10000,
  actionTimeout: 10000,

  header: {
    component: 'ui.checkbox_group',
    fields: ['hidden']
  },

  sections: [{
    title: '',
    name: 'general',
    rows: [
      ['orderType', 'orderCount'],
      ['priceTarget', 'price'],
      ['spread', 'spreadPerc'],
      ['amount', 'amountBuySell'],
      ['amountBuy', 'amountSell']
    ]
  }, {
    title: 'Price Distortion',
    name: 'priceDistortion',
    customHelp: 'For Order Count > 2',
    checkbox: true,
    closedByDefault: true,
    disabled: {
      orderCount: { lte: 2 }
    },

    rows: [
      ['priceDPerc', 'priceDPBuySell'],
      ['buyPriceDPerc', 'sellPriceDPerc']
    ]
  }, {
    title: 'Amount Distortion',
    name: 'amountDistortion',
    customHelp: 'For Order Count > 2',
    checkbox: true,
    closedByDefault: true,
    disabled: {
      orderCount: { lte: 2 }
    },

    rows: [
      ['amountDPerc', 'amountDPBuySell'],
      ['amountBuyDPerc', 'amountSellDPerc']
    ]
  }, {
    title: 'Spread Range',
    name: 'spreadRange',
    customHelp: 'For Order Count > 2',
    checkbox: true,
    closedByDefault: true,
    disabled: {
      orderCount: { lte: 2 }
    },

    rows: [
      ['spreadMin', 'spreadPercMin'],
      ['spreadMax', 'spreadPercMax']
    ]
  }],

  fields: {
    hidden: {
      component: 'input.checkbox',
      label: 'HIDDEN',
      default: false,
      help: 'trading.hideorder_tooltip'
    },

    orderType: {
      component: 'input.dropdown',
      label: 'Order Type',
      default: 'LIMIT',
      value: 'LIMIT',
      options: {
        LIMIT: 'Limit'
      }
    },

    orderCount: {
      component: 'input.number',
      label: 'Order Count',
      customHelp: 'Number of orders, split between buy/sell (default 2)',
      default: 2
    },

    priceTarget: {
      component: 'input.dropdown',
      label: 'Price Target',
      default: 'OB_MID',
      options: {
        OB_MID: 'OB mid price',
        custom: 'Custom'
      }
    },

    price: {
      component: 'input.price',
      label: 'Price $QUOTE',
      customHelp: 'Requires \'custom\' price target',
      disabled: {
        priceTarget: { neq: 'custom' }
      }
    },

    spread: {
      component: 'input.number',
      label: 'Spread $QUOTE',
      customHelp: 'Total distance between buy/sell prices'
    },

    spreadPerc: {
      component: 'input.percent',
      label: 'Spread as % of price',
      customHelp: 'Has priority over literal spread'
    },

    amount: {
      component: 'input.amount',
      label: 'Amount $BASE',
      customHelp: 'Total amount split across buy/sell. If individual buy/sell amounts are provided, they are considered as part of the total amount.',
      priceField: 'price'
    },

    amountBuySell: {
      component: 'input.checkbox',
      label: 'Split buy/sell',
      customHelp: 'Allows individual buy & sell amounts to be adjusted',
      default: false
    },

    amountBuy: {
      component: 'input.number',
      label: 'Buy Amount $BASE',
      customHelp: 'Total amount to buy, normally (amount / 2) or (amount - amountSell)',
      visible: {
        amountBuySell: { eq: true }
      }
    },

    amountSell: {
      component: 'input.number',
      label: 'Sell Amount $BASE',
      customHelp: 'Total amount to sell, normally (amount / 2) or (amount - amountBuy)',
      visible: {
        amountBuySell: { eq: true }
      }
    },

    priceDPerc: {
      component: 'input.percent',
      label: 'Distortion ±%',
      customHelp: 'Max step price distortion as a % of the spread between steps'
    },

    priceDPBuySell: {
      component: 'input.checkbox',
      label: 'Split buy/sell',
      default: false
    },

    sellPriceDPerc: {
      component: 'input.percent',
      label: 'Sell ±%',
      customHelp: 'Only for sell orders',
      visible: {
        priceDPBuySell: { eq: true }
      }
    },

    buyPriceDPerc: {
      component: 'input.percent',
      label: 'Buy ±%',
      customHelp: 'Only for buy orders',
      visible: {
        priceDPBuySell: { eq: true }
      }
    },

    amountDPerc: {
      component: 'input.percent',
      label: 'Distortion ±%',
      customHelp: 'Max % to vary amount for scaled orders'
    },

    amountDPBuySell: {
      component: 'input.checkbox',
      label: 'Split buy/sell',
      default: false
    },

    amountSellDPerc: {
      component: 'input.percent',
      label: 'Sell ±%',
      customHelp: 'Only for sell orders',
      visible: {
        amountDPBuySell: { eq: true }
      }
    },

    amountBuyDPerc: {
      component: 'input.percent',
      label: 'Buy ±%',
      customHelp: 'Only for buy orders',
      visible: {
        amountDPBuySell: { eq: true }
      }
    },

    spreadMin: {
      component: 'input.number',
      label: 'Min $QUOTE',
      customHelp: 'Defaults to provided spread, for scaled orders'
    },

    spreadMax: {
      component: 'input.number',
      label: 'Max $QUOTE',
      customHelp: 'Defaults to provided spread, for scaled orders'
    },

    spreadPercMin: {
      component: 'input.percent',
      label: 'Min as % of price',
      customHelp: 'Has priority over literal min'
    },

    spreadPercMax: {
      component: 'input.percent',
      label: 'Max as % of price',
      customHelp: 'Has priority over literal max'
    }
  },

  actions: ['preview', 'submit']
}
