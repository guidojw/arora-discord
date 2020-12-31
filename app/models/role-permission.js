'use strict'
module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define('RolePermission', {
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['allow', 'deny'],
      defaultValue: 'allow'
    }
  }, {
    tableName: 'roles_permissions'
  })

  return RolePermission
}
