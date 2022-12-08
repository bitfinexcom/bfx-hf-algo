'use strict'
const { t } = require('../../util/i18n')

/**
 * Returns the UI layout definition for MACrossver, with a field for each
 * parameter.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:MACrossver
 * @param {object} data - required data
 * @param {string[]} data.timeframes - array of timeframes to show in dropdowns
 * @returns {AOUIDefinition} uiDef
 */
const getUIDef = ({ timeframes, i18n }) => {
  const tfDropdownOptions = {}

  timeframes.forEach((tf) => {
    tfDropdownOptions[tf] = tf
  })

  return {
    label: t(i18n, 'crossover.title', 'MA Crossover'),
    id: 'bfx-ma_crossover',

    uiIcon: 'ma-crossover-active',
    connectionTimeout: 10000,
    actionTimeout: 10000,

    customHelp: t(
      i18n,
      'crossover.help',
      [
        'Schedules either a LIMIT or MARKET order to execute when two moving averages cross.',
        '',
        'Both moving averages can be either exponential or smoothed, and can have differing',
        'time frames and candle keys (close, open, etc)'
      ].join('\n')
    ),

    sections: [
      {
        title: '',
        name: 'alias',
        fullWidth: true,
        rows: [['alias']]
      },
      {
        title: '',
        name: 'general',
        rows: [
          ['shortType', 'longType'],
          ['amount', null],
          ['orderType', 'orderPrice']
        ]
      },
      {
        title: t(i18n, 'shortEmaSettings', 'Short EMA Settings'),
        name: 'shortEMASettings',
        fixed: true,
        visible: {
          shortType: { eq: 'EMA' }
        },

        rows: [
          ['shortEMATF', 'shortEMAPeriod'],
          ['shortEMAPrice', null]
        ]
      },
      {
        name: 'shortMASettings',
        title: t(i18n, 'shortMaSettings', 'Short MA Settings'),
        fixed: true,
        visible: {
          shortType: { eq: 'MA' }
        },
        rows: [
          ['shortMATF', 'shortMAPeriod'],
          ['shortMAPrice', null]
        ]
      },
      {
        name: 'longEMASettings',
        title: t(i18n, 'longEmaSettings', 'Long EMA Settings'),
        fixed: true,
        visible: {
          longType: { eq: 'EMA' }
        },
        rows: [
          ['longEMATF', 'longEMAPeriod'],
          ['longEMAPrice', null]
        ]
      },
      {
        title: t(i18n, 'longMaSettings', 'Long MA Settings'),
        name: 'longMASettings',
        fixed: true,
        visible: {
          longType: { eq: 'MA' }
        },

        rows: [
          ['longMATF', 'longMAPeriod'],
          ['longMAPrice', null]
        ]
      },
      {
        title: '',
        name: 'lev',
        fullWidth: true,
        rows: [['lev']],

        visible: {
          _context: { eq: 'f' }
        }
      },
      {
        title: '',
        name: 'actions',
        fullWidth: true,
        rows: [['action']]
      }
    ],

    fields: {
      shortType: {
        component: 'input.dropdown',
        label: t(i18n, 'shortEmaMaType', 'Short EMA/MA Type'),
        default: 'EMA',
        options: {
          EMA: t(i18n, 'ema', 'EMA'),
          MA: t(i18n, 'ma', 'MA')
        }
      },

      longType: {
        component: 'input.dropdown',
        label: t(i18n, 'longEmaMaType', 'Long EMA/MA Type'),
        default: 'EMA',
        options: {
          EMA: t(i18n, 'ema', 'EMA'),
          MA: t(i18n, 'ma', 'MA')
        }
      },

      alias: {
        component: 'input.alias',
        label: t(i18n, 'alias', 'Alias')
      },

      amount: {
        component: 'input.amount',
        label: `${t(i18n, 'amount', 'Amount')} $BASE`,
        customHelp: t(i18n, 'totalOrderAmount', 'Total order amount'),
        priceField: 'limitPrice'
      },

      shortMAPeriod: {
        component: 'input.number',
        label: t(i18n, 'shortMaPeriod', 'Short MA Period'),
        customHelp: t(
          i18n,
          'shortMaPeriodHelp',
          'Period for short moving average'
        ),
        visible: {
          shortType: { eq: 'MA' }
        }
      },

      longMAPeriod: {
        component: 'input.number',
        label: t(i18n, 'longMaPeriod', 'Long MA Period'),
        customHelp: t(
          i18n,
          'longMaPeriodHelp',
          'Period for long moving average'
        ),
        visible: {
          longType: { eq: 'MA' }
        }
      },

      shortEMAPeriod: {
        component: 'input.number',
        label: t(i18n, 'shortEmaPeriod', 'Short EMA Period'),
        customHelp: t(
          i18n,
          'shortEmaPeriodHelp',
          'Period for short exponential moving average'
        ),
        visible: {
          shortType: { eq: 'EMA' }
        }
      },

      longEMAPeriod: {
        component: 'input.number',
        label: t(i18n, 'longEmaPeriod', 'Long EMA Period'),
        customHelp: t(
          i18n,
          'longEmaPeriodHelp',
          'Period for long exponential moving average'
        ),
        visible: {
          longType: { eq: 'EMA' }
        }
      },

      shortMAPrice: {
        component: 'input.dropdown',
        label: t(i18n, 'shortMaCandlePrice', 'Short MA Candle Price'),
        default: 'CLOSE',
        options: {
          OPEN: t(i18n, 'open', 'Open'),
          HIGH: t(i18n, 'high', 'High'),
          LOW: t(i18n, 'low', 'Low'),
          CLOSE: t(i18n, 'close', 'Close')
        },

        visible: {
          shortType: { eq: 'MA' }
        }
      },

      shortEMAPrice: {
        component: 'input.dropdown',
        label: t(i18n, 'shortEmaCandlePrice', 'Short EMA Candle Price'),
        default: 'CLOSE',
        options: {
          OPEN: t(i18n, 'open', 'Open'),
          HIGH: t(i18n, 'high', 'High'),
          LOW: t(i18n, 'low', 'Low'),
          CLOSE: t(i18n, 'close', 'Close')
        },

        visible: {
          shortType: { eq: 'EMA' }
        }
      },

      longMAPrice: {
        component: 'input.dropdown',
        label: t(i18n, 'longMaCandlePrice', 'Long MA Candle Price'),
        default: 'CLOSE',
        options: {
          OPEN: t(i18n, 'open', 'Open'),
          HIGH: t(i18n, 'high', 'High'),
          LOW: t(i18n, 'low', 'Low'),
          CLOSE: t(i18n, 'close', 'Close')
        },

        visible: {
          longType: { eq: 'MA' }
        }
      },

      longEMAPrice: {
        component: 'input.dropdown',
        label: t(i18n, 'longEmaCandlePrice', 'Long EMA Candle Price'),
        default: 'CLOSE',
        options: {
          OPEN: t(i18n, 'open', 'Open'),
          HIGH: t(i18n, 'high', 'High'),
          LOW: t(i18n, 'low', 'Low'),
          CLOSE: t(i18n, 'close', 'Close')
        },

        visible: {
          longType: { eq: 'EMA' }
        }
      },

      shortMATF: {
        component: 'input.dropdown',
        label: t(i18n, 'shortMaTimeFrame', 'Short MA Time Frame'),
        default: timeframes[0],
        options: tfDropdownOptions,

        visible: {
          shortType: { eq: 'MA' }
        }
      },

      longMATF: {
        component: 'input.dropdown',
        label: t(i18n, 'longMaTimeFrame', 'Long MA Time Frame'),
        default: timeframes[0],
        options: tfDropdownOptions,

        visible: {
          longType: { eq: 'MA' }
        }
      },

      shortEMATF: {
        component: 'input.dropdown',
        label: t(i18n, 'shortEmaTimeFrame', 'Short EMA Time Frame'),
        default: timeframes[0],
        options: tfDropdownOptions,

        visible: {
          shortType: { eq: 'EMA' }
        }
      },

      longEMATF: {
        component: 'input.dropdown',
        label: t(i18n, 'longEmaTimeFrame', 'Long EMA Time Frame'),
        default: timeframes[0],
        options: tfDropdownOptions,

        visible: {
          longType: { eq: 'EMA' }
        }
      },

      orderType: {
        component: 'input.dropdown',
        label: t(i18n, 'orderType', 'Order Type'),
        default: 'MARKET',
        options: {
          MARKET: t(i18n, 'market', 'Market'),
          LIMIT: t(i18n, 'limit', 'Limit')
        }
      },

      orderPrice: {
        component: 'input.price',
        label: `${t(i18n, 'orderPrice', 'Order Price')} $QUOTE`,

        disabled: {
          orderType: { eq: 'MARKET' }
        }
      },

      lev: {
        component: 'input.range',
        label: t(i18n, 'leverage', 'Leverage'),
        min: 1,
        max: 100,
        default: 10
      },

      // Action section
      action: {
        component: 'input.radio',
        label: t(i18n, 'action', 'Action'),
        options: [t(i18n, 'buy', 'Buy'), t(i18n, 'sell', 'Sell')],
        inline: true,
        default: t(i18n, 'buy', 'Buy')
      }
    },

    actions: ['preview', 'submit']
  }
}

module.exports = getUIDef
