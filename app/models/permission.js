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
      through: models.GroupPermission,
      sourceKey: 'name',
      targetKey: 'id'
    })
    Permission.belongsToMany(models.Role, {
      through: models.RolePermission,
      sourceKey: 'name',
      targetKey: 'id'
    })
  }

  return Permission
}
