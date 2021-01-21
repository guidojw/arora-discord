'use strict'
module.exports = (sequelize, DataTypes) => {
  const PermissionOverwrite = sequelize.define('PermissionOverwrite', {
    allow: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    indexes: [{
      unique: true,
      fields: ['permission_name', 'role_id']
    }, {
      unique: true,
      fields: ['permission_name', 'group_id']
    }],
    validate: {
      roleXorGroup () {
        if ((this.role === null) === (this.group === null)) {
          throw new Error('Only one of roleId and groupId can be set.')
        }
      }
    },
    tableName: 'permission_overwrites'
  })

  PermissionOverwrite.associate = models => {
    PermissionOverwrite.belongsTo(models.Permission, {
      foreignKey: {
        name: 'permissionName',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
    PermissionOverwrite.belongsTo(models.Role, {
      foreignKey: 'roleId',
      onDelete: 'CASCADE'
    })
    PermissionOverwrite.belongsTo(models.Group, {
      foreignKey: 'groupId',
      onDelete: 'CASCADE'
    })
  }

  return PermissionOverwrite
}
