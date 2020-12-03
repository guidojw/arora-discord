'use strict'
module.exports = (sequelize, DataTypes) => {
  const RoleGroupPermission = sequelize.define('RoleGroupPermission', {
    permitted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'role_groups_permissions'
  })

  RoleGroupPermission.associate = models => {
    RoleGroupPermission.belongsToMany(models.Permission, {
      foreignKey: {
        name: 'permissionName',
        primaryKey: true
      },
      onDelete: 'CASCADE'
    })
    RoleGroupPermission.belongsTo(models.RoleGroup, {
      foreignKey: {
        name: 'roleGroupId',
        primaryKey: true
      },
      onDelete: 'CASCADE'
    })
  }

  return RoleGroupPermission
}
