'use strict'

module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define('Member', {})

  Member.loadScopes = models => {
    Member.addScope('withRoles', {
      include: [{
        model: models.Role,
        as: 'roles'
      }]
    })
  }

  return Member
}
