'use strict'
module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    name: {
      type: DataTypes.STRING,
      primaryKey: true
    }
  }, {
    tableName: 'permissions'
  })

  Permission.associate = models => {
    Permission.hasMany(models.GroupPermission, {
      foreignKey: {
        name: 'permissionName',
        primaryKey: true
      }
    })
    Permission.hasMany(models.RolePermission, {
      foreignKey: {
        name: 'permissionName',
        primaryKey: true
      }
    })
  }

  return Permission
}
