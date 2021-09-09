'use strict'

function t (options, key, original, props) {
  return options ? (options.t(key, props) || original) : original
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
