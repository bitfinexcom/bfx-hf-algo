module.exports = () => ({
  label: 'Accumulate/Distribute',
  customHelp: 'TODO',
  connectionTimeout: 10000,
  actionTimeout: 10000,

  header: {
    component: 'ui.checkbox_group',
    fields: ['catchUp', 'awaitFill', 'hidden'],
  },

  sections: [{
    title: '',
    name: 'general',
    rows: [
      ['orderType', 'amount'],
      ['sliceAmount', 'amountDistortionPerc'],
      ['interval', 'intervalDistortionPerc'],
      [null, 'limitPrice']
    ]
  }, {
    name: 'offset',
    visible: {
      orderType: { eq: 'RELATIVE' }
    },

    rows: [
      ['offsetType', 'offsetDelta'],
      ['offsetIndicatorPeriodMA', 'offsetIndicatorPriceMA'],
      ['offsetIndicatorPeriodEMA', 'offsetIndicatorPriceEMA'],
      [null, 'offsetIndicatorTFMA']
      [null, 'offsetIndicatorTFEMA']
    ]
  }, {
    name: 'cap',
    visible: {
      orderType: { eq: 'RELATIVE' }
    },

    rows: [
      ['capType', 'capDelta'],
      ['capIndicatorPeriodMA', 'capIndicatorPriceMA'],
      ['capIndicatorPeriodEMA', 'capIndicatorPriceEMA'],
      [null, 'capIndicatorTFMA']
      [null, 'capIndicatorTFEMA']
    ]
  }, {
    name: 'actions',
    rows: [
      ['submitDelay', 'cancelDelay'],
      ['action', null]
    ]
  }],

  fields: {
    // General section/header
    catchUp: {
      component: 'input.checkbox',
      label: 'Catch Up',
      default: true,
      customHelp: 'If the algo falls behind in filling orders, disregard the slice interval and submit the next order after a 2 second delay'
    },

    awaitFill: {
      component: 'input.checkbox',
      label: 'Await Fill',
      default: true,
      customHelp: 'Keeps the current order open until it fills, while tracking progress for \'Catch up\''
    },
 
    hidden: {
      component: 'input.checkbox',
      label: 'HIDDEN',
      default: false,
      help: 'trading.hideorder_tooltip',
    },
 
    orderType: {
      component: 'input.dropdown',
      label: 'Order Type',
      default: 'MARKET',
      options: {
        LIMIT: 'Limit',
        MARKET: 'Market',
        RELATIVE: 'Relative'
      }
    },

    amount: {
      component: 'input.amount',
      label: 'Amount $BASE',
      customHelp: 'Total order amount, to be executed slice-by-slice',
      priceField: 'limitPrice'
    },

    sliceAmount: {
      component: 'input.number',
      label: 'Slice Amount $BASE',
      customHelp: 'Allows individual buy & sell amounts to be adjusted'
    },

    amountDistortionPerc: {
      component: 'input.percent',
      label: 'Amount Distortion %',
      customHelp: 'Amount to distort individual order sizes to prevent detection, in percent',
    },

    interval: {
      component: 'input.number',
      label: 'Slice Interval S',
      customHelp: 'Time to wait between each slice order, in seconds'
    },

    intervalDistortionPerc: {
      component: 'input.percent',
      label: 'Interval Distortion %',
      customHelp: 'Amount to distort each slice interval, in percent',
    },

    limitPrice: {
      component: 'input.price',
      label: 'Price $QUOTE',
      customHelp: 'Price for LIMIT order type',
      visible: {
        orderType: { eq: 'LIMIT' }
      }
    },

    // Offset section
    offsetType: {
      component: 'input.dropdown',
      label: 'Offset Type',
      default: 'MID',
      customHelp: 'Relative order price as offset from an indicator/book/last trade',
      options: {
        BID: 'Top Bid',
        ASK: 'Top Ask',
        MID: 'Book Mid Price',
        LAST: 'Last Trade Price',
        MA: 'Moving Average',
        EMA: 'Exp Moving Average'
      }
    },

    offsetDelta: {
      component: 'input.number',
      label: 'Offset Delta',
      customHelp: 'Price as distance from offset value'
    },

    offsetIndicatorPeriodMA: {
      component: 'input.number',
      label: 'MA Period',
      customHelp: 'Period for moving average indicator',
      visible: {
        offsetType: { eq: 'MA' }
      }
    },

    offsetIndicatorPriceMA: {
      component: 'input.dropdown',
      label: 'MA Candle Price',
      default: 'CLOSE',
      options: {
        OPEN: 'Open',
        HIGH: 'High',
        LOW: 'Low',
        CLOSE: 'Close',
      },

      visible: {
        offsetType: { eq: 'MA' }
      }
    },

    offsetIndicatorPeriodEMA: {
      component: 'input.number',
      label: 'EMA Period',
      customHelp: 'Period for exponential moving average indicator',
      visible: {
        offsetType: { eq: 'EMA' }
      }
    },

    offsetIndicatorPriceEMA: {
      component: 'input.dropdown',
      label: 'EMA Candle Price',
      default: 'CLOSE',
      options: {
        OPEN: 'Open',
        HIGH: 'High',
        LOW: 'Low',
        CLOSE: 'Close',
      },

      visible: {
        offsetType: { eq: 'EMA' }
      }
    },

    offsetIndicatorTFMA: {
      component: 'input.dropdown',
      label: 'MA Candle Time Frame',
      default: 'ONE_HOUR',
      options: {
        ONE_MINUTE: '1m',
        FIVE_MINUTES: '5m',
        FIFTEEN_MINUTES: '15m',
        THIRTY_MINUTES: '30m',
        ONE_HOUR: '1h',
        THREE_HOURS: '3h',
        SIX_HOURS: '6h',
        TWELVE_HOURS: '12h',
        ONE_DAY: '1D',
        SEVEN_DAYS: '7D',
        FOURTEEN_DAYS: '14D',
        ONE_MONTH: '1M',
      },

      visible: {
        offsetType: { eq: 'MA' }
      }
    },

    offsetIndicatorTFEMA: {
      component: 'input.dropdown',
      label: 'EMA Candle Time Frame',
      default: 'ONE_HOUR',
      options: {
        ONE_MINUTE: '1m',
        FIVE_MINUTES: '5m',
        FIFTEEN_MINUTES: '15m',
        THIRTY_MINUTES: '30m',
        ONE_HOUR: '1h',
        THREE_HOURS: '3h',
        SIX_HOURS: '6h',
        TWELVE_HOURS: '12h',
        ONE_DAY: '1D',
        SEVEN_DAYS: '7D',
        FOURTEEN_DAYS: '14D',
        ONE_MONTH: '1M',
      },

      visible: {
        offsetType: { eq: 'EMA' }
      }
    },

    // Cap section
    capType: {
      component: 'input.dropdown',
      label: 'Price Cap Type',
      default: 'MID',
      customHelp: 'Upper price limit for relative order type',
      options: {
        BID: 'Top Bid',
        ASK: 'Top Ask',
        MID: 'Book Mid Price',
        LAST: 'Last Trade Price',
        MA: 'Moving Average',
        EMA: 'Exp Moving Average'
      }
    },

    capDelta: {
      component: 'input.number',
      label: 'Cap Delta',
      customHelp: 'Price as distance from cap value'
    },

    capIndicatorPeriodMA: {
      component: 'input.number',
      label: 'MA Period',
      customHelp: 'Period for moving average indicator',
      visible: {
        capType: { eq: 'MA' }
      }
    },

    capIndicatorPriceMA: {
      component: 'input.dropdown',
      label: 'MA Candle Price',
      default: 'CLOSE',
      options: {
        OPEN: 'Open',
        HIGH: 'High',
        LOW: 'Low',
        CLOSE: 'Close',
      },
      visible: {
        capType: { eq: 'MA' }
      }
    },

    capIndicatorPeriodEMA: {
      component: 'input.number',
      label: 'EMA Period',
      customHelp: 'Period for exponential moving average indicator',
      visible: {
        capType: { eq: 'EMA' }
      }
    },

    capIndicatorPriceEMA: {
      component: 'input.dropdown',
      label: 'EMA Candle Price',
      default: 'CLOSE',
      options: {
        OPEN: 'Open',
        HIGH: 'High',
        LOW: 'Low',
        CLOSE: 'Close',
      },
      visible: {
        capType: { eq: 'EMA' }
      }
    },

    capIndicatorTFMA: {
      component: 'input.dropdown',
      label: 'MA Candle Time Frame',
      default: 'ONE_HOUR',
      options: {
        ONE_MINUTE: '1m',
        FIVE_MINUTES: '5m',
        FIFTEEN_MINUTES: '15m',
        THIRTY_MINUTES: '30m',
        ONE_HOUR: '1h',
        THREE_HOURS: '3h',
        SIX_HOURS: '6h',
        TWELVE_HOURS: '12h',
        ONE_DAY: '1D',
        SEVEN_DAYS: '7D',
        FOURTEEN_DAYS: '14D',
        ONE_MONTH: '1M',
      },
      visible: {
        capType: { eq: 'MA' }
      }
    },

    capIndicatorTFEMA: {
      component: 'input.dropdown',
      label: 'EMA Candle Time Frame',
      default: 'ONE_HOUR',
      options: {
        ONE_MINUTE: '1m',
        FIVE_MINUTES: '5m',
        FIFTEEN_MINUTES: '15m',
        THIRTY_MINUTES: '30m',
        ONE_HOUR: '1h',
        THREE_HOURS: '3h',
        SIX_HOURS: '6h',
        TWELVE_HOURS: '12h',
        ONE_DAY: '1D',
        SEVEN_DAYS: '7D',
        FOURTEEN_DAYS: '14D',
        ONE_MONTH: '1M',
      },
      visible: {
        capType: { eq: 'EMA' }
      }
    },

    // Action section
    submitDelay: {
      component: 'input.number',
      label: 'Submit Delay (sec)',
      customHelp: 'Seconds to wait before submitting orders',
      default: 2
    },

    cancelDelay: {
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
