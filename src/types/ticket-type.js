'use strict'

const BaseArgumentType = require('./base')

const { TicketType } = require('../structures')

class TicketTypeArgumentType extends BaseArgumentType {
  constructor (client) {
    super(client, TicketType)
  }
}

module.exports = TicketTypeArgumentType
