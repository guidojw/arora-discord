'use strict'
module.exports = (sequelize, DataTypes) => {
  const PermissionOverwrite = sequelize.define('PermissionOverwrite', {
    allow: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    validate: {
      roleXorGroup () {
        if ((this.roleId === null) === (this.groupId === null)) {
          throw new Error('Only one of roleId and groupId can be set.')
        }
      }
    },
    tableName: 'permission_overwrites'
  })

  PermissionOverwrite.associate = models => {
    PermissionOverwrite.belongsTo(models.Role, {
      foreignKey: 'roleId',
      onDelete: 'CASCADE'
    })
    PermissionOverwrite.belongsTo(models.Group, {
      foreignKey: 'groupId',
      onDelete: 'CASCADE'
    })
    PermissionOverwrite.belongsTo(models.Command, {
      foreignKey: {
        name: 'commandId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
  }

  return PermissionOverwrite
}
