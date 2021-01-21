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
    Permission.belongsToMany(models.Group, {
      through: 'groups_permissions',
      sourceKey: 'name',
      targetKey: 'id'
    })
    Permission.belongsToMany(models.Role, {
      through: 'roles_permissions',
      sourceKey: 'name',
      targetKey: 'id'
    })
    Permission.hasMany(models.PermissionOverwrite, {
      foreignKey: {
        name: 'permissionName',
        allowNull: false
      }
    })
  }

  return Permission
}
