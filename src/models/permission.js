'use strict'

module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {}, {
    hooks: {
      beforeCreate: (permission, { guildId }) => {
        if (permission.roleId) {
          return sequelize.models.Role.findOrCreate({
            where: {
              id: permission.roleId,
              guildId
            }
          })
        }
      }
    },
    tableName: 'permissions'
  })

  return Permission
}

function roleXorGroup () {
  if ((this.roleId === null) === (this.groupId === null)) {
    throw new Error('Only one of roleId and groupId can be set.')
  }
}
