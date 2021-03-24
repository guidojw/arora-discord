'use strict'
function getAbbreviation (val) {
  return val
    .trim()
    .split(/ +/)
    .map(word => word.charAt(0))
    .join('')
}

module.exports = {
  getAbbreviation
}
