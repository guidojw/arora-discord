'use strict'
module.exports = (sequelize, DataTypes) => {
  const RoleBinding = sequelize.define('RoleBinding', {
    robloxGroupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'roblox_group_id'
    },
    min: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    max: DataTypes.INTEGER
  }, {
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

  RoleBinding.associate = models => {
    RoleBinding.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
    RoleBinding.belongsTo(models.Role, {
      foreignKey: {
        name: 'roleId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
  }

  return RoleBinding
}
