'use strict'

const lodash = require('lodash')

const { WSEvents } = require('../../../util/constants')

const handlers = {}

for (const name of Object.values(WSEvents)) {
  try {
    handlers[name] = require(`./${lodash.kebabCase(name)}`)
  } catch {} // eslint-disable-line no-empty
}

module.exports = handlers
