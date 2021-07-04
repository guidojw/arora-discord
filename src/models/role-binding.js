'use strict'

module.exports = (sequelize, DataTypes) => {
  const RoleBinding = sequelize.define('RoleBinding', {}, {
    hooks: {
      beforeCreate: roleBinding => {
        return sequelize.models.Role.findOrCreate({
          where: {
            id: roleBinding.roleId,
            guildId: roleBinding.guildId
          }
        })
      }
    },
    tableName: 'role_bindings'
  })

  return RoleBinding
}
