'use strict'
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true
    }
  }, {
    tableName: 'roles'
  })

  Role.associate = models => {
    Role.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
    Role.belongsToMany(models.Group, {
      through: 'roles_groups',
      sourceKey: 'id',
      targetKey: 'id'
    })
    Role.hasMany(models.RoleMessage, {
      foreignKey: {
        name: 'roleId',
        allowNull: false
      }
    })
    Role.hasMany(models.RoleBinding, {
      foreignKey: {
        name: 'roleId',
        allowNull: false
      }
    })
    Role.belongsToMany(models.Member, {
      through: 'members_roles',
      sourceKey: 'id',
      targetKey: 'id'
    })
    Role.hasMany(models.PermissionOverwrite, {
      foreignKey: 'roleId',
      as: 'permissionOverwrites'
    })
  }

  Role.loadScopes = models => {
    Role.addScope('defaultScope', {
      include: [{
        model: models.PermissionOverwrite,
        as: 'permissionOverwrites'
      }]
    })
  }

  return Role
}
