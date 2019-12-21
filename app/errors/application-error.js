'use strict'
class ApplicationError extends Error {
    constructor(...args) {
        super(...args)
    }
}

module.exports = ApplicationError
