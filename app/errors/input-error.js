'use strict'
class InputError extends Error {
    constructor(...args) {
        super(...args)
    }
}

module.exports = InputError
