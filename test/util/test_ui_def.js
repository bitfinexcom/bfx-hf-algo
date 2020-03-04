/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _isObject = require('lodash/isObject')
const _isString = require('lodash/isString')
const _isArray = require('lodash/isArray')
const _isEmpty = require('lodash/isEmpty')
const _isFinite = require('lodash/isFinite')
const _isBoolean = require('lodash/isBoolean')

const VALID_ACTIONS = ['buy', 'sell', 'preview', 'submit']
const VALID_FIELDS = [
  'input.amount',
  'input.checkbox',
  'input.date',
  'input.dropdown',
  'input.number',
  'input.percent',
  'input.price',
  'input.radio',
  'input.range',
  'ui.checkbox_group'
]

/**
  * Utility to test generated UI defs and ensure they match the BFX structure.
  * Verifies internal structure.
  *
  *
  * @param {Object} ui - def
  */
module.exports = (ui) => {
  assert.ok(_isObject(ui), 'ui def not an object')
  assert.ok(_isString(ui.label) && !_isEmpty(ui.label), 'ui def has no label')
  assert.ok(_isString(ui.id) && !_isEmpty(ui.id), 'ui def has no id')
  assert.ok(_isString(ui.uiIcon) && !_isEmpty(ui.uiIcon), 'ui def has no icon')
  assert.ok(_isString(ui.customHelp) && !_isEmpty(ui.customHelp), 'ui def has no help text')
  assert.ok(_isFinite(ui.connectionTimeout), 'ui def has no connection timeout')
  assert.ok(_isFinite(ui.actionTimeout), 'ui def has no action timeout')
  assert.ok(_isArray(ui.sections) && !_isEmpty(ui.sections), 'ui def has no sections')
  assert.ok(_isObject(ui.fields) && !_isEmpty(ui.fields), 'ui def has no fields')
  assert.ok(_isArray(ui.actions) && !_isEmpty(ui.actions), 'ui def has no actions')

  ui.sections.forEach((section) => {
    assert.ok(_isObject(section), 'section not an object')

    const { title, name, rows, fullWidth } = section

    assert.ok(!title || _isString(title), 'section has malformed title') // optional
    assert.ok(_isString(name) && !_isEmpty(name), 'section missing name')
    assert.ok(_isArray(rows) && !_isEmpty(rows), 'section has no rows')
    assert.ok(typeof fullWidth === 'undefined' || _isBoolean(fullWidth), 'section has invalid fullWidth flag')

    rows.forEach(row => {
      assert.ok(_isArray(row), 'ui section has malformed row')

      row.forEach((fieldName) => { // fields can be null, rendered as empty space
        assert.ok(fieldName === null || _isObject(ui.fields[fieldName]), `ui section has unknown field: ${fieldName}`)
      })
    })
  })

  if (ui.header) {
    assert.ok(_isObject(ui.header), 'ui def has malformed header')

    const { component, fields } = ui.header
    assert.ok(VALID_FIELDS.indexOf(component) !== -1, `ui header field uses unknown component: ${component}`)

    fields.forEach((fieldName) => {
      assert.ok(fieldName === null || _isObject(ui.fields[fieldName]), `ui header has unknown field: ${fieldName}`)
    })
  }

  // TODO: Verify per-component props, overkill for now
  Object.values(ui.fields).forEach((field) => {
    const { component } = field
    assert.ok(VALID_FIELDS.indexOf(component) !== -1, `ui field uses unknown component: ${component}`)
  })

  ui.actions.forEach(a => {
    assert.ok(VALID_ACTIONS.indexOf(a) !== -1, 'ui action is not valid')
  })
}
