'use strict'
class PermissionError extends Error {
    constructor(...args) {
        super(...args)
    }
}

module.exports = PermissionError
