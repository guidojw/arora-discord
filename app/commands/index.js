'use strict'
const fs = require('fs')
const path = require('path')
const basename = path.basename(__filename)
const commands = {}

fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
    })
    .forEach(file => {
        const controller = require(path.join(__dirname, file))
        commands[file.slice(0, -3)] = controller
    })

module.exports = commands
