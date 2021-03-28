'use strict'

function getAbbreviation (val) {
  return val
    .trim()
    .split(/ +/)
    .map(word => word.charAt(0))
    .join('')
}

function getOrdinalNum (number) {
  let selector
  if (number < 0) {
    selector = 4
  } else if ((number > 3 && number < 21) || number % 10 > 3) {
    selector = 0
  } else {
    selector = number % 10
  }
  return number + ['th', 'st', 'nd', 'rd', ''][selector]
}

function makeCommaSeparatedString (array) {
  if (array.length === 1) {
    return array[0]
  }
  const firsts = array.slice(0, array.length - 1)
  const last = array[array.length - 1]
  return `${firsts.join(', ')} & ${last}`
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
  getOrdinalNum,
  makeCommaSeparatedString,
  split
}
