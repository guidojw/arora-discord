'use strict'
const { GroupTypes } = require('../util/constants')

module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: GroupTypes
    },
    guarded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'groups'
  })

  Group.associate = models => {
    Group.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
    Group.belongsToMany(models.Permission, {
      through: 'groups_permissions',
      sourceKey: 'id',
      targetKey: 'name',
      as: 'permissions'
    })
    Group.belongsToMany(models.Channel, {
      through: 'channels_groups',
      sourceKey: 'id',
      targetKey: 'id',
      as: 'channels'
    })
    Group.belongsToMany(models.Role, {
      through: 'roles_groups',
      sourceKey: 'id',
      targetKey: 'id',
      as: 'roles'
    })
    Group.hasMany(models.PermissionOverwrite, {
      foreignKey: 'groupId',
      as: 'permissionOverwrites'
    })
  }

  Group.loadScopes = models => {
    Group.addScope('defaultScope', {
      include: [{
        model: models.Permission,
        as: 'permissions'
      }, {
        model: models.Channel,
        as: 'channels'
      }, {
        model: models.Role,
        as: 'roles'
      }, {
        model: models.PermissionOverwrite,
        as: 'permissionOverwrites'
      }],
      subQuery: false
    })
  }

  return Group
}
