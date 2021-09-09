'use strict'

function t (options, key, original, props) {
  if (!options) return original

  const fullKey = [options.prefix, key].join('')

  return options.t(fullKey, props) || original
}

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
