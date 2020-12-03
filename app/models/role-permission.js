'use strict'
module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define('RolePermission', {
    roleId: {
      type: DataTypes.STRING,
      primaryKey: true,
      field: 'role_id'
    },
    permitted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'roles_permissions'
  })

  RolePermission.associate = models => {
    RolePermission.belongsTo(models.Permission, {
      foreignKey: {
        name: 'permissionName',
        primaryKey: true
      },
      onDelete: 'CASCADE'
    })
  }

  return RolePermission
}
