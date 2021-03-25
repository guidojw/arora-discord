'use strict'
const { Role } = require('../../models')

const roleDeleteHandler = (_client, role) => {
  Role.destroy({ where: { id: role.id } })
}

module.exports = roleDeleteHandler
