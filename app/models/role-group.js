'use strict'
module.exports = (sequelize, DataTypes) => {
  const RoleGroup = sequelize.define('RoleGroup', {
    roleId: {
      type: DataTypes.STRING,
      primaryKey: true,
      field: 'role_id'
    }
  }, {
    tableName: 'roles_groups'
  })

  RoleGroup.associate = models => {
    RoleGroup.belongsTo(models.Group, {
      foreignKey: {
        name: 'groupId',
        primaryKey: true
      },
      onDelete: 'CASCADE'
    })
  }

  return RoleGroup
}
