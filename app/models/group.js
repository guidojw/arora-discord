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
      targetKey: 'name'
    })
    Group.hasMany(models.ChannelGroup, {
      foreignKey: {
        name: 'groupId',
        primaryKey: true
      }
    })
    Group.hasMany(models.RoleGroup, {
      foreignKey: {
        name: 'groupId',
        primaryKey: true
      }
    })
  }

  return Group
}
