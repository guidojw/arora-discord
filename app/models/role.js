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
    Role.belongsToMany(models.Permission, {
      through: 'roles_permissions',
      sourceKey: 'id',
      targetKey: 'name',
      as: 'permissions'
    })
    Role.belongsToMany(models.Group, {
      through: models.RoleGroup,
      sourceKey: 'id',
      targetKey: 'id'
    })
  }

  Role.loadScopes = models => {
    Role.addScope('defaultScope', {
      include: [{
        model: models.Permission,
        as: 'permissions'
      }],
      subQuery: false
    })
  }

  return Role
}
