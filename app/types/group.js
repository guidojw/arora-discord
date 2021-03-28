'use strict'

const BaseArgumentType = require('./base')

const { Group } = require('../structures')

class GroupArgumentType extends BaseArgumentType {
  constructor (client) {
    super(client, Group)
  }
}

module.exports = GroupArgumentType
