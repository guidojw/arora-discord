'use strict'
module.exports = (sequelize, DataTypes) => {
  const RoleMessage = sequelize.define('RoleMessage', {
    emojiId: {
      type: DataTypes.STRING,
      primaryKey: true,
      field: 'emoji_id'
    },
    roleId: {
      type: DataTypes.STRING,
      primaryKey: true,
      field: 'role_id'
    },
    messageId: {
      type: DataTypes.STRING,
      primaryKey: true,
      field: 'message_id'
    }
  }, {
    tableName: 'roles_messages'
  })

  RoleMessage.associate = models => {
    RoleMessage.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        primaryKey: true
      },
      onDelete: 'CASCADE'
    })
  }

  return RoleMessage
}
