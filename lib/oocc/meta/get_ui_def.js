/**
 * Returns the UI layout definition for OOCC, with a field for each parameter.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:OOCC
 * @param {object} data - required data
 * @param {string[]} data.timeframes - array of timeframes to show in dropdowns
 * @returns {AOUIDefinition} uiDef
 */
const getUIDef = ({ timeframes }) => {
  const tfDropdownOptions = {}

  timeframes.forEach(tf => {
    tfDropdownOptions[tf] = tf
  })

  return {
    label: 'Order on Candle Close',
    id: 'bfx-oocc',

    uiIcon: 'ma-crossover-active',
    connectionTimeout: 10000,
    actionTimeout: 10000,

    customHelp: [
      'Creates an order on the next candle close. The submit delay can be used',
      'to schedule the order anytime after the close.'
    ],

    header: {
      component: 'ui.checkbox_group',
      fields: ['hidden', 'postonly', 'tif', 'forceTrade']
    },

    sections: [{
      title: '',
      name: 'candleSettings',
      rows: [
        ['candleTF', null],
        ['orderType', 'orderPrice'],
        ['amount', 'action']
      ]
    }, {
      title: '',
      name: 'stopLimitSettings',
      fixed: true,
      rows: [
        ['stopPriceStopLimit']
      ],

      visible: {
        orderType: { eq: 'STOP_LIMIT' }
      }
    }, {
      title: '',
      name: 'ocoSettings',
      fixed: true,
      rows: [
        ['stopPriceOCO']
      ],

      visible: {
        orderType: { neq: 'STOP_LIMIT' },
        oco: { eq: true }
      }
    }, {
      title: '',
      name: 'trailingStopSettings',
      fixed: true,
      rows: [
        ['distance']
      ],

      visible: {
        orderType: { eq: 'TRAILING_STOP' }
      }
    }, {
      title: '',
      name: 'tif',
      fixed: true,
      rows: [
        ['tifDate']
      ],

      visible: {
        tif: { eq: true }
      }
    }, {
      title: '',
      name: 'submitSettings',
      fixed: true,

      rows: [
        ['submitDelaySec']
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
      candleTF: {
        component: 'input.dropdown',
        label: 'Candle Time Frame',
        default: timeframes[0],
        options: tfDropdownOptions
      },

      submitDelaySec: {
        component: 'input.number',
        label: 'Submit Delay (sec)',
        customHelp: 'Seconds to wait before submitting orders',
        default: 1
      },

      orderType: {
        component: 'input.dropdown',
        label: 'Order Type',
        default: 'LIMIT',
        options: {
          LIMIT: 'Limit',
          MARKET: 'Market',
          STOP: 'Stop',
          STOP_LIMIT: 'Stop-Limit',
          TRAILING_STOP: 'Trailing-Stop',
          IOC: 'Immediate or Cancel',
          FOK: 'Fill or Kill'
        }
      },

      distance: {
        component: 'input.price',
        label: 'Distance $BASE',
        customHelp: 'Trailing Stop Distance'
      },

      amount: {
        component: 'input.amount',
        label: 'Amount $BASE',
        customHelp: 'Initial Order amount',
        priceField: 'orderPrice'
      },

      orderPrice: {
        component: 'input.price',
        label: 'Order Price $QUOTE',

        disabled: {
          orderType: { eq: 'MARKET' }
        }
      },

      stopPriceStopLimit: {
        component: 'input.price',
        label: 'Stop Price $QUOTE'
      },

      stopPriceOCO: {
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

      forceTrade: {
        component: 'input.checkbox',
        label: 'FORCE TRADE',
        default: true,
        customHelp: 'Force order creation even if no candle is generated for the selected interval'
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

      tif: {
        component: 'input.checkbox',
        label: 'TIF',
        default: false
      },

      tifDate: {
        component: 'input.date',
        label: 'TIF Date'
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

module.exports = getUIDef
