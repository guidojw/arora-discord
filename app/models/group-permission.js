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

  GroupPermission.associate = models => {
    GroupPermission.belongsTo(models.Permission, {
      foreignKey: {
        name: 'permissionName',
        primaryKey: true
      },
      onDelete: 'CASCADE'
    })
    GroupPermission.belongsTo(models.Group, {
      foreignKey: {
        name: 'groupId',
        primaryKey: true
      },
      onDelete: 'CASCADE'
    })
  }

  return GroupPermission
}
