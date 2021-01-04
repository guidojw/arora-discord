'use strict'
module.exports = (sequelize, DataTypes) => {
  const RoleBinding = sequelize.define('RoleBinding', {
    roleId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'role_id'
    },
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
  }

  return RoleBinding
}
