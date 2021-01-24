'use strict'
const fs = require('fs')
const lodash = require('lodash')

const handlers = {}

const eventFiles = fs.readdirSync('./').filter(file => file !== 'index.js')

for (const file of eventFiles) {
  const eventName = lodash.camelCase(file.slice(0, -3))
  handlers[eventName] = require(`./${file}`)
}

module.exports = handlers
