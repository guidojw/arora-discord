'use strict'
module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['role', 'channel']
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
      through: models.GroupPermission,
      sourceKey: 'id',
      targetKey: 'name',
      as: 'permissions'
    })
    Group.hasMany(models.ChannelGroup, {
      foreignKey: {
        name: 'groupId',
        primaryKey: true
      },
      as: 'channels'
    })
    Group.belongsToMany(models.Role, {
      through: models.RoleGroup,
      sourceKey: 'id',
      targetKey: 'id',
      as: 'roles'
    })
  }

  Group.loadScopes = models => {
    Group.addScope('defaultScope', {
      include: [{
        model: models.Permission,
        as: 'permissions'
      }, {
        model: models.ChannelGroup,
        as: 'channels',
        attributes: ['channelId']
      }, {
        model: models.Role,
        as: 'roles'
      }],
      subQuery: false
    })
  }

  return Group
}
