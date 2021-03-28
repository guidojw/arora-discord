'use strict'

module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    allow: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCreate: (permission, { guildId }) => {
        if (permission.roleId) {
          return sequelize.models.Role.findOrCreate({
            where: {
              id: permission.roleId,
              guildId
            }
          })
        }
      }
    },
    tableName: 'permissions'
  })

  Permission.associate = models => {
    Permission.belongsTo(models.Role, {
      foreignKey: {
        name: 'roleId',
        validate: { roleXorGroup }
      },
      onDelete: 'CASCADE'
    })
    Permission.belongsTo(models.Group, {
      foreignKey: {
        name: 'groupId',
        validate: { roleXorGroup }
      },
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

function roleXorGroup () {
  if ((this.roleId === null) === (this.groupId === null)) {
    throw new Error('Only one of roleId and groupId can be set.')
  }
}
