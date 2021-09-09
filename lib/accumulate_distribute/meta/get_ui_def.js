'use strict'
const { t } = require('../../util/i18n')

/**
 * Returns the UI layout definition for AccumulateDistribute, with a field for
 * each parameter.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:AccumulateDistribute
 *
 * @returns {AOUIDefinition} uiDef
 */
const getUIDef = ({ i18n } = {}) => ({
  label: t(i18n, 'orderForm.accdist.title', 'Accumulate/Distribute'),
  id: 'bfx-accumulate_distribute',

  uiIcon: 'distribute-active',
  customHelp: t(i18n, 'orderForm.accdist.help', [
    'Accumulate/Distribute allows you to break up a large order into smaller',
    'randomized chunks, submitted at regular or irregular intervals to minimise',
    'detection by other players in the market.\n\nBy enabling the \'Await Fill\'',
    'option, the algorithm will ensure each component fills before submitting',
    'subsequent orders.\n\nEnabling the \'Catch Up\' flag will cause the',
    'algorithm to ignore the slice interval for the next order if previous',
    'orders have taken longer than expected to fill, thereby ensuring the',
    'time-to-fill for the entire order is not adversely affected. Furthermore,',
    'when \'catching up\', the slice interval is hard-coded to 0.2 seconds.',
    '\n\nNote: If the remaining order amount is less than the minimum order size,',
    'it will be ignored.'
  ].join(' ')),

  connectionTimeout: 10000,
  actionTimeout: 10000,

  header: {
    component: 'ui.checkbox_group',
    fields: ['catchUp', 'awaitFill', 'hidden', 'postonly']
  },

  sections: [{
    title: '',
    name: 'general',
    rows: [
      ['orderType', 'amount'],
      ['sliceAmount', 'amountDistortion'],
      ['sliceIntervalSec', 'intervalDistortion'],
      [null, 'limitPrice']
    ]
  }, {
    title: t(i18n, 'orderForm.priceOffset', 'Price Offset'),
    name: 'offset',
    fixed: true,
    visible: {
      orderType: { eq: 'RELATIVE' }
    },

    rows: [
      ['offsetType', 'offsetDelta']
    ]
  }, {
    name: 'offsetIndicatorSMA',
    title: t(i18n, 'orderForm.priceOffsetSMA', 'Price Offset SMA'),
    fixed: true,
    visible: {
      orderType: { eq: 'RELATIVE' },
      offsetType: { eq: 'SMA' }
    },
    rows: [
      ['offsetIndicatorPeriodSMA', 'offsetIndicatorPriceSMA'],
      [null, 'offsetIndicatorTFSMA']
    ]
  }, {
    name: 'offsetIndicatorEMA',
    title: t(i18n, 'orderForm.priceOffsetEMA', 'Price Offset EMA'),
    fixed: true,
    visible: {
      orderType: { eq: 'RELATIVE' },
      offsetType: { eq: 'EMA' }
    },
    rows: [
      ['offsetIndicatorPeriodEMA', 'offsetIndicatorPriceEMA'],
      [null, 'offsetIndicatorTFEMA']
    ]
  }, {
    title: t(i18n, 'orderForm.priceCap', 'Price Cap'),
    name: 'cap',
    fixed: true,
    visible: {
      orderType: { eq: 'RELATIVE' }
    },

    rows: [
      ['capType', 'capDelta']
    ]
  }, {
    title: t(i18n, 'orderForm.priceCapSMA', 'Price Cap SMA'),
    name: 'capIndicatorSMA',
    fixed: true,
    visible: {
      orderType: { eq: 'RELATIVE' },
      capType: { eq: 'SMA' }
    },
    rows: [
      ['capIndicatorPeriodSMA', 'capIndicatorPriceSMA'],
      [null, 'capIndicatorTFSMA']
    ]
  }, {
    title: t(i18n, 'orderForm.priceCapEMA', 'Price Cap EMA'),
    name: 'capIndicatorEMA',
    fixed: true,
    visible: {
      orderType: { eq: 'RELATIVE' },
      capType: { eq: 'EMA' }
    },
    rows: [
      ['capIndicatorPeriodEMA', 'capIndicatorPriceEMA'],
      [null, 'capIndicatorTFEMA']
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
    rows: [
      ['action', null]
    ]
  }],

  fields: {
    // General section/header
    postonly: {
      component: 'input.checkbox',
      label: t(i18n, 'orderForm.postOnly', 'Post-Only'),
      default: false,
      customHelp: t(i18n, 'orderForm.postOnly.help', `"Post Only" limit orders are orders that allow you to be sure to always pay the maker fee.
      When placed, a "Post Only" limit order is either inserted into the orderbook or cancelled and not matched
      with a pre-existing order`),
      disabled: {
        orderType: { neq: 'LIMIT' }
      }
    },

    catchUp: {
      component: 'input.checkbox',
      label: t(i18n, 'orderForm.catchUp', 'Catch Up'),
      default: true,
      customHelp: t(i18n, 'orderForm.catchUp.help', 'If the algo falls behind in filling orders, disregard the slice interval and submit the next order after a 2 second delay')
    },

    awaitFill: {
      component: 'input.checkbox',
      label: t(i18n, 'orderForm.awaitFill', 'Await Fill'),
      default: true,
      customHelp: t(i18n, 'orderForm.awaitFill.help', 'Keeps the current order open until it fills, while tracking progress for \'Catch up\'')
    },

    hidden: {
      component: 'input.checkbox',
      label: t(i18n, 'orderForm.hidden', 'HIDDEN'),
      default: false,
      customHelp: t(i18n, 'orderForm.hidden.help', `This option allows you to place an order into the book but not have it displayed to
      other traders. Price/time priority is the same as a displayed order, but the hidden order will
      always pay the "taker" fee while those trading against a hidden order will pay the "maker" fee`)
    },

    orderType: {
      component: 'input.dropdown',
      label: t(i18n, 'orderForm.orderType', 'Order Type'),
      default: 'MARKET',
      options: {
        LIMIT: t(i18n, 'orderForm.limit', 'Limit'),
        MARKET: t(i18n, 'orderForm.market', 'Market'),
        RELATIVE: t(i18n, 'orderForm.relative', 'Relative')
      }
    },

    amount: {
      component: 'input.amount',
      label: `${t(i18n, 'orderForm.amount', 'Amount')} $BASE`,
      customHelp: t(i18n, 'orderForm.amount.help', 'Total order amount, to be executed slice-by-slice'),
      priceField: 'limitPrice'
    },

    sliceAmount: {
      component: 'input.number',
      label: `${t(i18n, 'orderForm.sliceAmount', 'Slice Amount')} $BASE`,
      customHelp: t(i18n, 'orderForm.sliceAmount.help', 'Allows individual buy & sell amounts to be adjusted')
    },

    amountDistortion: {
      component: 'input.percent',
      label: t(i18n, 'orderForm.accdist.amountDistortion', 'Amount Distortion %'),
      customHelp: t(i18n, 'orderForm.accdist.amountDistortion.help', 'Amount to distort individual order sizes to prevent detection, in percent')
    },

    sliceIntervalSec: {
      component: 'input.number',
      label: t(i18n, 'orderForm.accdist.sliceIntervalSec', 'Slice Interval S'),
      customHelp: t(i18n, 'orderForm.sliceIntervalSec.help', 'Time to wait between each slice order, in seconds')
    },

    intervalDistortion: {
      component: 'input.percent',
      label: t(i18n, 'orderForm.intervalDistortion', 'Interval Distortion %'),
      customHelp: t(i18n, 'orderForm.intervalDistortion.help', 'Amount to distort each slice interval, in percent')
    },

    limitPrice: {
      component: 'input.price',
      label: `${t(i18n, 'orderForm.limitPrice', 'Price')} $QUOTE`,
      customHelp: t(i18n, 'orderForm.limitPrice.help', 'Price for LIMIT order type'),
      visible: {
        orderType: { eq: 'LIMIT' }
      }
    },

    // Offset section
    offsetType: {
      component: 'input.dropdown',
      label: t(i18n, 'orderForm.offsetType', 'Offset Type'),
      default: 'MID',
      customHelp: t(i18n, 'orderForm.offsetType.help', 'Relative order price as offset from an indicator/book/last trade'),
      options: {
        BID: t(i18n, 'orderForm.topBid', 'Top Bid'),
        ASK: t(i18n, 'orderForm.topAsk', 'Top Ask'),
        MID: t(i18n, 'orderForm.bookMidPrice', 'Book Mid Price'),
        TRADE: t(i18n, 'orderForm.lastTradePrice', 'Last Trade Price'),
        SMA: t(i18n, 'orderForm.simpleMovingAverage', 'Simple Moving Average'),
        EMA: t(i18n, 'orderForm.expMovingAverage', 'Exp Moving Average')
      }
    },

    offsetDelta: {
      component: 'input.number',
      label: t(i18n, 'orderForm.offsetDelta', 'Offset Delta'),
      customHelp: t(i18n, 'orderForm.offsetDelta.help', 'Price as distance from offset value'),
      default: 0
    },

    offsetIndicatorPeriodSMA: {
      component: 'input.number',
      label: t(i18n, 'orderForm.smaPeriod', 'SMA Period'),
      customHelp: t(i18n, 'orderForm.smaPeriod.help', 'Period for simple moving average indicator'),
      visible: {
        offsetType: { eq: 'SMA' }
      }
    },

    offsetIndicatorPriceSMA: {
      component: 'input.dropdown',
      label: t(i18n, 'orderForm.smaCandlePrice', 'SMA Candle Price'),
      default: 'CLOSE',
      options: {
        OPEN: t(i18n, 'orderForm.open', 'Open'),
        HIGH: t(i18n, 'orderForm.high', 'High'),
        LOW: t(i18n, 'orderForm.low', 'Low'),
        CLOSE: t(i18n, 'orderForm.close', 'Close')
      },

      visible: {
        offsetType: { eq: 'SMA' }
      }
    },

    offsetIndicatorPeriodEMA: {
      component: 'input.number',
      label: t(i18n, 'orderForm.emaPeriod', 'EMA Period'),
      customHelp: t(i18n, 'orderForm.emaPeriod.help', 'Period for exponential moving average indicator'),
      visible: {
        offsetType: { eq: 'EMA' }
      }
    },

    offsetIndicatorPriceEMA: {
      component: 'input.dropdown',
      label: t(i18n, 'orderForm.emaCandlePrice', 'EMA Candle Price'),
      default: 'CLOSE',
      options: {
        OPEN: t(i18n, 'orderForm.open', 'Open'),
        HIGH: t(i18n, 'orderForm.high', 'High'),
        LOW: t(i18n, 'orderForm.low', 'Low'),
        CLOSE: t(i18n, 'orderForm.close', 'Close')
      },

      visible: {
        offsetType: { eq: 'EMA' }
      }
    },

    offsetIndicatorTFSMA: {
      component: 'input.dropdown',
      label: t(i18n, 'orderForm.smaCandleTimeFrame', 'SMA Candle Time Frame'),
      default: 'ONE_HOUR',
      options: {
        ONE_MINUTE: t(i18n, 'orderForm.m', '1m', { number: 1 }),
        FIVE_MINUTES: t(i18n, 'orderForm.m', '5m', { number: 5 }),
        FIFTEEN_MINUTES: t(i18n, 'orderForm.m', '15m', { number: 15 }),
        THIRTY_MINUTES: t(i18n, 'orderForm.m', '30m', { number: 30 }),
        ONE_HOUR: t(i18n, 'orderForm.h', '1h', { number: 1 }),
        THREE_HOURS: t(i18n, 'orderForm.h', '3h', { number: 3 }),
        SIX_HOURS: t(i18n, 'orderForm.h', '6h', { number: 6 }),
        TWELVE_HOURS: t(i18n, 'orderForm.h', '12h', { number: 12 }),
        ONE_DAY: t(i18n, 'orderForm.D', '1D', { number: 1 }),
        SEVEN_DAYS: t(i18n, 'orderForm.D', '7D', { number: 7 }),
        FOURTEEN_DAYS: t(i18n, 'orderForm.D', '14D', { number: 14 }),
        ONE_MONTH: t(i18n, 'orderForm.M', '1M', { number: 1 })
      },

      visible: {
        offsetType: { eq: 'SMA' }
      }
    },

    offsetIndicatorTFEMA: {
      component: 'input.dropdown',
      label: t(i18n, 'orderForm.emaCandleTimeFrame', 'EMA Candle Time Frame'),
      default: 'ONE_HOUR',
      options: {
        ONE_MINUTE: t(i18n, 'orderForm.m', '1m', { number: 1 }),
        FIVE_MINUTES: t(i18n, 'orderForm.m', '5m', { number: 5 }),
        FIFTEEN_MINUTES: t(i18n, 'orderForm.m', '15m', { number: 15 }),
        THIRTY_MINUTES: t(i18n, 'orderForm.m', '30m', { number: 30 }),
        ONE_HOUR: t(i18n, 'orderForm.h', '1h', { number: 1 }),
        THREE_HOURS: t(i18n, 'orderForm.h', '3h', { number: 3 }),
        SIX_HOURS: t(i18n, 'orderForm.h', '6h', { number: 6 }),
        TWELVE_HOURS: t(i18n, 'orderForm.h', '12h', { number: 12 }),
        ONE_DAY: t(i18n, 'orderForm.D', '1D', { number: 1 }),
        SEVEN_DAYS: t(i18n, 'orderForm.D', '7D', { number: 7 }),
        FOURTEEN_DAYS: t(i18n, 'orderForm.D', '14D', { number: 14 }),
        ONE_MONTH: t(i18n, 'orderForm.M', '1M', { number: 1 })
      },

      visible: {
        offsetType: { eq: 'EMA' }
      }
    },

    // Cap section
    capType: {
      component: 'input.dropdown',
      label: t(i18n, 'orderForm.priceCapType', 'Price Cap Type'),
      default: 'MID',
      customHelp: t(i18n, 'orderForm.priceCapType.help', 'Upper price limit for relative order type'),
      options: {
        BID: t(i18n, 'orderForm.topBid', 'Top Bid'),
        ASK: t(i18n, 'orderForm.topAsk', 'Top Ask'),
        MID: t(i18n, 'orderForm.bookMidPrice', 'Book Mid Price'),
        TRADE: t(i18n, 'orderForm.lastTradePrice', 'Last Trade Price'),
        SMA: t(i18n, 'orderForm.simpleMovingAverage', 'Simple Moving Average'),
        EMA: t(i18n, 'orderForm.expMovingAverage', 'Exp Moving Average'),
        NONE: t(i18n, 'orderForm.none', 'None')
      }
    },

    capDelta: {
      component: 'input.number',
      label: t(i18n, 'orderForm.capDelta', 'Cap Delta'),
      customHelp: t(i18n, 'orderForm.capDelta.help', 'Price as distance from cap value'),
      default: 0,

      disabled: {
        capType: { eq: 'NONE' }
      }
    },

    capIndicatorPeriodSMA: {
      component: 'input.number',
      label: t(i18n, 'orderForm.smaPeriod', 'SMA Period'),
      customHelp: t(i18n, 'orderForm.smaPeriod.help', 'Period for moving average indicator'),
      visible: {
        capType: { eq: 'SMA' }
      }
    },

    capIndicatorPriceSMA: {
      component: 'input.dropdown',
      label: t(i18n, 'orderForm.smaCandlePrice', 'SMA Candle Price'),
      default: 'CLOSE',
      options: {
        OPEN: t(i18n, 'orderForm.open', 'Open'),
        HIGH: t(i18n, 'orderForm.high', 'High'),
        LOW: t(i18n, 'orderForm.low', 'Low'),
        CLOSE: t(i18n, 'orderForm.close', 'Close')
      },
      visible: {
        capType: { eq: 'SMA' }
      }
    },

    capIndicatorPeriodEMA: {
      component: 'input.number',
      label: t(i18n, 'orderForm.emaPeriod', 'EMA Period'),
      customHelp: t(i18n, 'orderForm.emaPeriod.help', 'Period for exponential moving average indicator'),
      visible: {
        capType: { eq: 'EMA' }
      }
    },

    capIndicatorPriceEMA: {
      component: 'input.dropdown',
      label: t(i18n, 'orderForm.emaCandlePrice', 'EMA Candle Price'),
      default: 'CLOSE',
      options: {
        OPEN: t(i18n, 'orderForm.open', 'Open'),
        HIGH: t(i18n, 'orderForm.high', 'High'),
        LOW: t(i18n, 'orderForm.low', 'Low'),
        CLOSE: t(i18n, 'orderForm.close', 'Close')
      },
      visible: {
        capType: { eq: 'EMA' }
      }
    },

    capIndicatorTFSMA: {
      component: 'input.dropdown',
      label: t(i18n, 'orderForm.smaCandleTimeFrame', 'SMA Candle Time Frame'),
      default: 'ONE_HOUR',
      options: {
        ONE_MINUTE: t(i18n, 'orderForm.m', '1m', { number: 1 }),
        FIVE_MINUTES: t(i18n, 'orderForm.m', '5m', { number: 5 }),
        FIFTEEN_MINUTES: t(i18n, 'orderForm.m', '15m', { number: 15 }),
        THIRTY_MINUTES: t(i18n, 'orderForm.m', '30m', { number: 30 }),
        ONE_HOUR: t(i18n, 'orderForm.h', '1h', { number: 1 }),
        THREE_HOURS: t(i18n, 'orderForm.h', '3h', { number: 3 }),
        SIX_HOURS: t(i18n, 'orderForm.h', '6h', { number: 6 }),
        TWELVE_HOURS: t(i18n, 'orderForm.h', '12h', { number: 12 }),
        ONE_DAY: t(i18n, 'orderForm.D', '1D', { number: 1 }),
        SEVEN_DAYS: t(i18n, 'orderForm.D', '7D', { number: 7 }),
        FOURTEEN_DAYS: t(i18n, 'orderForm.D', '14D', { number: 14 }),
        ONE_MONTH: t(i18n, 'orderForm.M', '1M', { number: 1 })
      },
      visible: {
        capType: { eq: 'SMA' }
      }
    },

    capIndicatorTFEMA: {
      component: 'input.dropdown',
      label: t(i18n, 'orderForm.emaCandleTimeFrame', 'EMA Candle Time Frame'),
      default: 'ONE_HOUR',
      options: {
        ONE_MINUTE: t(i18n, 'orderForm.m', '1m', { number: 1 }),
        FIVE_MINUTES: t(i18n, 'orderForm.m', '5m', { number: 5 }),
        FIFTEEN_MINUTES: t(i18n, 'orderForm.m', '15m', { number: 15 }),
        THIRTY_MINUTES: t(i18n, 'orderForm.m', '30m', { number: 30 }),
        ONE_HOUR: t(i18n, 'orderForm.h', '1h', { number: 1 }),
        THREE_HOURS: t(i18n, 'orderForm.h', '3h', { number: 3 }),
        SIX_HOURS: t(i18n, 'orderForm.h', '6h', { number: 6 }),
        TWELVE_HOURS: t(i18n, 'orderForm.h', '12h', { number: 12 }),
        ONE_DAY: t(i18n, 'orderForm.D', '1D', { number: 1 }),
        SEVEN_DAYS: t(i18n, 'orderForm.D', '7D', { number: 7 }),
        FOURTEEN_DAYS: t(i18n, 'orderForm.D', '14D', { number: 14 }),
        ONE_MONTH: t(i18n, 'orderForm.M', '1M', { number: 1 })
      },
      visible: {
        capType: { eq: 'EMA' }
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
      label: t(i18n, 'orderForm.action', 'Action'),
      options: [t(i18n, 'orderForm.buy', 'Buy'), t(i18n, 'orderForm.sell', 'Sell')],
      inline: true,
      default: t(i18n, 'orderForm.buy', 'Buy')
    }
  },

  actions: ['preview', 'submit']
})

module.exports = getUIDef
