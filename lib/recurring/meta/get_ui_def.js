'use strict'
const { t } = require('../../util/i18n')

/**
 * Returns the UI layout definition for Recurring, with a field for each
 * parameter.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:Recurring
 * @returns {AOUIDefinition} uiDef
 */
const getUIDef = ({ i18n } = {}) => ({
  label: t(i18n, 'recurring.title', 'Recurring'),
  id: 'bfx-recurring',

  uiIcon: 'infinity',
  customHelp: t(i18n, 'recurring.help'),

  connectionTimeout: 10000,
  actionTimeout: 10000,

  hideContexts: true,

  sections: [
    {
      title: '',
      name: 'action',
      fullWidth: true,
      rows: [['action']]
    },
    {
      title: '',
      name: 'alias',
      fullWidth: true,
      rows: [['alias']]
    },
    {
      title: '',
      name: 'general',
      rows: [['amount', 'currency']]
    },
    {
      title: '',
      name: 'startedAt',
      fullWidth: true,
      rows: [['startedAt']]
    },
    {
      title: '',
      name: 'recurrence options',
      rows: [['recurrence', 'endless']]
    },
    {
      title: '',
      name: 'endedAt',
      fullWidth: true,
      rows: [['endedAt']]
    },
    {
      title: '',
      name: 'summary',
      fullWidth: true,
      rows: [['summary']]
    }
  ],

  fields: {
    alias: {
      component: 'input.alias',
      label: t(i18n, 'alias', 'Alias'),
      avoidTrimming: true
    },

    amount: {
      component: 'recurring_amount',
      label: t(i18n, 'amount', 'Amount'),
      fieldName: 'amount'
    },

    recurrence: {
      component: 'input.dropdown',
      label: t(i18n, 'recurring.recurrence', 'Recurrence'),
      default: 'weekly',
      options: {
        daily: t(i18n, 'recurring.daily', 'Daily'),
        weekly: t(i18n, 'recurring.weekly', 'Weekly'),
        monthly: t(i18n, 'recurring.monthly', 'Monthly')
      }
    },

    startedAt: {
      component: 'input.date',
      label: t(i18n, 'recurring.startDateTime', 'Start Date and Time'),
      customHelp: t(
        i18n,
        'recurring.startDateTimeHelp',
        'If none is provided the first market order will launch immediately'
      ),
      minDate: new Date(),
      default: null
    },

    endedAt: {
      component: 'recurring_endDate',
      label: t(i18n, 'recurring.lastOrderDate', 'Last Order Date'),
      minDate: null,
      disabled: {
        endless: { eq: true }
      }
    },

    endless: {
      component: 'input.checkbox',
      label: t(i18n, 'recurring.endless', 'Endless'),
      customHelp: t(
        i18n,
        'recurring.endlessHelp',
        [
          'This order generates a directional (BUY/SELL) market order repeatedly',
          '(for the current selected trading pair), at regular intervals,',
          'based on a schedule defined by you, for example,',
          'as a risk management strategy to achieve a long-term market average price.',
          'Since this order type is directed at long periods of time,',
          'the schedule intervals provided are also long.',
          '\n\nUnlike other Algorithmic Orders currently on the app,',
          'this order does not stop when the application closes.',
          'Selecting the “endless” option will keep the order running forever until it is manually closed.',
          'You can skip this behaviour by unchecking the “endless” option and setting a “Last Order Date”'
        ].join(' ')
      ),
      default: true,
      customClassName: 'vertical-align'
    },

    action: {
      component: 'ui.tabs',
      label: t(i18n, 'action', 'Action'),
      options: [
        {
          label: t(i18n, 'buy', 'Buy'),
          value: 'buy'
        },
        {
          label: t(i18n, 'sell', 'Sell'),
          value: 'sell'
        }
      ],
      inline: true,
      default: 'buy'
    },

    currency: {
      component: 'input.radio',
      customClassName: 'vertical-align',
      options: [
        {
          label: '$BASE',
          value: '$BASE'
        },
        {
          label: '$QUOTE',
          value: '$QUOTE'
        }
      ],
      inline: true,
      default: '$BASE'
    },

    summary: {
      component: 'recurring_summary'
    }
  },

  actions: ['preview', 'submit']
})

module.exports = getUIDef
