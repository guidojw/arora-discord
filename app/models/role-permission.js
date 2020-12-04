'use strict'
module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define('RolePermission', {
    roleId: {
      type: DataTypes.STRING,
      primaryKey: true,
      field: 'role_id'
    },
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['allow', 'deny'],
      defaultValue: 'allow'
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
