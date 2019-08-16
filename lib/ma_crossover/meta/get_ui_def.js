module.exports = ({ timeframes }) => {
  const tfDropdownOptions = {}

  timeframes.forEach(tf=> tfDropdownOptions[tf] = tf)

  return {
    label: 'MA Crossover',
    id: 'bfx-ma_crossover',

    connectionTimeout: 10000,
    actionTimeout: 10000,

    sections: [{
      title: '',
      name: 'general',
      rows: [
        ['shortType', 'longType'],
        ['amount', null],
        ['orderType', 'orderPrice'],
      ]
    }, {
      title: 'Short EMA Settings',
      name: 'shortEMASettings',
      fixed: true,
      visible: {
        shortType: { eq: 'EMA' }
      },

      rows: [
        ['shortEMATF', 'shortEMAPeriod'],
        ['shortEMAPrice', null],
      ]
    }, {
      name: 'shortMASettings',
      title: 'Short MA Settings',
      fixed: true,
      visible: {
        shortType: { eq: 'MA' },
      },
      rows: [
        ['shortMATF', 'shortMAPeriod'],
        ['shortMAPrice', null],
      ]
    }, {
      name: 'longEMASettings',
      title: 'Long EMA Settings',
      fixed: true,
      visible: {
        longType: { eq: 'EMA' },
      },
      rows: [
        ['longEMATF', 'longEMAPeriod'],
        ['longEMAPrice', null],
      ]
    }, {
      title: 'Long MA Settings',
      name: 'longMASettings',
      fixed: true,
      visible: {
        longType: { eq: 'MA' }
      },

      rows: [
        ['longMATF', 'longMAPeriod'],
        ['longMAPrice', null],
      ]
    }, {
      name: 'actions',
      rows: [
        ['submitDelay', 'cancelDelay'],
        ['action', null]
      ]
    }],

    fields: {
      shortType: {
        component: 'input.dropdown',
        label: 'Short EMA/MA Type',
        default: 'EMA',
        options: {
          EMA: 'EMA',
          MA: 'MA',
        }
      },

      longType: {
        component: 'input.dropdown',
        label: 'Long EMA/MA Type',
        default: 'EMA',
        options: {
          EMA: 'EMA',
          MA: 'MA',
        }
      },

      amount: {
        component: 'input.amount',
        label: 'Amount $BASE',
        customHelp: 'Total order amount',
        priceField: 'limitPrice'
      },

      shortMAPeriod: {
        component: 'input.number',
        label: 'Short MA Period',
        customHelp: 'Period for short moving average',
        visible: {
          shortType: { eq: 'MA' }
        }
      },

      longMAPeriod: {
        component: 'input.number',
        label: 'Long MA Period',
        customHelp: 'Period for long moving average',
        visible: {
          longType: { eq: 'MA' }
        }
      },

      shortEMAPeriod: {
        component: 'input.number',
        label: 'Short EMA Period',
        customHelp: 'Period for short exponential moving average',
        visible: {
          shortType: { eq: 'EMA' }
        }
      },

      longEMAPeriod: {
        component: 'input.number',
        label: 'Long EMA Period',
        customHelp: 'Period for long exponential moving average',
        visible: {
          longType: { eq: 'EMA' }
        }
      },

      shortMAPrice: {
        component: 'input.dropdown',
        label: 'Short MA Candle Price',
        default: 'CLOSE',
        options: {
          OPEN: 'Open',
          HIGH: 'High',
          LOW: 'Low',
          CLOSE: 'Close'
        },

        visible: {
          shortType: { eq: 'MA' }
        }
      },

      shortEMAPrice: {
        component: 'input.dropdown',
        label: 'Short EMA Candle Price',
        default: 'CLOSE',
        options: {
          OPEN: 'Open',
          HIGH: 'High',
          LOW: 'Low',
          CLOSE: 'Close'
        },

        visible: {
          shortType: { eq: 'EMA' }
        }
      },

      longMAPrice: {
        component: 'input.dropdown',
        label: 'Long MA Candle Price',
        default: 'CLOSE',
        options: {
          OPEN: 'Open',
          HIGH: 'High',
          LOW: 'Low',
          CLOSE: 'Close'
        },

        visible: {
          longType: { eq: 'MA' }
        }
      },

      longEMAPrice: {
        component: 'input.dropdown',
        label: 'Long EMA Candle Price',
        default: 'CLOSE',
        options: {
          OPEN: 'Open',
          HIGH: 'High',
          LOW: 'Low',
          CLOSE: 'Close'
        },

        visible: {
          longType: { eq: 'EMA' }
        }
      },

      shortMATF: {
        component: 'input.dropdown',
        label: 'Short MA Time Frame',
        default: timeframes[0],
        options: tfDropdownOptions,

        visible: {
          shortType: { eq: 'MA' }
        }
      },

      longMATF: {
        component: 'input.dropdown',
        label: 'Long MA Time Frame',
        default: timeframes[0],
        options: tfDropdownOptions,

        visible: {
          longType: { eq: 'MA' }
        }
      },

      shortEMATF: {
        component: 'input.dropdown',
        label: 'Short EMA Time Frame',
        default: timeframes[0],
        options: tfDropdownOptions,

        visible: {
          shortType: { eq: 'EMA' }
        }
      },

      longEMATF: {
        component: 'input.dropdown',
        label: 'Long EMA Time Frame',
        default: timeframes[0],
        options: tfDropdownOptions,

        visible: {
          longType: { eq: 'EMA' }
        }
      },

      orderType: {
        component: 'input.dropdown',
        label: 'Order Type',
        default: 'MARKET',
        options: {
          MARKET: 'Market',
          LIMIT: 'Limit',
        },
      },

      orderPrice: {
        component: 'input.price',
        label: 'Order Price $QUOTE',

        disabled: {
          orderType: { eq: 'MARKET' },
        },
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
  }
}
