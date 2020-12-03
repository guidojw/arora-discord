'use strict'
module.exports = (sequelize, DataTypes) => {
  const RoleRoleGroup = sequelize.define('RoleRoleGroup', {
    roleId: {
      type: DataTypes.STRING,
      primaryKey: true,
      field: 'role_id'
    }
  }, {
    tableName: 'roles_role_groups'
  })

  RoleRoleGroup.associate = models => {
    RoleRoleGroup.belongsTo(models.RoleGroup, {
      foreignKey: {
        name: 'roleGroupId',
        primaryKey: true
      },
      onDelete: 'CASCADE'
    })
  }

  return RoleRoleGroup
}
