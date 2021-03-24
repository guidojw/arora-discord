'use strict'
const BaseArgumentType = require('./base')

const { Group } = require('../structures')

class GroupArgumentType extends BaseArgumentType {
  constructor (client) {
    super(client, Group, 'groups')
  }
}

module.exports = GroupArgumentType
