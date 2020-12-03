'use strict'
module.exports = (sequelize, DataTypes) => {
  const RoleGroup = sequelize.define('RoleGroup', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'role_groups'
  })

  RoleGroup.associate = models => {
    RoleGroup.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
    RoleGroup.hasMany(models.RoleRoleGroup, {
      foreignKey: {
        name: 'roleGroupId',
        primaryKey: true
      }
    })
  }

  return RoleGroup
}
