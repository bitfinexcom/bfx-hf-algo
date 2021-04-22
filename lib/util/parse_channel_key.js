const separator = ':'

module.exports = (chanKey) => {
  const [key, tf, ...symbol] = chanKey.split(separator)
  return {
    key,
    tf,
    symbol: symbol.join(separator)
  }
}