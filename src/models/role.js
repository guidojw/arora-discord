'use strict'

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {})

  Role.loadScopes = models => {
    Role.addScope('defaultScope', {
      include: [{
        model: models.Permission,
        as: 'permissions'
      }]
    })
  }

  return Role
}
