'use strict'
exports.split = (array, length) => {
  return array.reduce((result, item, index) => {
    const chunk = Math.floor(index / length)
    if (!result[chunk]) {
      result[chunk] = []
    }
    result[chunk].push(item)
    return result
  }, [])
}
