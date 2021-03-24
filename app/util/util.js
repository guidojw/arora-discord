'use strict'
function getAbbreviation (val) {
  return val
    .trim()
    .split(/ +/)
    .map(word => word.charAt(0))
    .join('')
}

function split (array, length) {
  return array.reduce((result, item, index) => {
    const chunk = Math.floor(index / length)
    if (!result[chunk]) {
      result[chunk] = []
    }
    result[chunk].push(item)
    return result
  }, [])
}

module.exports = {
  getAbbreviation,
  split
}
