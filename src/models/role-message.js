'use strict'

module.exports = (sequelize, DataTypes) => {
  RoleMessage.loadScopes = models => {
    RoleMessage.addScope('defaultScope', {
      include: [{
        model: models.Message,
        as: 'message'
      }]
    })
  }

  return RoleMessage
}
