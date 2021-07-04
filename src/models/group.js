'use strict'

module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group', {})

  Group.loadScopes = models => {
    Group.addScope('defaultScope', {
      include: [{
        model: models.Channel,
        as: 'channels',
        attributes: ['id']
      }, {
        model: models.Role,
        as: 'roles',
        attributes: ['id']
      }, {
        model: models.Permission,
        as: 'permissions'
      }]
    })
  }

  return Group
}
