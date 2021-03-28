'use strict'

const BaseArgumentType = require('./base')

const { RoleGroup } = require('../structures')

class RoleGroupArgumentType extends BaseArgumentType {
  constructor (client) {
    super(client, RoleGroup, 'groups')
  }
}

module.exports = RoleGroupArgumentType
