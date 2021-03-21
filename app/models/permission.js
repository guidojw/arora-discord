'use strict'
module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
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
    tableName: 'permissions'
  })

  Permission.associate = models => {
    Permission.belongsTo(models.Role, {
      foreignKey: 'roleId',
      onDelete: 'CASCADE'
    })
    Permission.belongsTo(models.Group, {
      foreignKey: 'groupId',
      onDelete: 'CASCADE'
    })
    Permission.belongsTo(models.Command, {
      foreignKey: {
        name: 'commandId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
  }

  return Permission
}
