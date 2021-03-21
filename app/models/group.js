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
      values: Object.values(GroupTypes)
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
    Group.hasMany(models.Permission, {
      foreignKey: 'groupId',
      as: 'permissions'
    })
  }

  Group.loadScopes = models => {
    Group.addScope('defaultScope', {
      include: [{
        model: models.Channel,
        as: 'channels',
        attributes: ['id']
      }, {
        model: models.Role,
        as: 'roles',
        attributes: ['id']
      }, {
        model: models.Permission,
        as: 'permissions'
      }]
    })
  }

  return Group
}
