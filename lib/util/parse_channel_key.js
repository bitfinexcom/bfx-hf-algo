'use strict'

const separator = ':'

module.exports = (chanKey) => {
  const parts = chanKey.split(separator)
  let type, tf, symbol, aggr, start, end, s1, s2

  switch (parts.length) {
    case 3:
      [type, tf, symbol] = parts
      return { type, tf, symbol }
    case 4:
      [type, tf, ...symbol] = parts
      return { type, tf, symbol: symbol.join(separator) }
    case 6:
      [type, tf, symbol, aggr, start, end] = parts
      return { type, tf, symbol, aggr, start, end }
    case 7:
      [type, tf, s1, s2, aggr, start, end] = parts
      return { type, tf, symbol: s1 + separator + s2, aggr, start, end }
  }
}
