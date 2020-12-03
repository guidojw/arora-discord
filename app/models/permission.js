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
    Permission.belongsToMany(models.RoleGroup, {
      through: models.RoleGroupPermission,
      sourceKey: 'name',
      targetKey: 'id'

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
