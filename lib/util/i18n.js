'use strict'

/**
 * @typedef {object} I18NOptions
 * @property {function} t
 * @property {string=} prefix
 */

/**
 * Replaces `original` with a translation if options is provided
 *
 * @param {I18NOptions} options
 * @param {string} key
 * @param {string} original
 * @param {object=} props
 * @return {string}
 */
function t (options, key, original, props) {
  if (!options) return original

  const fullKey = [options.prefix, key].join('')

  return options.t(fullKey, props) || original
}

/**
 * Mix i18n property into object
 *
 * @param {object} object
 * @param {string} i18nKey
 * @param {object=} i18nProps
 * @return {object}
 */
function apply (object, i18nKey, i18nProps) {
  return {
    ...object,
    i18n: i18nKey && {
      key: i18nKey,
      props: i18nProps
    }
  }
}

module.exports = {
  t,
  apply
}
