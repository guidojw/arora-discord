'use strict'
const { Role } = require('../../models')

const roleDeleteHandler = (_client, role) => {
  return Role.destroy({ where: { id: role.id } })
}

module.exports = roleDeleteHandler
