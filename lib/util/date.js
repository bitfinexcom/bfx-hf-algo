const getDateInShortFormat = (date) => {
  if (!date) {
    return null
  }
  return new Date(date).toLocaleString({
    day: '2-digit',
    month: '2-digit'
  })
}

module.exports = {
  getDateInShortFormat
}
