'use strict'
module.exports = (sequelize, DataTypes) => {
  const GroupPermission = sequelize.define('GroupPermission', {
    permitted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'role_groups_permissions'
  })

  GroupPermission.associate = models => {
    GroupPermission.belongsTo(models.Permission, {
      foreignKey: {
        name: 'permissionName',
        primaryKey: true
      },
      onDelete: 'CASCADE'
    })
    GroupPermission.belongsTo(models.RoleGroup, {
      foreignKey: {
        name: 'roleGroupId',
        primaryKey: true
      },
      onDelete: 'CASCADE'
    })
  }

  return GroupPermission
}
