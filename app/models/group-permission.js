'use strict'
module.exports = (sequelize, DataTypes) => {
  const GroupPermission = sequelize.define('GroupPermission', {
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['allow', 'deny'],
      defaultValue: 'allow'
    }
  }, {
    tableName: 'groups_permissions'
  })

  return GroupPermission
}
