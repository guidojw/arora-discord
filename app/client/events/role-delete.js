'use strict'
const BaseEvent = require('./base')

const { Role } = require('../../models')

class RoleDeleteEvent extends BaseEvent {
  handle (role) {
    return Role.destroy({ where: { id: role.id } })
  }
}

module.exports = RoleDeleteEvent
