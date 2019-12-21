'use strict'
exports.getRandomInt = (max, last) => {
    const newNumber = Math.floor(Math.random() * Math.floor(max))
    if (max === 1 || !last || newNumber !== last) {
        return newNumber
    } else {
        return exports.getRandomInt(max, last)
    }
}
